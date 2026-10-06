"""
Device and IP detection utilities for session audit and login logging.
"""
from typing import Dict, Any
from fastapi import Request


def get_client_ip(request: Request) -> str:
    """Extract real client IP address considering reverse proxies."""
    # Cloudflare / standard reverse proxy headers
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        # First IP in list is client's original IP
        parts = [p.strip() for p in forwarded_for.split(",") if p.strip()]
        if parts:
            return parts[0]

    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()

    if request.client and request.client.host:
        return request.client.host

    return "127.0.0.1"


def parse_user_agent(user_agent: str) -> Dict[str, str]:
    """Parse User-Agent string to extract human-readable device and browser."""
    if not user_agent:
        return {
            "device": "Unknown Device",
            "browser": "Unknown Browser",
        }

    ua = user_agent.lower()

    # Determine Device / Operating System
    if "iphone" in ua:
        device = "Mobile (iPhone)"
    elif "ipad" in ua:
        device = "Tablet (iPad)"
    elif "android" in ua and "mobile" in ua:
        device = "Mobile (Android)"
    elif "android" in ua:
        device = "Tablet (Android)"
    elif "macintosh" in ua or "mac os x" in ua:
        device = "Desktop (macOS)"
    elif "windows nt" in ua or "win64" in ua or "wow64" in ua:
        device = "Desktop (Windows)"
    elif "linux" in ua:
        device = "Desktop (Linux)"
    elif "postman" in ua:
        device = "API Client (Postman)"
    elif "curl" in ua:
        device = "CLI (cURL)"
    else:
        device = "Desktop / Web Client"

    # Determine Browser
    if "edg/" in ua or "edge/" in ua:
        browser = "Microsoft Edge"
    elif "opr/" in ua or "opera" in ua:
        browser = "Opera"
    elif "chrome" in ua and "safari" in ua:
        browser = "Google Chrome"
    elif "safari" in ua and "chrome" not in ua:
        browser = "Apple Safari"
    elif "firefox" in ua:
        browser = "Mozilla Firefox"
    elif "postman" in ua:
        browser = "Postman"
    elif "curl" in ua:
        browser = "cURL"
    else:
        browser = "Web Browser"

    return {
        "device": device,
        "browser": browser,
    }


def get_request_metadata(request: Request) -> Dict[str, str]:
    """Extract full client metadata from HTTP request."""
    user_agent = request.headers.get("user-agent", "")
    ip_address = get_client_ip(request)
    parsed = parse_user_agent(user_agent)

    return {
        "ip_address": ip_address,
        "user_agent": user_agent[:500] if user_agent else "",
        "device": parsed["device"],
        "browser": parsed["browser"],
    }
