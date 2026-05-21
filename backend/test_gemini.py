#!/usr/bin/env python3
"""
Kompete — test_gemini.py
A dummy script to test the Gemini GenAI SDK and Google Search Grounding tool
using the configured API key from your local environment.
"""

import os
import sys

# Ensure backend directory is in path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("❌ Error: google-genai package is not installed.")
    print("Please install it in your virtualenv using: pip install google-genai")
    sys.exit(1)

try:
    from config import GEMINI_API_KEY, GEMINI_MODEL
except ImportError:
    # Fallback direct .env lookup if imported outside backend
    from dotenv import load_dotenv
    load_dotenv()
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = "gemini-2.5-flash"

def main():
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        print("❌ Error: GEMINI_API_KEY is missing or contains the default placeholder.")
        print("Please update backend/.env or backend/config.properties with your actual key.")
        sys.exit(1)

    print("==================================================")
    print("⚡ Gemini API Connectivity & Tooling Verification ⚡")
    print("==================================================")
    
    # Securely mask API key in output
    masked_key = GEMINI_API_KEY[:6] + "..." + GEMINI_API_KEY[-4:] if len(GEMINI_API_KEY) > 10 else "Invalid format"
    print(f"⚙️  Model:   {GEMINI_MODEL}")
    print(f"🔑  API Key: {masked_key}")
    print("--------------------------------------------------")

    try:
        print("🚀 Initializing GenAI Client...")
        client = genai.Client(api_key=GEMINI_API_KEY)

        # 1. Test basic text generation
        print("\n📝 Test 1: Simple Generation Request...")
        prompt = "Provide a 1-sentence punchy tagline for an AI company research tool named Kompete."
        print(f"👉 Prompt: \"{prompt}\"")
        
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
        
        print("\n✅ Success! Gemini response:")
        print(">>>", response.text.strip())
        print("--------------------------------------------------")

        # 2. Test Google Search Grounding (Crucial for Kompete's research agents!)
        print("\n🔍 Test 2: Live Google Search Grounding Request...")
        search_prompt = "What are the latest funding rounds or key leadership changes announced by SpaceX in the last few months?"
        print(f"👉 Prompt: \"{search_prompt}\"")
        
        search_response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=search_prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
        )
        
        print("\n✅ Success! Grounded Search response:")
        print(">>>", search_response.text.strip())
        
        # Check if sources are cited
        candidates = search_response.candidates
        if candidates and hasattr(candidates[0], 'grounding_metadata') and candidates[0].grounding_metadata:
            sources = candidates[0].grounding_metadata.web_sources
            if sources:
                print("\n🔗 Grounding sources cited by Gemini:")
                for src in sources[:3]:
                    title = getattr(src, 'title', 'No Title')
                    uri = getattr(src, 'uri', 'No URI')
                    print(f"  - {title}: {uri}")

    except Exception as e:
        print(f"\n❌ Error during Gemini request: {e}")
        print("Verify your internet connection, billing status, or API quota.")
        sys.exit(1)

    print("\n==================================================")
    print("🎉 All systems green! Your Gemini setup is working perfectly.")
    print("==================================================")

if __name__ == "__main__":
    main()
