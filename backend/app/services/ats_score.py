import re

COMMON_SKILLS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "express",
    "fastapi",
    "django",
    "flask",
    "html",
    "css",
    "tailwind",
    "bootstrap",
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "redis",
    "docker",
    "kubernetes",
    "git",
    "github",
    "aws",
    "azure",
    "gcp",
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "numpy",
    "pandas",
    "opencv",
    "scikit-learn",
    "power bi",
    "excel",
]


def extract_skills(text: str):
    text = (text or "").lower()

    found = []

    for skill in COMMON_SKILLS:
        if re.search(r"\b" + re.escape(skill) + r"\b", text):
            found.append(skill)

    return sorted(set(found))


def calculate_ats_score(resume_skills, jd_skills):
    resume = set(skill.lower() for skill in resume_skills)
    jd = set(skill.lower() for skill in jd_skills)

    matched = sorted(resume & jd)
    missing = sorted(jd - resume)
    extra = sorted(resume - jd)

    score = (
        round(len(matched) / len(jd) * 100)
        if jd
        else 0
    )

    return {
        "ats_score": score,
        "matched_skills": matched,
        "missing_skills": missing,
        "extra_skills": extra,
        "matched_count": len(matched),
        "required_count": len(jd),
    }


def calculate_match(resume_text: str, job_description: str):
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(job_description)

    return calculate_ats_score(
        resume_skills,
        jd_skills,
    )