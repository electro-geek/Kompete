"""
Kompete — agents.py
Four parallel Gemini research agents + a final SWOT synthesis step.
"""

from __future__ import annotations

import asyncio
import json
import re
import logging
import warnings
from typing import AsyncGenerator

# Suppress all future warnings and deprecation warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=DeprecationWarning)

from google import genai
from google.genai import types

from config import (
    GEMINI_API_KEY,
    GEMINI_MODEL,
    GEMINI_TEMPERATURE,
    GEMINI_MAX_OUTPUT_TOKENS,
    RESEARCH_TIMEOUT_SECONDS,
)

logger = logging.getLogger(__name__)

# ── Gemini SDK client configuration ────────────────────────────────────────────
client = genai.Client(api_key=GEMINI_API_KEY)

_SAFETY_SETTINGS = [
    types.SafetySetting(
        category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold=types.HarmBlockThreshold.BLOCK_NONE,
    ),
    types.SafetySetting(
        category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold=types.HarmBlockThreshold.BLOCK_NONE,
    ),
    types.SafetySetting(
        category=types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold=types.HarmBlockThreshold.BLOCK_NONE,
    ),
    types.SafetySetting(
        category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold=types.HarmBlockThreshold.BLOCK_NONE,
    ),
]


# ── Individual research agents ─────────────────────────────────────────────────

async def _run_agent(prompt: str, use_search: bool = True, response_mime_type: str | None = None, api_key: str | None = None) -> str:
    """Run a single Gemini call, optionally with Google Search grounding, with robust exponential backoff retry."""
    import random
    from google.genai import errors

    tools = [types.Tool(google_search=types.GoogleSearch())] if use_search else []
    
    config = types.GenerateContentConfig(
        temperature=GEMINI_TEMPERATURE,
        max_output_tokens=GEMINI_MAX_OUTPUT_TOKENS,
        safety_settings=_SAFETY_SETTINGS,
        tools=tools,
        response_mime_type=response_mime_type,
    )
    
    local_client = genai.Client(api_key=api_key) if api_key else client
    
    max_retries = 6
    backoff_factor = 2.0
    
    for attempt in range(1, max_retries + 1):
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: local_client.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=prompt,
                    config=config,
                ),
            )
            return response.text
        except errors.APIError as e:
            # Retry on rate limits (429), high-demand overload (503), or other server transients (500, 502, 504)
            if e.code in (429, 503, 500, 502, 504) or "overload" in str(e).lower() or "quota" in str(e).lower() or "demand" in str(e).lower():
                if attempt == max_retries:
                    logger.error(f"❌ Max retries reached for Gemini call. Failing on: {e}")
                    if e.code == 429 or "quota" in str(e).lower():
                        raise ValueError("quota_exceeded")
                    raise e
                
                sleep_time = (backoff_factor ** attempt) + random.uniform(0.5, 1.5)
                logger.warning(
                    f"⚠️ Gemini API returned {e.code} ({e.message if hasattr(e, 'message') else str(e)}). "
                    f"Retrying in {sleep_time:.2f}s (Attempt {attempt}/{max_retries})..."
                )
                await asyncio.sleep(sleep_time)
            else:
                logger.error(f"❌ Gemini API returned non-retryable error {e.code}: {e}")
                raise e
        except Exception as e:
            if attempt == max_retries:
                logger.error(f"❌ Max retries reached on unexpected exception. Failing on: {e}")
                raise e
            
            sleep_time = (backoff_factor ** attempt) + random.uniform(0.5, 1.5)
            logger.warning(
                f"⚠️ Unexpected error calling Gemini: {e}. "
                f"Retrying in {sleep_time:.2f}s (Attempt {attempt}/{max_retries})..."
            )
            await asyncio.sleep(sleep_time)


async def research_news(company: str, api_key: str | None = None) -> dict:
    prompt = f"""You are a financial news researcher. Search the web and find the latest news about "{company}".

Focus on:
- Product launches and feature announcements (last 12 months)
- Leadership changes (CEO, CTO, board members)
- Controversies, lawsuits, or regulatory issues
- Key partnerships and acquisitions
- Major funding or IPO news

Return a JSON object with these exact keys:
{{
  "headlines": ["<headline with date>", ...],  // 5-8 most important headlines
  "product_news": "<2-3 sentence summary of recent product activity>",
  "leadership_news": "<1-2 sentence summary of any leadership changes>",
  "controversy": "<1-2 sentence summary of any controversies, or 'None identified'>",
  "data_sources": ["<URL or source name>", ...]
}}

Return ONLY valid JSON, no markdown fences."""

    text = await _run_agent(prompt, api_key=api_key)
    try:
        return json.loads(_clean_json(text))
    except Exception:
        logger.warning("News agent JSON parse failed, returning raw text")
        return {"raw": text, "data_sources": []}


async def research_financials(company: str, api_key: str | None = None) -> dict:
    prompt = f"""You are a financial analyst. Search the web and find financial data about "{company}".

Focus on:
- Annual revenue (most recent year available)
- Company valuation (public market cap or last private valuation)
- Total funding raised (for private companies)
- Revenue growth rate year-over-year
- Market share in their primary segment
- Number of customers or users
- Detailed funding history/rounds (Series A, B, Seed, etc.): round name, amount, date, lead and participating investors, and purpose/how they raised it.

Return a JSON object with these exact keys:
{{
  "revenue": "<e.g. $1.2B annual revenue (2024)>",
  "valuation": "<e.g. $10B valuation (Series D, 2024)>",
  "growth": "<e.g. 35% YoY growth>",
  "funding": "<e.g. $500M total raised>",
  "market_share": "<e.g. 23% in US productivity software>",
  "customers": "<e.g. 4 million paying customers>",
  "financial_summary": "<3-4 sentence narrative of the company's financial position>",
  "funding_history": [
    {{
      "round": "<e.g. Series C>",
      "amount": "<e.g. $120M>",
      "date": "<e.g. October 2024>",
      "investors": "<e.g. Sequoia Capital, Accel>",
      "details": "<e.g. Led by Sequoia Capital to expand global infrastructure and hire senior researchers>"
    }}
  ],
  "data_sources": ["<URL or source name>", ...]
}}

Return ONLY valid JSON, no markdown fences."""

    text = await _run_agent(prompt, api_key=api_key)
    try:
        return json.loads(_clean_json(text))
    except Exception:
        logger.warning("Financials agent JSON parse failed, returning raw text")
        return {"raw": text, "funding_history": [], "data_sources": []}


async def research_reviews(company: str, api_key: str | None = None) -> dict:
    prompt = f"""You are a customer sentiment analyst. Search G2, Trustpilot, Glassdoor, Reddit, and app stores for reviews and sentiment about "{company}".

Focus on:
- Overall sentiment score (1-10, where 10 is most positive)
- Common praise themes
- Common complaints and pain points
- Employee sentiment (from Glassdoor)
- Community discussions (Reddit)

Return a JSON object with these exact keys:
{{
  "sentiment_score": <number between 1-10>,
  "praise": ["<common praise theme>", ...],  // 3-5 items
  "complaints": ["<common complaint>", ...],  // 3-5 items
  "employee_sentiment": "<1-2 sentences about what employees say>",
  "community_buzz": "<1-2 sentences about Reddit/community discussion>",
  "review_summary": "<2-3 sentence overall sentiment summary>",
  "data_sources": ["<URL or source name>", ...]
}}

Return ONLY valid JSON, no markdown fences."""

    text = await _run_agent(prompt, api_key=api_key)
    try:
        return json.loads(_clean_json(text))
    except Exception:
        logger.warning("Reviews agent JSON parse failed, returning raw text")
        return {"raw": text, "sentiment_score": 5, "data_sources": []}


async def research_social(company: str, api_key: str | None = None) -> dict:
    prompt = f"""You are a social media and brand analyst. Search the web for "{company}"'s social media presence and brand perception.

Focus on:
- LinkedIn following and activity
- Twitter/X following and engagement patterns
- Recent marketing campaigns or viral moments
- Overall brand positioning
- Competitor comparisons in social conversations
- Influencer or press coverage

Return a JSON object with these exact keys:
{{
  "linkedin_followers": "<e.g. 2.3M followers>",
  "twitter_followers": "<e.g. 800K followers>",
  "social_activity": "<1-2 sentences about recent social media activity>",
  "brand_perception": "<2-3 sentences about overall brand perception>",
  "recent_campaigns": ["<campaign or viral moment>", ...],  // 2-4 items
  "press_coverage": "<1-2 sentences about recent press>",
  "data_sources": ["<URL or source name>", ...]
}}

Return ONLY valid JSON, no markdown fences."""

    text = await _run_agent(prompt)
    try:
        return json.loads(_clean_json(text))
    except Exception:
        logger.warning("Social agent JSON parse failed, returning raw text")
        return {"raw": text, "data_sources": []}


# ── Synthesis agent ────────────────────────────────────────────────────────────

async def synthesize_report(
    company: str,
    news: dict,
    financials: dict,
    reviews: dict,
    social: dict,
    api_key: str | None = None,
) -> dict:
    prompt = f"""You are a senior competitive intelligence analyst. Based on the following research data about "{company}", produce a comprehensive competitive intelligence report.

## Research Data

### News Research
{json.dumps(news, indent=2)}

### Financial Research
{json.dumps(financials, indent=2)}

### Customer Reviews & Sentiment
{json.dumps(reviews, indent=2)}

### Social Media & Brand
{json.dumps(social, indent=2)}
## Your Task

Synthesize all this data into a structured report. Return a JSON object with EXACTLY these keys. Keep all description texts, strengths, weaknesses, opportunities, threats, insights, and recommendations extremely concise, dense, and punchy (max 1 sentence or 15 words per bullet). Avoid long-winded paragraphs.

{{
  "company": "{company}",
  "executive_summary": "<3-4 sentence concise overview of the company's current competitive position, financial health, and market standing>",
  "swot": {{
    "strengths": [
      "<specific strength (max 15 words)>",
      "<specific strength (max 15 words)>",
      "<specific strength (max 15 words)>",
      "<specific strength (max 15 words)>"
    ],
    "weaknesses": [
      "<specific weakness (max 15 words)>",
      "<specific weakness (max 15 words)>",
      "<specific weakness (max 15 words)>",
      "<specific weakness (max 15 words)>"
    ],
    "opportunities": [
      "<market opportunity (max 15 words)>",
      "<market opportunity (max 15 words)>",
      "<market opportunity (max 15 words)>",
      "<market opportunity (max 15 words)>"
    ],
    "threats": [
      "<competitive/market threat (max 15 words)>",
      "<competitive/market threat (max 15 words)>",
      "<competitive/market threat (max 15 words)>",
      "<competitive/market threat (max 15 words)>"
    ]
  }},
  "financial_snapshot": {{
    "revenue": "<revenue figure from financial data>",
    "valuation": "<valuation figure>",
    "growth": "<growth rate>",
    "funding": "<total funding>"
  }},
  "funding_history": [
    {{
      "round": "<round, e.g. Series C>",
      "amount": "<amount, e.g. $120M>",
      "date": "<date, e.g. October 2024>",
      "investors": "<investors, e.g. Sequoia Capital, Accel>",
      "details": "<concise description of why/how they secured it, max 15 words>"
    }}
  ],
  "sentiment_score": <number 1-10 from reviews data>,
  "strategic_moves": [
    "<recent strategic move, deal, or important decision (max 20 words)>",
    "<recent strategic move, deal, or important decision (max 20 words)>",
    "<recent strategic move, deal, or important decision (max 20 words)>"
  ],
  "key_insights": [
    "<concise strategic insight 1 (max 20 words)>",
    "<concise strategic insight 2 (max 20 words)>",
    "<concise strategic insight 3 (max 20 words)>",
    "<concise strategic insight 4 (max 20 words)>",
    "<concise strategic insight 5 (max 20 words)>"
  ],
  "strategic_recommendations": [
    "<actionable recommendation (max 20 words)>",
    "<actionable recommendation (max 20 words)>",
    "<actionable recommendation (max 20 words)>"
  ],
  "competitive_threats": [
    "<threat to competitors (max 20 words)>",
    "<threat to competitors (max 20 words)>",
    "<threat to competitors (max 20 words)>"
  ],
  "data_sources": ["<all URLs and sources from all four research agents combined>"]
}}

Be specific and evidence-backed. Reference actual data points from the research. Do NOT use generic platitudes.
Return ONLY valid JSON, no markdown fences."""

    text = await _run_agent(prompt, use_search=False, response_mime_type="application/json", api_key=api_key)
    try:
        result = json.loads(_clean_json(text))
        # Ensure sentiment_score is an int
        result["sentiment_score"] = int(result.get("sentiment_score", reviews.get("sentiment_score", 5)))
        return result
    except Exception as e:
        logger.error(f"Synthesis JSON parse failed: {e}")
        raise ValueError(f"Failed to parse synthesis output: {e}") from e


# ── Main pipeline ──────────────────────────────────────────────────────────────

async def run_research_pipeline(
    company: str,
    progress_callback: callable = None,
    api_key: str | None = None,
) -> dict:
    """
    Run all four research agents in parallel, then synthesize.
    progress_callback(event: str) is called after each stage completes.
    """

    async def _notify(event: str):
        if progress_callback:
            try:
                await progress_callback(event)
            except Exception:
                pass

    await _notify("started")

    async def _news_with_notify():
        result = await research_news(company, api_key=api_key)
        await _notify("news_done")
        return result

    async def _financials_with_notify():
        result = await research_financials(company, api_key=api_key)
        await _notify("financials_done")
        return result

    async def _reviews_with_notify():
        result = await research_reviews(company, api_key=api_key)
        await _notify("reviews_done")
        return result

    async def _social_with_notify():
        result = await research_social(company, api_key=api_key)
        await _notify("social_done")
        return result

    # Run all four agents sequentially to respect the free-tier 5 RPM rate limit
    async def _run_sequentially():
        n = await _news_with_notify()
        await asyncio.sleep(2) # small cooldown pause between requests
        f = await _financials_with_notify()
        await asyncio.sleep(2)
        r = await _reviews_with_notify()
        await asyncio.sleep(2)
        s = await _social_with_notify()
        return n, f, r, s

    news, financials, reviews, social = await asyncio.wait_for(
        _run_sequentially(),
        timeout=RESEARCH_TIMEOUT_SECONDS,
    )

    await _notify("synthesizing")

    report = await synthesize_report(company, news, financials, reviews, social, api_key=api_key)

    await _notify("synthesis_done")

    return report


# ── Helpers ────────────────────────────────────────────────────────────────────

def _clean_json(text: str) -> str:
    """Strip markdown code fences and automatically repair truncated JSON strings."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()
    
    # If the text is empty, return a valid empty object
    if not text:
        return "{}"
        
    # Attempt to load directly first
    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        pass
        
    # If standard loading fails, attempt a state-machine repair for truncated content
    in_string = False
    escape = False
    stack = []
    repaired = []
    
    for char in text:
        repaired.append(char)
        if escape:
            escape = False
            continue
        if char == '\\':
            escape = True
            continue
        if char == '"':
            in_string = not in_string
            continue
            
        if not in_string:
            if char == '{':
                stack.append('}')
            elif char == '[':
                stack.append(']')
            elif char == '}':
                if stack and stack[-1] == '}':
                    stack.pop()
            elif char == ']':
                if stack and stack[-1] == ']':
                    stack.pop()

    # If we got truncated inside a string literal, close it first
    if in_string:
        if repaired and repaired[-1] == '\\':
            repaired.pop()
        repaired.append('"')
        
    # Pop open elements and append their closing matches in reverse order
    while stack:
        close_char = stack.pop()
        temp_str = "".join(repaired).strip()
        if temp_str.endswith(','):
            while repaired and repaired[-1] in (' ', '\n', '\r', '\t', ','):
                if repaired[-1] == ',':
                    repaired.pop()
                    break
                repaired.pop()
        repaired.append(close_char)
        
    final_json = "".join(repaired)
    
    # Final check: let's verify if we successfully repaired it
    try:
        json.loads(final_json)
        return final_json
    except json.JSONDecodeError:
        # If it's still broken, log a warning and return the repaired string anyway as a last attempt
        logger.warning("Repaired JSON is still not valid, returning best-effort string")
        return final_json
