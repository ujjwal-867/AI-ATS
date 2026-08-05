LANGUAGES = [
    "english",
    "hindi",
    "french",
    "german",
    "spanish",
    "japanese",
    "korean",
    "tamil",
    "telugu",
    "marathi",
    "bengali",
    "gujarati",
    "punjabi",
]


def extract_languages(text: str):
    lower = text.lower()

    found = []

    for language in LANGUAGES:
        if language in lower:
            found.append(language.title())

    return sorted(set(found))