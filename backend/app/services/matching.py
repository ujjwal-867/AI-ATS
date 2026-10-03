import json
import re


# ============================================================
# ATS SCORING WEIGHTS
# ============================================================

WEIGHTS = {
    "required_skills": 35,
    "experience": 15,
    "role_relevance": 10,
    "semantic_relevance": 15,
    "projects": 8,
    "education": 7,
    "certifications": 5,
    "resume_quality": 5,
}


# ============================================================
# SKILL NORMALIZATION
# ============================================================

SKILL_ALIASES = {
    "nextjs": "next.js",
    "next js": "next.js",
    "nodejs": "node.js",
    "node js": "node.js",
    "tailwind": "tailwind css",
    "postgres": "postgresql",
    "postgre": "postgresql",
    "mongo": "mongodb",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "sklearn": "scikit-learn",
    "scikit learn": "scikit-learn",
    "powerbi": "power bi",
}


def normalize_skill(skill):
    if not skill:
        return ""

    value = str(skill).lower().strip()

    value = value.replace("_", " ")
    value = re.sub(r"\s+", " ", value)

    return SKILL_ALIASES.get(value, value)


def normalize_text(value):
    if not value:
        return ""

    value = str(value).lower()

    value = re.sub(r"[^a-z0-9+#.\s]", " ", value)
    value = re.sub(r"\s+", " ", value)

    return value.strip()


# ============================================================
# DATA EXTRACTION HELPERS
# ============================================================

def extract_list(data):

    if not data:
        return []

    if isinstance(data, list):
        return [
            item
            for item in data
            if item
        ]

    if isinstance(data, tuple):
        return list(data)

    if isinstance(data, str):

        try:
            parsed = json.loads(data)

            if isinstance(parsed, list):
                return parsed

        except Exception:
            pass

        # Handle comma-separated values
        return [
            item.strip()
            for item in data.split(",")
            if item.strip()
        ]

    return []


def extract_skills(data):

    skills = extract_list(data)

    normalized = []

    for skill in skills:

        if isinstance(skill, dict):
            skill = (
                skill.get("name")
                or skill.get("skill")
                or ""
            )

        skill = normalize_skill(skill)

        if skill:
            normalized.append(skill)

    return sorted(set(normalized))


# ============================================================
# SKILL MATCHING
# ============================================================

def skill_matches(required_skill, candidate_skills):

    required = normalize_skill(required_skill)

    if not required:
        return False

    for candidate in candidate_skills:

        candidate = normalize_skill(candidate)

        if not candidate:
            continue

        if required == candidate:
            return True

        if (
            required in candidate
            or candidate in required
        ):
            return True

    return False


def get_job_required_skills(job):
    """
    Get required skills for a job.
    If job.required_skills is empty or not set, dynamically extract skills
    from job.description + job.title so matching never results in 0 skills.
    """
    skills = extract_skills(getattr(job, "required_skills", None))
    if not skills:
        from app.services.ats_score import extract_skills as extract_from_text
        combined = f"{getattr(job, 'title', '') or ''} {getattr(job, 'description', '') or ''}"
        skills = extract_from_text(combined)
    return skills


# ============================================================
# EXPERIENCE
# ============================================================

def get_candidate_experience(candidate):

    experience = candidate.experience

    if isinstance(experience, str):

        try:
            experience = json.loads(experience)

        except Exception:
            experience = {}

    if not isinstance(experience, dict):
        experience = {}

    years = experience.get("years", 0)

    try:
        years = float(years)
    except Exception:
        years = 0

    job_titles = experience.get(
        "job_titles",
        [],
    )

    companies = experience.get(
        "companies",
        [],
    )

    fresher = experience.get(
        "fresher",
        years == 0,
    )

    return {
        "years": max(0, years),
        "job_titles": extract_list(job_titles),
        "companies": extract_list(companies),
        "fresher": bool(fresher),
    }


def extract_required_years(job):

    text = normalize_text(
        f"{job.title or ''} {job.description or ''}"
    )

    patterns = [
        r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?|yr)",
        r"minimum\s+(\d+(?:\.\d+)?)",
        r"at\s+least\s+(\d+(?:\.\d+)?)",
    ]

    values = []

    for pattern in patterns:

        matches = re.findall(
            pattern,
            text,
            re.IGNORECASE,
        )

        for value in matches:

            try:
                values.append(float(value))
            except Exception:
                pass

    if not values:
        return 0

    return max(values)


def calculate_experience_score(candidate, job):

    candidate_experience = get_candidate_experience(candidate)

    candidate_years = candidate_experience["years"]

    required_years = extract_required_years(job)

    # No experience requirement.
    if required_years <= 0:

        return {
            "score": WEIGHTS["experience"],
            "candidate_years": candidate_years,
            "required_years": 0,
            "status": (
                "Fresher acceptable"
                if candidate_years == 0
                else "Experience present"
            ),
        }

    # Candidate fully meets requirement.
    if candidate_years >= required_years:

        return {
            "score": WEIGHTS["experience"],
            "candidate_years": candidate_years,
            "required_years": required_years,
            "status": "Meets requirement",
        }

    # Partial experience.
    ratio = candidate_years / required_years

    score = round(
        WEIGHTS["experience"] * ratio
    )

    return {
        "score": min(
            WEIGHTS["experience"],
            score,
        ),
        "candidate_years": candidate_years,
        "required_years": required_years,
        "status": "Below requirement",
    }


# ============================================================
# ROLE RELEVANCE
# ============================================================

def extract_candidate_role_text(candidate):

    experience = get_candidate_experience(candidate)

    parts = []

    parts.extend(
        experience["job_titles"]
    )

    if candidate.summary:
        parts.append(candidate.summary)

    if candidate.projects:
        projects = candidate.projects

        if isinstance(projects, str):

            try:
                projects = json.loads(projects)
            except Exception:
                projects = []

        if isinstance(projects, list):

            for project in projects:

                if isinstance(project, dict):

                    parts.append(
                        project.get("title", "")
                    )

    return normalize_text(
        " ".join(parts)
    )


def calculate_role_relevance(candidate, job):

    job_text = normalize_text(
        f"{job.title or ''} {job.description or ''}"
    )

    candidate_text = extract_candidate_role_text(
        candidate
    )

    if not job_text or not candidate_text:

        return {
            "score": 0,
            "matched_terms": [],
        }

    # Important role-related terms.
    terms = set(
        re.findall(
            r"\b[a-z][a-z0-9+#.-]{2,}\b",
            normalize_text(job.title or ""),
        )
    )

    # Add technical words from the job description.
    description_terms = set(
        re.findall(
            r"\b[a-z][a-z0-9+#.-]{2,}\b",
            job_text,
        )
    )

    terms.update(description_terms)

    stop_words = {
        "the",
        "and",
        "for",
        "with",
        "from",
        "this",
        "that",
        "are",
        "you",
        "your",
        "our",
        "will",
        "have",
        "has",
        "job",
        "role",
        "work",
        "years",
        "year",
        "experience",
        "required",
        "skills",
        "candidate",
        "team",
    }

    terms = {
        term
        for term in terms
        if term not in stop_words
    }

    matched_terms = [
        term
        for term in terms
        if term in candidate_text
    ]

    if not terms:
        score = 0
    else:
        ratio = len(matched_terms) / len(terms)

        score = round(
            WEIGHTS["role_relevance"] * min(
                ratio * 2,
                1,
            )
        )

    return {
        "score": min(
            WEIGHTS["role_relevance"],
            score,
        ),
        "matched_terms": sorted(
            matched_terms
        )[:20],
    }


# ============================================================
# SEMANTIC / JD RELEVANCE
# ============================================================

def calculate_semantic_relevance(candidate, job):

    resume_text = normalize_text(
        candidate.resume_text
    )

    job_text = normalize_text(
        job.description
    )

    if not resume_text or not job_text:

        return {
            "score": 0,
            "matched_terms": [],
        }

    job_terms = set(
        re.findall(
            r"\b[a-z][a-z0-9+#.-]{2,}\b",
            job_text,
        )
    )

    stop_words = {
        "the",
        "and",
        "for",
        "with",
        "from",
        "this",
        "that",
        "are",
        "you",
        "your",
        "our",
        "will",
        "have",
        "has",
        "job",
        "role",
        "work",
        "years",
        "year",
        "experience",
        "required",
        "skills",
        "candidate",
        "team",
        "using",
        "use",
        "should",
        "must",
        "looking",
        "including",
        "strong",
        "good",
        "knowledge",
    }

    job_terms = {
        term
        for term in job_terms
        if term not in stop_words
    }

    if not job_terms:

        return {
            "score": 0,
            "matched_terms": [],
        }

    matched_terms = [
        term
        for term in job_terms
        if term in resume_text
    ]

    ratio = len(matched_terms) / len(job_terms)

    score = round(
        WEIGHTS["semantic_relevance"]
        * min(ratio * 1.5, 1)
    )

    return {
        "score": min(
            WEIGHTS["semantic_relevance"],
            score,
        ),
        "matched_terms": sorted(
            matched_terms
        )[:30],
    }


# ============================================================
# PROJECT SCORING
# ============================================================

def get_projects(candidate):

    projects = candidate.projects

    if isinstance(projects, str):

        try:
            projects = json.loads(projects)
        except Exception:
            return []

    if not isinstance(projects, list):
        return []

    return projects


def calculate_project_score(candidate, job):

    projects = get_projects(candidate)

    if not projects:

        return {
            "score": 0,
            "projects_found": 0,
            "relevant_projects": [],
        }

    job_text = normalize_text(
        f"{job.title or ''} {job.description or ''}"
    )

    required_skills = get_job_required_skills(job)

    relevant_projects = []

    for project in projects:

        if not isinstance(project, dict):
            continue

        project_text = normalize_text(
            " ".join(
                [
                    str(project.get("title", "")),
                    " ".join(
                        project.get(
                            "description",
                            [],
                        )
                        if isinstance(
                            project.get(
                                "description",
                                [],
                            ),
                            list,
                        )
                        else [
                            str(
                                project.get(
                                    "description",
                                    "",
                                )
                            )
                        ]
                    ),
                    " ".join(
                        project.get(
                            "technologies",
                            [],
                        )
                        if isinstance(
                            project.get(
                                "technologies",
                                [],
                            ),
                            list,
                        )
                        else []
                    ),
                ]
            )
        )

        skill_hits = sum(
            1
            for skill in required_skills
            if skill_matches(
                skill,
                extract_skills(
                    project.get(
                        "technologies",
                        [],
                    )
                ),
            )
        )

        title_or_description_match = (
            any(
                term in project_text
                for term in job_text.split()
                if len(term) >= 4
            )
        )

        if (
            skill_hits > 0
            or title_or_description_match
        ):
            relevant_projects.append(
                project.get(
                    "title",
                    "Untitled Project",
                )
            )

    if not relevant_projects:
        return {
            "score": min(
                2,
                WEIGHTS["projects"],
            ),
            "projects_found": len(projects),
            "relevant_projects": [],
        }

    score = min(
        WEIGHTS["projects"],
        2 + (
            len(relevant_projects) * 2
        ),
    )

    return {
        "score": score,
        "projects_found": len(projects),
        "relevant_projects": sorted(
            set(relevant_projects)
        ),
    }


# ============================================================
# EDUCATION
# ============================================================

def get_education(candidate):

    education = candidate.education

    if isinstance(education, str):

        try:
            education = json.loads(education)
        except Exception:
            education = {}

    if not isinstance(education, dict):
        education = {}

    return education


def calculate_education_score(candidate, job):

    education = get_education(candidate)

    degree = normalize_text(
        education.get("degree", "")
    )

    college = normalize_text(
        education.get("college", "")
    )

    if not degree and not college:

        return {
            "score": 0,
            "degree": None,
        }

    job_text = normalize_text(
        f"{job.title or ''} {job.description or ''}"
    )

    score = 0

    if degree:

        score += 4

    if college:

        score += 1

    # Relevant technical education evidence.
    technical_terms = [
        "computer",
        "software",
        "engineering",
        "technology",
        "information technology",
        "data science",
        "artificial intelligence",
        "machine learning",
        "computer science",
        "bca",
        "b.tech",
        "m.tech",
        "mca",
        "b.sc",
        "m.sc",
    ]

    if any(
        term in degree
        for term in technical_terms
    ):

        if any(
            term in job_text
            for term in [
                "software",
                "developer",
                "engineer",
                "technology",
                "data",
                "machine learning",
                "artificial intelligence",
                "ai",
            ]
        ):
            score += 2

    return {
        "score": min(
            WEIGHTS["education"],
            score,
        ),
        "degree": (
            education.get("degree")
        ),
    }


# ============================================================
# CERTIFICATIONS
# ============================================================

def get_certifications(candidate):

    certifications = candidate.certifications

    if isinstance(certifications, str):

        try:
            certifications = json.loads(
                certifications
            )
        except Exception:
            certifications = extract_list(
                certifications
            )

    return extract_list(
        certifications
    )


def calculate_certification_score(
    candidate,
    job,
):

    certifications = get_certifications(
        candidate
    )

    if not certifications:

        return {
            "score": 0,
            "certifications": [],
        }

    job_text = normalize_text(
        f"{job.title or ''} {job.description or ''}"
    )

    relevant = []

    for certification in certifications:

        cert_text = normalize_text(
            certification
        )

        if any(
            word in job_text
            for word in cert_text.split()
            if len(word) >= 4
        ):
            relevant.append(
                certification
            )

    if relevant:

        score = min(
            WEIGHTS["certifications"],
            2 + len(relevant),
        )

    else:

        score = min(
            2,
            WEIGHTS["certifications"],
        )

    return {
        "score": score,
        "certifications": certifications[:20],
        "relevant_certifications": relevant[:10],
    }


# ============================================================
# RESUME QUALITY / COMPLETENESS
# ============================================================

def calculate_resume_quality(candidate):

    checks = {
        "name": bool(candidate.name),
        "email": bool(candidate.email),
        "phone": bool(candidate.phone),
        "location": bool(candidate.location),
        "skills": bool(candidate.skills),
        "education": bool(candidate.education),
        "experience": bool(candidate.experience),
        "projects": bool(candidate.projects),
        "certifications": bool(
            candidate.certifications
        ),
        "summary": bool(candidate.summary),
        "resume_text": bool(candidate.resume_text),
    }

    completed = sum(
        1
        for value in checks.values()
        if value
    )

    ratio = completed / len(checks)

    score = round(
        WEIGHTS["resume_quality"] * ratio
    )

    return {
        "score": score,
        "completed_fields": completed,
        "total_fields": len(checks),
    }


# ============================================================
# MAIN ATS ENGINE
# ============================================================

def calculate_match(candidate, job):

    candidate_skills = extract_skills(
        candidate.skills
    )

    required_skills = get_job_required_skills(job)

    matched_skills = []
    missing_skills = []

    for skill in required_skills:

        if skill_matches(
            skill,
            candidate_skills,
        ):

            matched_skills.append(skill)

        else:

            missing_skills.append(skill)

    # --------------------------------------------------------
    # Required skills — 35 points
    # --------------------------------------------------------

    if required_skills:

        skill_ratio = (
            len(matched_skills)
            / len(required_skills)
        )

        required_skill_score = round(
            WEIGHTS["required_skills"]
            * skill_ratio
        )

    else:

        required_skill_score = 0

    # --------------------------------------------------------
    # Experience — 15 points
    # --------------------------------------------------------

    experience_result = (
        calculate_experience_score(
            candidate,
            job,
        )
    )

    # --------------------------------------------------------
    # Role relevance — 10 points
    # --------------------------------------------------------

    role_result = (
        calculate_role_relevance(
            candidate,
            job,
        )
    )

    # --------------------------------------------------------
    # Resume ↔ JD relevance — 15 points
    # --------------------------------------------------------

    semantic_result = (
        calculate_semantic_relevance(
            candidate,
            job,
        )
    )

    # --------------------------------------------------------
    # Projects — 8 points
    # --------------------------------------------------------

    project_result = (
        calculate_project_score(
            candidate,
            job,
        )
    )

    # --------------------------------------------------------
    # Education — 7 points
    # --------------------------------------------------------

    education_result = (
        calculate_education_score(
            candidate,
            job,
        )
    )

    # --------------------------------------------------------
    # Certifications — 5 points
    # --------------------------------------------------------

    certification_result = (
        calculate_certification_score(
            candidate,
            job,
        )
    )

    # --------------------------------------------------------
    # Resume quality — 5 points
    # --------------------------------------------------------

    quality_result = (
        calculate_resume_quality(
            candidate,
        )
    )

    # --------------------------------------------------------
    # FINAL SCORE
    # --------------------------------------------------------

    total_score = (
        required_skill_score
        + experience_result["score"]
        + role_result["score"]
        + semantic_result["score"]
        + project_result["score"]
        + education_result["score"]
        + certification_result["score"]
        + quality_result["score"]
    )

    match_score = max(
        0,
        min(
            100,
            round(total_score),
        ),
    )

    # --------------------------------------------------------
    # Critical missing skills
    #
    # A critical skill is treated as one of the first-level
    # technical/job-defining skills in the job requirements.
    # --------------------------------------------------------

    critical_missing_skills = []

    critical_keywords = [
        "python",
        "java",
        "javascript",
        "typescript",
        "react",
        "next.js",
        "node.js",
        "fastapi",
        "django",
        "spring",
        "sql",
        "postgresql",
        "mysql",
        "mongodb",
        "machine learning",
        "deep learning",
        "tensorflow",
        "pytorch",
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
    ]

    for skill in missing_skills:

        if normalize_skill(skill) in critical_keywords:

            critical_missing_skills.append(
                skill
            )

    # --------------------------------------------------------
    # Recommendation
    # --------------------------------------------------------

    if match_score >= 85:

        recommendation = "Excellent Match"

    elif match_score >= 70:

        recommendation = "Strong Match"

    elif match_score >= 55:

        recommendation = "Good Match"

    elif match_score >= 40:

        recommendation = "Potential Match"

    else:

        recommendation = "Low Match"

    # --------------------------------------------------------
    # Detailed breakdown
    # --------------------------------------------------------

    score_breakdown = {

        "required_skills": required_skill_score,

        "experience": experience_result[
            "score"
        ],

        "role_relevance": role_result[
            "score"
        ],

        "semantic_relevance": semantic_result[
            "score"
        ],

        "projects": project_result[
            "score"
        ],

        "education": education_result[
            "score"
        ],

        "certifications": certification_result[
            "score"
        ],

        "resume_quality": quality_result[
            "score"
        ],
    }

    return {

        "candidate_id": candidate.id,

        "candidate_name": candidate.name,

        "match_score": match_score,

        "recommendation": recommendation,

        "score_breakdown": score_breakdown,

        "matched_skills": sorted(
            set(matched_skills)
        ),

        "missing_skills": sorted(
            set(missing_skills)
        ),

        "critical_missing_skills": sorted(
            set(critical_missing_skills)
        ),

        "experience_analysis": {
            "candidate_years": experience_result[
                "candidate_years"
            ],
            "required_years": experience_result[
                "required_years"
            ],
            "status": experience_result[
                "status"
            ],
        },

        "role_analysis": {
            "matched_terms": role_result[
                "matched_terms"
            ],
        },

        "semantic_analysis": {
            "matched_terms": semantic_result[
                "matched_terms"
            ],
        },

        "project_analysis": {
            "projects_found": project_result[
                "projects_found"
            ],
            "relevant_projects": project_result[
                "relevant_projects"
            ],
        },

        "education_analysis": {
            "degree": education_result[
                "degree"
            ],
        },

        "certification_analysis": {
            "certifications": certification_result[
                "certifications"
            ],
            "relevant_certifications": certification_result.get(
                "relevant_certifications",
                [],
            ),
        },

        "resume_quality": {
            "completed_fields": quality_result[
                "completed_fields"
            ],
            "total_fields": quality_result[
                "total_fields"
            ],
        },

        "extra_skills": [
            skill
            for skill in candidate_skills
            if skill not in required_skills
        ],
    }