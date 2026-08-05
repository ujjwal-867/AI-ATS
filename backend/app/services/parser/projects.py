import re


TECH_STACK = [
    "python",
    "java",
    "javascript",
    "react",
    "next.js",
    "node.js",
    "fastapi",
    "django",
    "flask",
    "mysql",
    "postgresql",
    "mongodb",
    "excel",
    "power bi",
    "tableau",
    "docker",
    "aws",
    "git",
    "github",
]


SECTION_HEADERS = [
    "projects",
    "project",
]


def extract_projects(text: str):
    lines = text.split("\n")

    projects = []

    inside = False

    current = None

    for line in lines:

        clean = line.strip()

        if not clean:
            continue

        lower = clean.lower()

        if any(header == lower for header in SECTION_HEADERS):
            inside = True
            continue

        if inside:

            if lower in [
                "education",
                "experience",
                "skills",
                "certifications",
                "languages",
            ]:
                break

            if (
                len(clean) < 80
                and not clean.startswith("+")
                and not clean.startswith("-")
            ):

                if current:
                    projects.append(current)

                current = {
                    "title": clean,
                    "description": [],
                    "technologies": [],
                }

                continue

            if current:

                current["description"].append(clean)

                lower_line = clean.lower()

                for tech in TECH_STACK:
                    if tech in lower_line:
                        current["technologies"].append(
                            tech.title()
                        )

    if current:
        projects.append(current)

    for project in projects:
        project["technologies"] = sorted(
            set(project["technologies"])
        )

    return projects