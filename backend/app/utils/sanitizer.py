"""
Input sanitization and XSS defense utilities.

Prevents stored and reflected Cross-Site Scripting (XSS) by stripping dangerous
HTML tags, inline event handlers, and malicious pseudo-protocols from user input.
"""
import re
from typing import Any, Optional, Union

# Pattern matching dangerous HTML tags and their contents
TAG_RE = re.compile(
    r"<\s*(script|iframe|object|embed|applet|style|meta|link|base|form|svg)[\s\S]*?>[\s\S]*?<\s*/\s*\1\s*>|"
    r"<\s*(script|iframe|object|embed|applet|style|meta|link|base|form|svg)[\s\S]*?/?>|"
    r"<\s*!\[CDATA\[[\s\S]*?\]\]>|"
    r"<!--[\s\S]*?-->|"
    r"<[^>]+>",
    re.IGNORECASE,
)

# Pattern matching inline event handlers (onerror=, onclick=, onload=)
EVENT_HANDLER_RE = re.compile(
    r"\bon[a-zA-Z]+\s*=\s*(?:'[^']*'|\"[^\"]*\"|[^\s>]+)",
    re.IGNORECASE,
)

# Pattern matching dangerous URL protocols (javascript:, data:text/html, vbscript:)
DANGEROUS_PROTOCOLS_RE = re.compile(
    r"^\s*(javascript|vbscript|data\s*:\s*text/html)\s*:",
    re.IGNORECASE,
)


def sanitize_text(val: Optional[str]) -> Optional[str]:
    """Sanitize a text string to strip all executable HTML, scripts, and XSS vectors."""
    if val is None:
        return None
    if not isinstance(val, str):
        return str(val)

    # 1. Strip null bytes
    cleaned = val.replace("\x00", "")

    # 2. Check and disallow dangerous protocols
    if DANGEROUS_PROTOCOLS_RE.search(cleaned):
        cleaned = DANGEROUS_PROTOCOLS_RE.sub("", cleaned)

    # 3. Strip inline event handlers
    cleaned = EVENT_HANDLER_RE.sub("", cleaned)

    # 4. Strip dangerous HTML tags
    cleaned = TAG_RE.sub("", cleaned)

    return cleaned.strip()


def sanitize_url(url: Optional[str]) -> Optional[str]:
    """Validate and sanitize URLs (e.g. linkedin, github, meeting links)."""
    if not url:
        return None

    cleaned = url.strip()
    # Reject javascript: or data: protocols
    if DANGEROUS_PROTOCOLS_RE.search(cleaned):
        return None

    # Must start with http:// or https:// if provided
    if cleaned and not (cleaned.startswith("http://") or cleaned.startswith("https://")):
        cleaned = f"https://{cleaned}"

    return cleaned


def sanitize_data(data: Union[dict, list, str, Any]) -> Any:
    """Recursively sanitize dicts, lists, and strings."""
    if isinstance(data, dict):
        return {k: sanitize_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_data(item) for item in data]
    elif isinstance(data, str):
        return sanitize_text(data)
    return data
