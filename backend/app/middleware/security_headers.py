"""
HTTP Security Headers Middleware for FastAPI.

Adds standard defensive headers recommended by OWASP:
- X-Content-Type-Options: Prevents MIME-sniffing
- X-Frame-Options: Protects against Clickjacking
- X-XSS-Protection: Cross-site scripting filter
- Referrer-Policy: Prevents leaking sensitive URL paths in referrers
- Strict-Transport-Security (HSTS): Enforces HTTPS
- Permissions-Policy: Disables unused hardware APIs (camera, mic, geolocation)
- Content-Security-Policy: Restricts execution of unauthorized scripts and embeds
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)

        # OWASP recommended security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(), payment=()"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"

        # Frame ancestors protection in CSP
        if "Content-Security-Policy" not in response.headers:
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "frame-ancestors 'none'; "
                "object-src 'none'; "
                "base-uri 'self';"
            )

        return response
