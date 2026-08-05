import json


SKILL_WEIGHTS = {
    "python": 20,
    "fastapi": 20,
    "machine learning": 20,
    "postgresql": 15,
    "react": 10,
    "git": 5,
    "docker": 10,
}


def calculate_match(candidate, job_skills):

    try:
        candidate_skills = json.loads(
            candidate.skills or "[]"
        )
    except:
        candidate_skills = []


    try:
        if isinstance(job_skills, str):
            required_skills = json.loads(job_skills)
        else:
            required_skills = job_skills
    except:
        required_skills = []


    candidate_skills = [
        skill.lower().strip()
        for skill in candidate_skills
    ]

    required_skills = [
        skill.lower().strip()
        for skill in required_skills
    ]


    matched = []
    missing = []

    score = 0
    total_weight = 0


    for skill in required_skills:

        weight = SKILL_WEIGHTS.get(
            skill,
            5
        )

        total_weight += weight


        if skill in candidate_skills:

            matched.append(skill)

            score += weight

        else:

            missing.append(skill)


    match_score = 0

    if total_weight:
        match_score = round(
            (score / total_weight) * 100
        )


    if match_score >= 75:
        recommendation = "Excellent Match"

    elif match_score >= 50:
        recommendation = "Good Match"

    elif match_score >= 30:
        recommendation = "Average Match"

    else:
        recommendation = "Low Match"


    return {
        "candidate_id": candidate.id,
        "candidate_name": candidate.name,
        "match_score": match_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "recommendation": recommendation,
    }