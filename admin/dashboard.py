"""
Kompete — Admin Dashboard
Streamlit app that calls the backend /admin/* endpoints.

Run with:
    streamlit run admin/dashboard.py
"""

import streamlit as st
import requests
import pandas as pd
from datetime import datetime
import time

# ── Page config ────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Kompete Admin",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ─────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    /* Dark background */
    .stApp { background-color: #0f172a; color: #e2e8f0; }

    /* Sidebar */
    [data-testid="stSidebar"] { background: #1e293b; border-right: 1px solid #334155; }
    [data-testid="stSidebar"] * { color: #cbd5e1 !important; }

    /* Metric cards */
    [data-testid="stMetric"] {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 18px 20px;
    }
    [data-testid="stMetricValue"] { color: #60a5fa !important; font-size: 2rem !important; }
    [data-testid="stMetricLabel"] { color: #94a3b8 !important; font-size: 0.85rem !important; }

    /* Headings */
    h1, h2, h3 { color: #f1f5f9 !important; }

    /* Dataframe */
    .stDataFrame { border-radius: 10px; overflow: hidden; }

    /* Expander */
    [data-testid="stExpander"] { background: #1e293b; border: 1px solid #334155; border-radius: 10px; }

    /* Input */
    input, .stTextInput input { background: #1e293b !important; color: #e2e8f0 !important;
                                border: 1px solid #334155 !important; border-radius: 8px !important; }

    /* Button */
    .stButton > button { background: #3b82f6; color: white; border: none;
                         border-radius: 8px; font-weight: 600; padding: 8px 20px; }
    .stButton > button:hover { background: #2563eb; }

    /* Status badge helpers (rendered via HTML) */
    .badge-green  { background:#16a34a22; color:#4ade80; border:1px solid #16a34a55;
                    border-radius:6px; padding:2px 10px; font-size:0.78rem; font-weight:600; }
    .badge-yellow { background:#ca8a0422; color:#fbbf24; border:1px solid #ca8a0455;
                    border-radius:6px; padding:2px 10px; font-size:0.78rem; font-weight:600; }
    .badge-red    { background:#dc262622; color:#f87171; border:1px solid #dc262655;
                    border-radius:6px; padding:2px 10px; font-size:0.78rem; font-weight:600; }
    .uid-mono     { font-family: monospace; font-size: 0.8rem; color: #94a3b8; }
</style>
""", unsafe_allow_html=True)


# ── Sidebar — connection settings ─────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🛡️ Kompete Admin")
    st.markdown("---")
    backend_url = st.text_input(
        "Backend URL",
        value="http://localhost:8000",
        help="Base URL of the Kompete FastAPI backend",
    )
    admin_secret = st.text_input(
        "Admin Secret",
        type="password",
        value="kompete-super-secret-2026",
        help="Value of ADMIN_SECRET in config.properties",
    )
    auto_refresh = st.toggle("Auto-refresh (30 s)", value=False)
    st.markdown("---")
    st.markdown(
        "<small style='color:#475569'>Built for Kompete · AI Agent Olympics 2026</small>",
        unsafe_allow_html=True,
    )

HEADERS = {"X-Admin-Secret": admin_secret}


# ── Helpers ────────────────────────────────────────────────────────────────────
def fetch(path: str) -> dict | list | None:
    try:
        r = requests.get(f"{backend_url.rstrip('/')}{path}", headers=HEADERS, timeout=10)
        if r.status_code == 403:
            st.error("❌ Forbidden — check your Admin Secret.")
            return None
        r.raise_for_status()
        return r.json()
    except requests.exceptions.ConnectionError:
        st.error(f"❌ Cannot connect to backend at **{backend_url}**. Is it running?")
        return None
    except Exception as e:
        st.error(f"❌ Request failed: {e}")
        return None


def fmt_date(iso: str) -> str:
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        return dt.strftime("%d %b %Y, %H:%M")
    except Exception:
        return iso or "—"


def tier_badge(has_key: bool) -> str:
    if has_key:
        return '<span class="badge-green">BYOK</span>'
    return '<span class="badge-yellow">Free</span>'


# ── Main content ───────────────────────────────────────────────────────────────
st.markdown("# 🛡️ Kompete Admin Dashboard")
st.markdown(f"<small style='color:#475569'>Endpoint: <code>{backend_url}</code></small>", unsafe_allow_html=True)
st.markdown("---")

# Refresh button
col_refresh, col_spacer = st.columns([1, 9])
with col_refresh:
    refreshed = st.button("🔄 Refresh")

if auto_refresh:
    time.sleep(0.1)  # let the UI paint before sleeping
    st.rerun() if not refreshed else None

# ── Fetch data ─────────────────────────────────────────────────────────────────
with st.spinner("Fetching data from backend…"):
    stats_data = fetch("/admin/stats")
    users_data = fetch("/admin/users")

if stats_data is None or users_data is None:
    st.stop()

users: list[dict] = users_data.get("users", [])

# ── KPI Cards ─────────────────────────────────────────────────────────────────
st.markdown("### 📊 Platform Overview")
c1, c2, c3, c4 = st.columns(4)
c1.metric("👥 Total Users", stats_data.get("total_users", 0))
c2.metric("📄 Total Reports", stats_data.get("total_reports", 0))
c3.metric("🔑 BYOK Users", stats_data.get("users_with_api_key", 0))
c4.metric("🆓 Free-Tier Users", stats_data.get("users_on_free_tier", 0))

st.markdown("")

# ── Mini bar chart: reports per user (top 10) ─────────────────────────────────
if users:
    st.markdown("### 📈 Reports per User (top 10)")
    chart_df = (
        pd.DataFrame(users)
        .sort_values("report_count", ascending=False)
        .head(10)
        .rename(columns={"user_id": "User ID", "report_count": "Reports"})
    )
    # Truncate long UIDs for chart labels
    chart_df["User ID"] = chart_df["User ID"].str[:14] + "…"
    st.bar_chart(chart_df.set_index("User ID")["Reports"])

st.markdown("---")

# ── Users table ───────────────────────────────────────────────────────────────
st.markdown(f"### 👥 All Users &nbsp; <small style='color:#64748b'>({len(users)} total)</small>", unsafe_allow_html=True)

# Search / filter
search = st.text_input("🔍 Filter by User ID", placeholder="Start typing a UID…")
if search:
    users = [u for u in users if search.lower() in u["user_id"].lower()]

if not users:
    st.info("No users match your filter.")
else:
    # Build display dataframe
    rows = []
    for u in users:
        display = u.get("name") or u.get("email") or u["user_id"]
        rows.append({
            "Name": u.get("name") or "—",
            "Email": u.get("email") or "—",
            "User ID": u["user_id"],
            "Reports": u["report_count"],
            "Tier": "BYOK ✅" if u["has_api_key"] else "Free ⚡",
            "Last Active": fmt_date(u.get("last_active", "")),
        })

    df = pd.DataFrame(rows)

    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Name": st.column_config.TextColumn("Name", width="medium"),
            "Email": st.column_config.TextColumn("Email", width="large"),
            "User ID": st.column_config.TextColumn("User ID", width="large"),
            "Reports": st.column_config.NumberColumn("Reports", format="%d 📄"),
            "Tier": st.column_config.TextColumn("Tier", width="small"),
            "Last Active": st.column_config.TextColumn("Last Active"),
        },
    )

    st.markdown("---")

    # ── Drilldown: per-user reports ────────────────────────────────────────────
    st.markdown("### 🔍 User Drilldown")
    uid_options = [u["user_id"] for u in users]
    uid_labels  = [
        f"{u.get('name') or u.get('email') or u['user_id'][:16]} ({u['user_id'][:10]}…)"
        for u in users
    ]
    selected_idx = st.selectbox(
        "Select a user to inspect their reports",
        range(len(uid_options)),
        format_func=lambda i: uid_labels[i],
    )
    selected_uid = uid_options[selected_idx] if uid_options else None

    if selected_uid:
        with st.spinner(f"Loading reports for `{selected_uid}`…"):
            detail = fetch(f"/admin/users/{requests.utils.quote(selected_uid, safe='')}/reports")

        if detail:
            reports = detail.get("reports", [])
            if not reports:
                st.info(f"No reports found for `{selected_uid}`.")
            else:
                st.markdown(f"**{len(reports)} report(s)** for `{selected_uid}`")
                for rpt in reports:
                    company = rpt.get("company", "unknown").title()
                    created = fmt_date(rpt.get("created_at", ""))
                    report_obj = rpt.get("report", {})
                    sentiment = report_obj.get("sentiment_score", "N/A")
                    summary = report_obj.get("executive_summary", "No summary available.")

                    # Colour the sentiment
                    try:
                        s_val = float(sentiment)
                        if s_val >= 7:
                            scolor = "#4ade80"
                        elif s_val <= 4:
                            scolor = "#f87171"
                        else:
                            scolor = "#fbbf24"
                    except Exception:
                        scolor = "#94a3b8"

                    with st.expander(f"🏢 **{company}** — {created}"):
                        col_a, col_b = st.columns([1, 5])
                        with col_a:
                            st.markdown(
                                f"<div style='text-align:center'>"
                                f"<div style='font-size:2rem;font-weight:800;color:{scolor}'>{sentiment}</div>"
                                f"<div style='font-size:0.7rem;color:#64748b'>Sentiment</div>"
                                f"</div>",
                                unsafe_allow_html=True,
                            )
                        with col_b:
                            st.markdown(f"**Executive Summary**")
                            st.markdown(f"<small style='color:#94a3b8'>{summary}</small>", unsafe_allow_html=True)

                        # SWOT preview
                        swot = report_obj.get("swot", {})
                        if swot:
                            s1, s2, s3, s4 = st.columns(4)
                            for col, key, icon, color in [
                                (s1, "strengths",     "💪", "#4ade80"),
                                (s2, "weaknesses",    "⚠️",  "#fbbf24"),
                                (s3, "opportunities", "🚀", "#60a5fa"),
                                (s4, "threats",       "🔥", "#f87171"),
                            ]:
                                items = swot.get(key, [])
                                with col:
                                    st.markdown(f"<div style='color:{color};font-weight:700;font-size:0.8rem'>{icon} {key.upper()}</div>", unsafe_allow_html=True)
                                    for item in items[:3]:
                                        st.markdown(f"<div style='font-size:0.78rem;color:#cbd5e1'>• {item}</div>", unsafe_allow_html=True)
