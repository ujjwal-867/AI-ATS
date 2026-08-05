import re


CERTIFICATION_KEYWORDS = [
    "certification",
    "certificate",
    "certified",
    "course",
    "training",
    "workshop",
]


PROVIDERS = [
    "google",
    "microsoft",
    "aws",
    "oracle",
    "coursera",
    "udemy",
    "nptel",
    "infosys",
    "ibm",
    "cisco",
    "hackerrank",
    "leetcode",
    "linkedin learning",
]


def extract_certifications(text: str):
    certifications = []

    lines = [
        line.strip()
        for line in text.split("\n")
        if line.strip()
    ]

    for line in lines:

        lower = line.lower()

        if any(keyword in lower for keyword in CERTIFICATION_KEYWORDS):
            certifications.append(line)
            continue

        if any(provider in lower for provider in PROVIDERS):
            certifications.append(line)

    return sorted(set(certifications))