import re


EMAIL_PATTERN = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"

PHONE_PATTERN = r"(\+?\d[\d\s\-()]{8,20})"


LOCATION_KEYWORDS = [
    "india",
    "uttar pradesh",
    "maharashtra",
    "delhi",
    "gorakhpur",
    "lucknow",
    "mumbai",
    "pune",
    "bangalore",
    "hyderabad",
    "noida",
    "chennai",
    "kolkata",
]


def extract_name(text: str):
    lines = [
        line.strip()
        for line in text.split("\n")
        if line.strip()
    ]

    ignore = {
        "resume",
        "curriculum vitae",
        "cv",
    }

    for line in lines:

        if len(line) > 45:
            continue

        if any(char.isdigit() for char in line):
            continue

        if "@" in line:
            continue

        if line.lower() in ignore:
            continue

        return line.title()

    return None


def extract_email(text: str):
    match = re.search(
        EMAIL_PATTERN,
        text,
    )

    return match.group(0) if match else None


def extract_phone(text: str):
    match = re.search(
        PHONE_PATTERN,
        text,
    )

    if not match:
        return None

    number = re.sub(
        r"\D",
        "",
        match.group(0),
    )

    if len(number) >= 10:
        return number

    return None


def extract_location(text: str):
    lower = text.lower()

    for city in LOCATION_KEYWORDS:
        if city in lower:
            return city.title()

    return None