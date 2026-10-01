"""
AI Match Explainer — uses the resilient HTTPS gemini_client (no gRPC).
"""
from app.services.gemini_client import generate_content


def explain_match(match_result: dict, job_title: str = "") -> str:
    """
    Use Gemini to generate a human-readable explanation of a candidate match.
    Returns empty string on failure so the API still responds.
    """
    try:
        score = match_result.get("match_score", 0)
        matched = match_result.get("matched_skills", [])
        missing = match_result.get("missing_skills", [])
        recommendation = match_result.get("recommendation", "")
        exp = match_result.get("experience_analysis", {})
        candidate_years = exp.get("candidate_years", 0)
        required_years = exp.get("required_years", 0)
        projects = match_result.get("project_analysis", {}).get("relevant_projects", [])

        prompt = f"""You are an expert HR analyst. Write a concise 2-3 sentence candidate assessment.

Job: {job_title}
Match Score: {score}/100 ({recommendation})
Matched Skills: {", ".join(matched[:8]) if matched else "None"}
Missing Skills: {", ".join(missing[:5]) if missing else "None"}
Experience: {candidate_years} years (required: {required_years} years)
Relevant Projects: {", ".join(projects[:3]) if projects else "None"}

Write a professional, specific assessment. Mention the score context, key strengths, and main gaps. Be direct and helpful for an HR decision-maker."""

        return generate_content(prompt, timeout=20).strip()

    except Exception as e:
        print(f"AI explainer error: {e}")
        return ""
