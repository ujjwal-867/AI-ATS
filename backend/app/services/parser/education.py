import re


DEGREE_PATTERNS = [
    r"b\.?tech.*",
    r"bachelor.*",
    r"b\.?e.*",
    r"m\.?tech.*",
    r"mca.*",
    r"bca.*",
    r"bsc.*",
    r"msc.*",
    r"mba.*",
]


CGPA_PATTERN = r"(cgpa[:\s]*)(\d+(\.\d+)?)"

PERCENTAGE_PATTERN = r"(\d+(\.\d+)?)\s*%"

YEAR_PATTERN = r"(?:19|20)\d{2}"


def extract_degree(text: str):
    lines = text.split("\n")

    for line in lines:
        for pattern in DEGREE_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                return line.strip()

    return None


def extract_college(text: str):
    lines = text.split("\n")

    keywords = [
        "college",
        "university",
        "institute",
        "school",
    ]

    for line in lines:

        lower = line.lower()

        if any(word in lower for word in keywords):
            return line.strip()

    return None


def extract_cgpa(text: str):
    match = re.search(
        CGPA_PATTERN,
        text,
        re.IGNORECASE,
    )

    if match:
        return match.group(2)

    return None


def extract_percentage(text: str):
    matches = re.findall(
        PERCENTAGE_PATTERN,
        text,
        re.IGNORECASE,
    )

    if matches:
        return [match[0] for match in matches]

    return []


def extract_years(text: str):
    years = re.findall(
        YEAR_PATTERN,
        text,
    )

    unique = sorted(set(years))

    return unique


def extract_education(text: str):
    return {
        "degree": extract_degree(text),
        "college": extract_college(text),
        "cgpa": extract_cgpa(text),
        "percentages": extract_percentage(text),
        "years": extract_years(text),
    }