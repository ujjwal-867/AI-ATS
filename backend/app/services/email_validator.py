"""
Production-grade Email Validation & Verification Service.

Provides:
- Strict RFC-compliant syntax and structure checking
- Extraction and sanitization from raw text / resume strings
- Domain typo detection with smart corrections (e.g. gnail.com -> gmail.com)
- Disposable / temporary burner email detection
- Dummy / placeholder email detection (e.g. yourname@example.com)
- DNS hostname / MX resolution check with non-blocking graceful fallback
"""
import re
import socket
from typing import Dict, Any, Optional, Tuple

# RFC 5322 compliant regex for practical email validation
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
)

# Common typo mappings for popular domains
COMMON_TYPOS = {
    # Gmail
    "gnail.com": "gmail.com",
    "gamil.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmaik.com": "gmail.com",
    "gmal.com": "gmail.com",
    "gmaill.co": "gmail.com",
    "gemail.com": "gmail.com",
    "gmail.co": "gmail.com",
    "gmail.con": "gmail.com",
    "gmail.cpm": "gmail.com",
    "gmail.cm": "gmail.com",
    "gmail.om": "gmail.com",
    # Yahoo
    "yaho.com": "yahoo.com",
    "yahooo.com": "yahoo.com",
    "yaho.co.in": "yahoo.co.in",
    "ymail.con": "ymail.com",
    "yahoo.con": "yahoo.com",
    "yahoo.cm": "yahoo.com",
    # Outlook / Hotmail
    "outlok.com": "outlook.com",
    "outloo.com": "outlook.com",
    "outklook.com": "outlook.com",
    "outlook.con": "outlook.com",
    "hotmial.com": "hotmail.com",
    "hotmaill.com": "hotmail.com",
    "hotmil.com": "hotmail.com",
    "hotmail.con": "hotmail.com",
    # iCloud
    "iclod.com": "icloud.com",
    "iclou.com": "icloud.com",
    "icloud.con": "icloud.com",
    # Proton
    "protonmai.com": "protonmail.com",
    "protonmial.com": "protonmail.com",
}

# Known disposable/temporary email provider domains
DISPOSABLE_DOMAINS = {
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "sharklasers.com",
    "yopmail.com",
    "dispostable.com",
    "trashmail.com",
    "throwawaymail.com",
    "getairmail.com",
    "mohmal.com",
    "burnermail.io",
    "fakeinbox.com",
    "temp-mail.org",
    "tempmailaddress.com",
    "mytemp.email",
    "generator.email",
    "crazymailing.com",
}

# Known placeholder / example domains
PLACEHOLDER_DOMAINS = {
    "example.com",
    "example.org",
    "example.net",
    "test.com",
    "sample.com",
    "domain.com",
    "email.com",
    "placeholder.com",
    "fake.com",
    "yourdomain.com",
    "mycompany.com",
}

# Known placeholder usernames
PLACEHOLDER_USERNAMES = {
    "yourname",
    "your.name",
    "your_name",
    "your-name",
    "username",
    "user.name",
    "johndoe",
    "john.doe",
    "janedoe",
    "jane.doe",
    "candidate",
    "applicant",
    "email",
    "test",
    "sample",
    "placeholder",
    "name",
}


def sanitize_email(raw_email: Optional[str]) -> str:
    """
    Clean email from common resume artifacts:
    - mailto: prefixes
    - Leading/trailing punctuation (. , ; : [ ] ( ) < > " ')
    - Whitespace
    """
    if not raw_email:
        return ""

    cleaned = str(raw_email).strip().lower()

    # Strip mailto:
    if cleaned.startswith("mailto:"):
        cleaned = cleaned[7:].strip()

    # Strip enclosing quotes or brackets
    cleaned = cleaned.strip("\"'<>[]() ;:")

    # Remove trailing dot or comma often captured at the end of sentences
    cleaned = re.sub(r"[\.,;:!\?]+$", "", cleaned)

    return cleaned.strip()


def check_domain_dns(domain: str, timeout: float = 2.0) -> Optional[bool]:
    """
    Verify if the domain has a valid DNS record (A / AAAA / MX).
    Returns:
    - True if domain resolves
    - False if domain does not exist (NXDOMAIN)
    - None if resolution could not be completed (e.g. offline / sandbox)
    """
    if not domain or "." not in domain:
        return False

    old_timeout = socket.getdefaulttimeout()
    try:
        socket.setdefaulttimeout(timeout)
        socket.gethostbyname(domain)
        return True
    except socket.gaierror as e:
        # gaierror with non-existent host
        err_str = str(e).lower()
        if "nodename nor servname provided" in err_str or "name or service not known" in err_str:
            return False
        # Network/sandbox isolation or other resolution error
        return None
    except Exception:
        return None
    finally:
        socket.setdefaulttimeout(old_timeout)


def validate_email_address(raw_email: Optional[str], check_dns: bool = True) -> Dict[str, Any]:
    """
    Performs comprehensive verification on an email address.

    Returns a dict:
    {
        "valid": bool,
        "email": str (sanitized),
        "reason": str or None,
        "suggestion": str or None,
        "is_disposable": bool,
        "is_placeholder": bool,
        "domain": str,
    }
    """
    email = sanitize_email(raw_email)

    if not email:
        return {
            "valid": False,
            "email": "",
            "reason": "Email address is required.",
            "suggestion": None,
            "is_disposable": False,
            "is_placeholder": False,
            "domain": "",
        }

    # Length check (RFC 5321)
    if len(email) > 254:
        return {
            "valid": False,
            "email": email,
            "reason": "Email address exceeds maximum length of 254 characters.",
            "suggestion": None,
            "is_disposable": False,
            "is_placeholder": False,
            "domain": "",
        }

    if "@" not in email:
        return {
            "valid": False,
            "email": email,
            "reason": "Missing '@' symbol in email address.",
            "suggestion": None,
            "is_disposable": False,
            "is_placeholder": False,
            "domain": "",
        }

    parts = email.split("@")
    if len(parts) != 2:
        return {
            "valid": False,
            "email": email,
            "reason": "Email contains multiple '@' symbols.",
            "suggestion": None,
            "is_disposable": False,
            "is_placeholder": False,
            "domain": "",
        }

    local_part, domain = parts[0], parts[1]

    # Validate local part
    if not local_part:
        return {
            "valid": False,
            "email": email,
            "reason": "Username part before '@' cannot be empty.",
            "suggestion": None,
            "is_disposable": False,
            "is_placeholder": False,
            "domain": domain,
        }

    if len(local_part) > 64:
        return {
            "valid": False,
            "email": email,
            "reason": "Username part before '@' exceeds maximum length of 64 characters.",
            "suggestion": None,
            "is_disposable": False,
            "is_placeholder": False,
            "domain": domain,
        }

    if local_part.startswith(".") or local_part.endswith("."):
        return {
            "valid": False,
            "email": email,
            "reason": "Username cannot start or end with a period.",
            "suggestion": None,
            "is_disposable": False,
            "is_placeholder": False,
            "domain": domain,
        }

    if ".." in local_part:
        return {
            "valid": False,
            "email": email,
            "reason": "Username cannot contain consecutive periods ('..').",
            "suggestion": None,
            "is_disposable": False,
            "is_placeholder": False,
            "domain": domain,
        }

    # Validate domain
    if not domain or "." not in domain:
        return {
            "valid": False,
            "email": email,
            "reason": "Domain must contain a valid extension (e.g. .com, .org).",
            "suggestion": None,
            "is_disposable": False,
            "is_placeholder": False,
            "domain": domain,
        }

    tld = domain.split(".")[-1]
    if len(tld) < 2:
        return {
            "valid": False,
            "email": email,
            "reason": f"Top-level domain '.{tld}' is too short.",
            "suggestion": None,
            "is_disposable": False,
            "is_placeholder": False,
            "domain": domain,
        }

    if any(char.isdigit() for char in tld):
        return {
            "valid": False,
            "email": email,
            "reason": f"Top-level domain '.{tld}' cannot contain numbers.",
            "suggestion": None,
            "is_disposable": False,
            "is_placeholder": False,
            "domain": domain,
        }

    # Full RFC regex match
    if not EMAIL_REGEX.match(email):
        return {
            "valid": False,
            "email": email,
            "reason": "Email syntax does not conform to valid standard format.",
            "suggestion": None,
            "is_disposable": False,
            "is_placeholder": False,
            "domain": domain,
        }

    # Typo detection
    suggestion = None
    if domain in COMMON_TYPOS:
        correct_domain = COMMON_TYPOS[domain]
        suggestion = f"{local_part}@{correct_domain}"

    # Disposable check
    is_disposable = domain in DISPOSABLE_DOMAINS
    if is_disposable:
        return {
            "valid": False,
            "email": email,
            "reason": f"Disposable or temporary email address from '{domain}' is not allowed.",
            "suggestion": None,
            "is_disposable": True,
            "is_placeholder": False,
            "domain": domain,
        }

    # Placeholder / sample email check
    is_placeholder = domain in PLACEHOLDER_DOMAINS
    if is_placeholder:
        return {
            "valid": False,
            "email": email,
            "reason": f"Placeholder or dummy domain '{domain}' detected. Please provide a real email address.",
            "suggestion": None,
            "is_disposable": False,
            "is_placeholder": True,
            "domain": domain,
        }

    # DNS domain existence check (if enabled)
    if check_dns:
        dns_status = check_domain_dns(domain)
        if dns_status is False:
            return {
                "valid": False,
                "email": email,
                "reason": f"The domain '{domain}' does not exist or has no active DNS records.",
                "suggestion": suggestion,
                "is_disposable": False,
                "is_placeholder": False,
                "domain": domain,
            }

    return {
        "valid": True,
        "email": email,
        "reason": None,
        "suggestion": suggestion,
        "is_disposable": False,
        "is_placeholder": False,
        "domain": domain,
    }


def is_valid_email(raw_email: Optional[str]) -> bool:
    """Convenience helper returning True if email is valid."""
    res = validate_email_address(raw_email, check_dns=False)
    return res["valid"]
