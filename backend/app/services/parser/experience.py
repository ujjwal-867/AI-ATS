import re


EXPERIENCE_PATTERNS = [
    r"(\d+)\+?\s*(?:years|year|yrs|yr)",
    r"(\d+)\+?\s*(?:months|month)",
]


JOB_TITLES = [
    "software engineer",
    "software developer",
    "frontend developer",
    "backend developer",
    "full stack developer",
    "data analyst",
    "data scientist",
    "python developer",
    "java developer",
    "web developer",
    "intern",
    "machine learning engineer",
    "ai engineer",
]


COMPANY_KEYWORDS = [
    "technologies",
    "solutions",
    "private limited",
    "pvt ltd",
    "inc",
    "llp",
    "company",
]


def extract_experience_years(text: str):
    text = text.lower()

    match = re.search(
        EXPERIENCE_PATTERNS[0],
        text,
    )

    if match:
        return int(match.group(1))

    return 0


def extract_job_titles(text: str):
    lower = text.lower()

    titles = []

    for title in JOB_TITLES:
        if title in lower:
            titles.append(title.title())

    return sorted(set(titles))


def extract_companies(text: str):
    companies = []

    lines = text.split("\n")

    for line in lines:

        lower = line.lower()

        if any(
            keyword in lower
            for keyword in COMPANY_KEYWORDS
        ):
            companies.append(line.strip())

    return companies


def is_fresher(text: str):
    lower = text.lower()

    if "fresher" in lower:
        return True

    if extract_experience_years(text) == 0:
        return True

    return False


def extract_experience(text: str):
    return {
        "years": extract_experience_years(text),
        "job_titles": extract_job_titles(text),
        "companies": extract_companies(text),
        "fresher": is_fresher(text),
    }