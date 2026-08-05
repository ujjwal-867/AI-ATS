import re


LINKEDIN_PATTERN = (
    r"(https?:\/\/)?(www\.)?"
    r"linkedin\.com\/[A-Za-z0-9\/\-\_]+"
)

GITHUB_PATTERN = (
    r"(https?:\/\/)?(www\.)?"
    r"github\.com\/[A-Za-z0-9\-\_]+"
)


def extract_linkedin(text: str):
    match = re.search(
        LINKEDIN_PATTERN,
        text,
        re.IGNORECASE,
    )

    return match.group(0) if match else None


def extract_github(text: str):
    match = re.search(
        GITHUB_PATTERN,
        text,
        re.IGNORECASE,
    )

    return match.group(0) if match else None