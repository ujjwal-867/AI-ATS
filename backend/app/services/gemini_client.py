import json
import logging
import requests

from app.config import settings

logger = logging.getLogger(__name__)

# Fallback sequence of models available for this API key tier
MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
]


def generate_content(prompt: str, system_instruction: str = None, timeout: int = 30) -> str:
    """
    Robust Gemini caller using HTTPS REST with automatic model fallbacks.
    Avoids gRPC LibreSSL compatibility issues on macOS/Python 3.9 and handles 503 capacity spikes.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    last_error = None

    for model in MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        try:
            response = requests.post(url, json=payload, timeout=timeout)
            if response.status_code == 200:
                data = response.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "").strip()
            else:
                last_error = f"Model {model} returned {response.status_code}: {response.text[:200]}"
                logger.warning(last_error)
        except Exception as e:
            last_error = f"Model {model} connection error: {e}"
            logger.warning(last_error)

    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")
