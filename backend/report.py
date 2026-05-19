"""
Kompete — report.py
WeasyPrint PDF generation from a Jinja2 template.
"""

from __future__ import annotations

import logging
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).parent / "templates"

_jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(["html"]),
)


def generate_pdf(report: dict) -> bytes:
    """
    Render report data into a PDF and return the raw bytes.
    Uses the Jinja2 template at templates/report_pdf.html.
    """
    template = _jinja_env.get_template("report_pdf.html")
    html_content = template.render(report=report)

    font_config = FontConfiguration()
    html_obj = HTML(string=html_content, base_url=str(TEMPLATES_DIR))
    pdf_bytes = html_obj.write_pdf(font_config=font_config)

    logger.info(f"Generated PDF for {report.get('company', 'unknown')} ({len(pdf_bytes)} bytes)")
    return pdf_bytes
