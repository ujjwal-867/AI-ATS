import re

COMMON_SKILLS = [
    # Languages
    "python",
    "java",
    "javascript",
    "typescript",
    "c++",
    "c#",
    "c",
    "go",
    "golang",
    "rust",
    "ruby",
    "php",
    "swift",
    "kotlin",
    "dart",
    "sql",
    "r",
    "bash",
    "shell",

    # Frontend
    "react",
    "next.js",
    "nextjs",
    "vue",
    "angular",
    "svelte",
    "html",
    "css",
    "tailwind",
    "tailwind css",
    "bootstrap",
    "redux",
    "webpack",
    "vite",

    # Backend
    "node.js",
    "nodejs",
    "express",
    "fastapi",
    "django",
    "flask",
    "spring boot",
    "nestjs",
    "rest api",
    "restful api",
    "graphql",
    "grpc",
    "microservices",
    "websockets",

    # Databases
    "postgresql",
    "postgres",
    "mysql",
    "mongodb",
    "redis",
    "sqlite",
    "supabase",
    "firebase",
    "dynamodb",
    "elasticsearch",

    # Cloud & DevOps
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "terraform",
    "ci/cd",
    "jenkins",
    "linux",
    "nginx",
    "git",
    "github",

    # AI & Data
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "numpy",
    "pandas",
    "scikit-learn",
    "opencv",
    "nlp",
    "power bi",
    "tableau",
    "excel",
    "data analysis",

    # Mobile & Other
    "react native",
    "flutter",
    "android",
    "ios",
    "agile",
    "scrum",
    "jira",
    "figma",
    "system design",
]


def extract_skills(text: str):
    text = (text or "").lower()
    found = []

    for skill in COMMON_SKILLS:
        pattern = r"(?:^|[^a-zA-Z0-9+#])" + re.escape(skill) + r"(?:$|[^a-zA-Z0-9+#])"
        if re.search(pattern, text):
            # Normalize common variants
            val = skill
            if val in ("nextjs", "next.js"):
                val = "next.js"
            elif val in ("nodejs", "node.js"):
                val = "node.js"
            elif val in ("postgres", "postgresql"):
                val = "postgresql"
            elif val in ("golang", "go"):
                val = "go"
            elif val in ("restful api", "rest api"):
                val = "rest api"
            elif val in ("tailwind css", "tailwind"):
                val = "tailwind css"
            found.append(val)

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