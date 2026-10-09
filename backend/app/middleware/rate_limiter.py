"""
In-memory sliding-window rate limiting middleware for FastAPI.

Protects against:
- Brute-force credential stuffing attacks (/api/auth/login)
- Account creation spam (/api/auth/register)
- Denial of Service (DoS) and quota exhaustion (/api/upload, /api/agent)
"""
import time
from collections import defaultdict
from threading import Lock
from typing import Dict, List, Tuple
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.utils.device_detector import get_client_ip


class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # Store: (client_ip, route_key) -> list of timestamp floats
        self._history: Dict[Tuple[str, str], List[float]] = defaultdict(list)
        self._lock = Lock()
        self._last_cleanup = time.time()

        # Path prefix -> (max_requests, window_seconds)
        self._rules = {
            "/api/auth/login": (5, 60),      # 5 attempts per min
            "/api/auth/register": (5, 60),   # 5 attempts per min
            "/api/upload": (15, 60),         # 15 uploads per min
            "/api/agent": (25, 60),          # 25 agent calls per min
            "/api/candidates": (120, 60),    # 120 candidate calls per min
            "/api/jobs": (120, 60),          # 120 job calls per min
        }
        self._default_rule = (180, 60)       # 180 requests per min general limit

    def _get_rule_for_path(self, path: str) -> Tuple[int, int]:
        for prefix, rule in self._rules.items():
            if path.startswith(prefix):
                return rule
        return self._default_rule

    def _cleanup_old_records(self, now: float):
        """Purge entries older than 5 minutes to prevent memory leak."""
        if now - self._last_cleanup < 120:  # Cleanup every 2 minutes
            return

        self._last_cleanup = now
        stale_threshold = now - 300
        keys_to_delete = []

        for key, timestamps in self._history.items():
            valid = [t for t in timestamps if t > stale_threshold]
            if not valid:
                keys_to_delete.append(key)
            else:
                self._history[key] = valid

        for key in keys_to_delete:
            del self._history[key]

    async def dispatch(self, request: Request, call_next) -> Response:
        # Exempt health checks / static options preflights
        if request.method == "OPTIONS" or request.url.path in ["/", "/health", "/favicon.ico"]:
            return await call_next(request)

        path = request.url.path
        client_ip = get_client_ip(request)
        max_requests, window = self._get_rule_for_path(path)

        now = time.time()
        cutoff = now - window
        key = (client_ip, path)

        with self._lock:
            self._cleanup_old_records(now)

            # Filter timestamps within current window
            current_timestamps = [t for t in self._history[key] if t > cutoff]

            if len(current_timestamps) >= max_requests:
                oldest_in_window = current_timestamps[0]
                retry_after = max(1, int(window - (now - oldest_in_window)))

                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": f"Too many requests. Please slow down and try again in {retry_after} seconds.",
                        "retry_after": retry_after,
                    },
                    headers={
                        "Retry-After": str(retry_after),
                        "X-RateLimit-Limit": str(max_requests),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(retry_after),
                    },
                )

            # Append current request
            current_timestamps.append(now)
            self._history[key] = current_timestamps
            remaining = max_requests - len(current_timestamps)

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response
