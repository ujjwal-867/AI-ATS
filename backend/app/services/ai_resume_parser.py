"""
AI Resume Parser — uses the resilient HTTPS gemini_client (no gRPC).
"""
import json
import re

from app.services.gemini_client import generate_content


def ai_parse_resume(text: str) -> dict:
    """
    Use Gemini to intelligently parse a resume into structured data.
    Returns empty dict on failure so the traditional parser result is kept.
    """
    if not text or not text.strip():
        return {}

    prompt = f"""You are a resume parser. Extract information from the resume text below and return ONLY a valid JSON object with exactly these keys:

{{
  "name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "linkedin": "string (full URL) or null",
  "github": "string (full URL) or null",
  "skills": ["list of skill strings"],
  "experience": {{
    "years": 0,
    "job_titles": ["list of job title strings"],
    "companies": ["list of company name strings"],
    "fresher": false
  }},
  "education": {{
    "degree": "string or null",
    "college": "string or null",
    "year": "string or null"
  }},
  "projects": [
    {{
      "title": "string",
      "description": "string",
      "technologies": ["list of strings"]
    }}
  ],
  "certifications": ["list of certification name strings"],
  "languages": ["list of language strings"]
}}

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- For experience years, estimate total years of work experience (0 for freshers/students)
- Extract ALL technical and soft skills mentioned
- If a field is not found, use null for strings, [] for lists, 0 for numbers, false for booleans

Resume text:
{text[:6000]}"""

    try:
        raw = generate_content(prompt, timeout=30).strip()
        raw = re.sub(r"^```json\s*", "", raw)
        raw = re.sub(r"^```\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return json.loads(raw)
    except Exception as e:
        print(f"AI resume parser error: {e}")
        return {}


def enhance_parsed_resume(traditional_parsed: dict, ai_parsed: dict) -> dict:
    """
    Merge traditional regex-based parse with AI parse.
    AI results take priority; traditional results used as fallback.
    """
    if not ai_parsed:
        return traditional_parsed

    merged = traditional_parsed.copy()

    from app.services.email_validator import validate_email_address, sanitize_email

    for field in ["name", "phone", "location", "linkedin", "github"]:
        if ai_parsed.get(field):
            merged[field] = ai_parsed[field]

    # Validate AI email before taking precedence over traditional parsed email
    ai_email = sanitize_email(ai_parsed.get("email"))
    if ai_email:
        res = validate_email_address(ai_email, check_dns=False)
        if res["valid"]:
            merged["email"] = res.get("suggestion") or res["email"]

    # Merge skills — combine both, deduplicate
    ai_skills = ai_parsed.get("skills", [])
    trad_skills = traditional_parsed.get("skills", [])
    if isinstance(trad_skills, list) and isinstance(ai_skills, list):
        combined = sorted(set(s.lower().strip() for s in trad_skills + ai_skills if s))
        merged["skills"] = combined
    elif ai_skills:
        merged["skills"] = ai_skills

    for field in ["experience", "education", "projects", "certifications", "languages"]:
        if ai_parsed.get(field):
            merged[field] = ai_parsed[field]

    return merged
