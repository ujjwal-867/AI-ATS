import re


COMMON_SKILLS = {
    # Programming
    "python",
    "java",
    "javascript",
    "typescript",
    "c",
    "c++",
    "c#",
    "go",
    "rust",
    "php",

    # Frontend
    "react",
    "next.js",
    "nextjs",
    "angular",
    "vue",
    "tailwind",
    "bootstrap",
    "html",
    "css",

    # Backend
    "node.js",
    "nodejs",
    "express",
    "fastapi",
    "django",
    "flask",
    "spring",
    "laravel",

    # Database
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "redis",
    "sqlite",

    # Cloud
    "aws",
    "azure",
    "gcp",
    "firebase",

    # DevOps
    "docker",
    "kubernetes",
    "jenkins",
    "github actions",

    # AI / ML
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "numpy",
    "pandas",
    "opencv",
    "scikit-learn",
    "matplotlib",
    "seaborn",

    # Analytics
    "excel",
    "power bi",
    "tableau",
    "matlab",
    "jupyter notebook",

    # Version Control
    "git",
    "github",

    # Soft Skills
    "communication",
    "leadership",
    "teamwork",
    "problem solving",
    "analytical thinking",
}


def extract_skills(text: str):
    text = (text or "").lower()

    found = []

    for skill in COMMON_SKILLS:

        pattern = r"\b" + re.escape(skill) + r"\b"

        if re.search(pattern, text):
            found.append(skill.title())

    return sorted(set(found))