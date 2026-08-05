import pdfplumber
from pathlib import Path
from docx import Document

from app.services.parser.personal import (
    extract_name,
    extract_email,
    extract_phone,
    extract_location,
)

from app.services.parser.social import (
    extract_linkedin,
    extract_github,
)

from app.services.parser.skills import (
    extract_skills,
)

from app.services.parser.education import (
    extract_education,
)

from app.services.parser.experience import (
    extract_experience,
)

from app.services.parser.projects import (
    extract_projects,
)

from app.services.parser.certifications import (
    extract_certifications,
)

from app.services.parser.languages import (
    extract_languages,
)


def extract_pdf(file_path: str):
    text = ""

    with pdfplumber.open(file_path) as pdf:

        for page in pdf.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

    return text


def extract_docx(file_path: str):

    document = Document(file_path)

    text = []

    for paragraph in document.paragraphs:
        text.append(paragraph.text)

    return "\n".join(text)


def extract_text(file_path: str):

    extension = Path(file_path).suffix.lower()

    if extension == ".pdf":
        return extract_pdf(file_path)

    if extension == ".docx":
        return extract_docx(file_path)

    raise Exception("Unsupported file format")


def parse_resume(file_path: str):

    text = extract_text(file_path)

    education = extract_education(text)

    experience = extract_experience(text)

    return {
        "name": extract_name(text),

        "email": extract_email(text),

        "phone": extract_phone(text),

        "location": extract_location(text),

        "linkedin": extract_linkedin(text),

        "github": extract_github(text),

        "skills": extract_skills(text),

        "education": education,

        "experience": experience,

        "projects": extract_projects(text),

        "certifications": extract_certifications(text),

        "languages": extract_languages(text),

        "resume_text": text,
    }