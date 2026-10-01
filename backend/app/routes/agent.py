"""
AI Recruiting Agent — 18 real database tools powered by Gemini function calling.

Tools:
  Candidate Intelligence:
    get_all_candidates, get_candidate_details, get_candidate_full_report,
    compare_candidates, search_candidates_by_skill
  Job & Matching:
    get_all_jobs, rank_candidates_for_job, shortlist_top_candidates
  Pipeline Management:
    get_pipeline_stats, update_candidate_status, bulk_update_status,
    bulk_reject_below_score
  AI Interview:
    initiate_ai_interview, evaluate_full_interview
  Website Automation:
    create_candidate_from_text, create_job_posting,
    delete_candidate, get_recruitment_intelligence
"""

import json
import logging
import re
import uuid
from typing import Optional

import requests

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.candidate import Candidate
from app.models.job import Job
from app.services.matching import calculate_match

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(get_current_user)])

# ─────────────────────────────────────────────
# SYSTEM PROMPT
# ─────────────────────────────────────────────

SYSTEM_PROMPT = """You are an elite AI Recruiting Agent with DIRECT, LIVE access to the ATS database.
You can read, write, and analyse all candidate, job, and pipeline data in real time.

═══ CORE RULES ═══
• ALWAYS use tools when data is involved — never invent names, scores, or facts.
• Chain tools when needed: e.g. get_all_jobs → rank_candidates_for_job → shortlist_top_candidates.
• Format every response with clear sections, bold headers, bullets, and emoji for quick scanning.
• Be specific: use real names, exact scores, actual skills from the database.
• Confirm every write operation (status change, creation, deletion) with the affected record's name/ID.

═══ AI INTERVIEW PROTOCOL ═══
When asked to conduct an interview:
1. Call initiate_ai_interview → this returns the interview plan + Question 1.
2. Present Question 1 clearly, labelled "**Question 1/**".
3. Wait for the user to type the candidate's answer.
4. Give a 1-line private note (e.g. "✓ Strong answer") then ask the next question.
5. Repeat until all questions are answered.
6. Call evaluate_full_interview with all Q&A pairs as JSON.
7. Present the full evaluation report with scores and hire/pass recommendation.

═══ TEXT-TO-CANDIDATE ═══
When asked to add a candidate from a description:
1. Call create_candidate_from_text with the full text.
2. Confirm the extracted profile and the new candidate's ID.
3. Offer to rank them against any open job.

═══ WEBSITE AUTOMATION ═══
You can: create jobs, delete candidates, bulk-move pipeline stages, auto-shortlist,
auto-reject below a score threshold, generate intelligence reports — all via tools."""

# ─────────────────────────────────────────────
# TOOL DECLARATIONS (Gemini function-calling)
# ─────────────────────────────────────────────

TOOL_DECLARATIONS = [
    # ── Candidate Intelligence ──────────────────────────────────────────────
    {
        "name": "get_all_candidates",
        "description": "Fetch every candidate with name, email, skills (top 10), status, ATS score, experience years, and location.",
        "parameters": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "get_candidate_details",
        "description": (
            "Fetch the COMPLETE profile of one candidate: all skills, full experience history "
            "(job titles, companies, years), education, every project, certifications, languages, "
            "contact details, LinkedIn/GitHub, interview history, and current pipeline stage."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "candidate_id": {"type": "string", "description": "Candidate UUID (the id field from get_all_candidates)."}
            },
            "required": ["candidate_id"],
        },
    },
    {
        "name": "get_candidate_full_report",
        "description": (
            "Generate a comprehensive AI-written narrative report for a candidate: "
            "strengths, weaknesses, culture fit, suggested roles, career trajectory, and a hire recommendation."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "candidate_id": {"type": "string", "description": "Candidate UUID (the id field from get_all_candidates)."},
                "job_id": {"type": "string", "description": "Optional job UUID to tailor the report."},
            },
            "required": ["candidate_id"],
        },
    },
    {
        "name": "compare_candidates",
        "description": "Side-by-side comparison of 2–5 candidates with an AI recommendation on who to advance.",
        "parameters": {
            "type": "object",
            "properties": {
                "candidate_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of 2–5 candidate IDs to compare.",
                },
                "job_id": {"type": "string", "description": "Optional job UUID for context."},
            },
            "required": ["candidate_ids"],
        },
    },
    {
        "name": "search_candidates_by_skill",
        "description": "Find all candidates who have any of the specified skills (case-insensitive partial match).",
        "parameters": {
            "type": "object",
            "properties": {
                "skills": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Skills to search for.",
                }
            },
            "required": ["skills"],
        },
    },
    # ── Job & Matching ──────────────────────────────────────────────────────
    {
        "name": "get_all_jobs",
        "description": "Get all job postings: ID, title, company, location, required skills, experience needed, status.",
        "parameters": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "rank_candidates_for_job",
        "description": (
            "Run the real ATS algorithm and rank ALL candidates against a job. "
            "Returns match score, matched skills, missing skills, recommendation, and experience gap."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "job_id": {"type": "string", "description": "Job UUID."},
                "top_n": {"type": "integer", "description": "How many top candidates to return (default 5)."},
            },
            "required": ["job_id"],
        },
    },
    {
        "name": "shortlist_top_candidates",
        "description": (
            "Rank all candidates for a job and automatically move the top N to 'Screening' stage. "
            "Returns who was shortlisted with their scores."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "job_id": {"type": "string", "description": "Job UUID."},
                "top_n": {"type": "integer", "description": "How many to shortlist (default 5)."},
                "min_score": {"type": "number", "description": "Minimum match score to qualify (default 0)."},
            },
            "required": ["job_id"],
        },
    },
    # ── Pipeline Management ─────────────────────────────────────────────────
    {
        "name": "get_pipeline_stats",
        "description": "Live pipeline overview: total candidates, count per status stage, average ATS score, recent activity.",
        "parameters": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "update_candidate_status",
        "description": "Move a single candidate to a new pipeline stage: Applied, Screening, Interview, Offer, Hired, Rejected.",
        "parameters": {
            "type": "object",
            "properties": {
                "candidate_id": {"type": "string", "description": "Candidate UUID (the id field from get_all_candidates)."},
                "new_status": {"type": "string", "description": "New pipeline stage."},
            },
            "required": ["candidate_id", "new_status"],
        },
    },
    {
        "name": "bulk_update_status",
        "description": "Move multiple candidates to the same new pipeline stage in one operation.",
        "parameters": {
            "type": "object",
            "properties": {
                "candidate_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of candidate IDs.",
                },
                "new_status": {"type": "string", "description": "New stage for all."},
            },
            "required": ["candidate_ids", "new_status"],
        },
    },
    {
        "name": "bulk_reject_below_score",
        "description": "Automatically reject all candidates whose ATS score is below a given threshold.",
        "parameters": {
            "type": "object",
            "properties": {
                "threshold": {"type": "number", "description": "ATS score cutoff (e.g. 40)."},
            },
            "required": ["threshold"],
        },
    },
    # ── AI Interview ────────────────────────────────────────────────────────
    {
        "name": "initiate_ai_interview",
        "description": (
            "Generate a structured, tailored interview plan for a candidate. "
            "Returns the interview questions with evaluation rubrics and the first question ready to ask."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "candidate_id": {"type": "string", "description": "Candidate UUID (the id field from get_all_candidates)."},
                "job_id": {"type": "string", "description": "Optional job UUID for role-specific questions."},
                "num_questions": {"type": "integer", "description": "Number of questions (default 6)."},
            },
            "required": ["candidate_id"],
        },
    },
    {
        "name": "evaluate_full_interview",
        "description": (
            "Evaluate a completed interview. Takes all question-answer pairs and returns "
            "per-question scores, overall interview score (0-100), strengths, weaknesses, "
            "and a final hire/pass/reject recommendation."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "candidate_id": {"type": "string", "description": "Candidate UUID (the id field from get_all_candidates)."},
                "job_id": {"type": "string", "description": "Optional job UUID."},
                "qa_pairs": {
                    "type": "string",
                    "description": 'JSON array string: [{"question": "...", "answer": "..."}, ...]',
                },
                "save_result": {
                    "type": "boolean",
                    "description": "Whether to save the interview result to the DB (default true).",
                },
            },
            "required": ["candidate_id", "qa_pairs"],
        },
    },
    # ── Website Automation ──────────────────────────────────────────────────
    {
        "name": "create_candidate_from_text",
        "description": (
            "Parse a free-text description of a candidate and create them as a new candidate "
            "in the system. Extracts name, email, phone, skills, experience, education, projects, etc."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "text_description": {
                    "type": "string",
                    "description": "Free-text description of the candidate (as provided by the user).",
                }
            },
            "required": ["text_description"],
        },
    },
    {
        "name": "create_job_posting",
        "description": "Create a new job posting in the ATS system.",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Job title."},
                "description": {"type": "string", "description": "Full job description."},
                "required_skills": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of required skills.",
                },
                "experience": {"type": "string", "description": "Experience required e.g. '3-5 years'."},
                "location": {"type": "string", "description": "Job location."},
                "employment_type": {"type": "string", "description": "Full-time, Part-time, Contract, etc."},
                "company": {"type": "string", "description": "Company name."},
                "salary": {"type": "string", "description": "Salary range (optional)."},
            },
            "required": ["title", "description"],
        },
    },
    {
        "name": "delete_candidate",
        "description": "Permanently delete a candidate and their resume file from the system.",
        "parameters": {
            "type": "object",
            "properties": {
                "candidate_id": {"type": "string", "description": "Candidate UUID to delete."},
            },
            "required": ["candidate_id"],
        },
    },
    {
        "name": "get_recruitment_intelligence",
        "description": (
            "Generate a comprehensive strategic recruitment intelligence report: "
            "pipeline health, skill gaps, top performers, bottlenecks, time-to-hire estimates, "
            "and actionable recommendations for the hiring team."
        ),
        "parameters": {"type": "object", "properties": {}, "required": []},
    },
]

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def _load(field: Optional[str], default=None):
    """Safe JSON load from a DB text column."""
    if not field:
        return default if default is not None else []
    try:
        return json.loads(field)
    except Exception:
        return default if default is not None else []


def _candidate_snapshot(c: Candidate) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone,
        "location": c.location,
        "linkedin": c.linkedin,
        "github": c.github,
        "status": c.status,
        "ats_score": c.ats_score,
        "experience_years": c.experience_years,
        "skills": _load(c.skills)[:12],
    }


def _candidate_full(c: Candidate) -> dict:
    exp = _load(c.experience, {})
    edu = _load(c.education, {})
    return {
        **_candidate_snapshot(c),
        "skills_all": _load(c.skills),
        "experience": {
            "years": c.experience_years,
            "is_fresher": exp.get("fresher", False),
            "job_titles": exp.get("job_titles", []),
            "companies": exp.get("companies", []),
        },
        "education": {
            "degree": edu.get("degree"),
            "college": edu.get("college"),
            "year": edu.get("year"),
        },
        "projects": _load(c.projects),
        "certifications": _load(c.certifications),
        "languages": _load(c.languages),
        "summary": c.summary,
        "resume_text_preview": (c.resume_text or "")[:600],
        "interview": {
            "date": str(c.interview_date) if c.interview_date else None,
            "interviewer": c.interviewer,
            "meeting_link": c.meeting_link,
            "result": c.interview_result,
            "score": c.interview_score,
            "feedback": c.interview_feedback,
        },
    }

# ─────────────────────────────────────────────
# TOOL IMPLEMENTATIONS
# ─────────────────────────────────────────────

def _execute_tool(name: str, args: dict, db: Session) -> dict:  # noqa: C901
    from app.services.gemini_client import generate_content

    # ── get_all_candidates ─────────────────────────────────────────────────
    if name == "get_all_candidates":
        rows = db.query(Candidate).all()
        return {
            "total": len(rows),
            "candidates": [_candidate_snapshot(c) for c in rows],
        }

    # ── get_candidate_details ──────────────────────────────────────────────
    if name == "get_candidate_details":
        c = db.query(Candidate).filter(Candidate.id == args["candidate_id"]).first()
        if not c:
            return {"error": f"No candidate with ID {args['candidate_id']}"}
        return _candidate_full(c)

    # ── get_candidate_full_report ──────────────────────────────────────────
    if name == "get_candidate_full_report":
        c = db.query(Candidate).filter(Candidate.id == args["candidate_id"]).first()
        if not c:
            return {"error": f"No candidate with ID {args['candidate_id']}"}

        data = _candidate_full(c)
        job_context = ""
        if args.get("job_id"):
            j = db.query(Job).filter(Job.id == args["job_id"]).first()
            if j:
                req = _load(j.required_skills)
                job_context = (
                    f"\n\nTarget Role: {j.title}\n"
                    f"Required Skills: {', '.join(req)}\n"
                    f"Experience Needed: {j.experience or 'Not specified'}"
                )

        prompt = f"""You are a senior talent acquisition specialist. Write a comprehensive candidate report.

## Candidate Data
Name: {data['name']}
Email: {data['email']} | Phone: {data['phone'] or 'N/A'} | Location: {data['location'] or 'N/A'}
LinkedIn: {data['linkedin'] or 'N/A'} | GitHub: {data['github'] or 'N/A'}
ATS Score: {data['ats_score']}/100 | Status: {data['status']}
Experience: {data['experience_years']} years {'(Fresher)' if data['experience']['is_fresher'] else ''}
Previous Titles: {', '.join(data['experience']['job_titles']) or 'N/A'}
Previous Companies: {', '.join(data['experience']['companies']) or 'N/A'}
Education: {data['education']['degree'] or 'N/A'} from {data['education']['college'] or 'N/A'} ({data['education']['year'] or 'N/A'})
All Skills: {', '.join(data['skills_all']) or 'N/A'}
Certifications: {', '.join(data['certifications']) or 'None'}
Languages: {', '.join(data['languages']) or 'N/A'}
Projects: {json.dumps(data['projects'][:3], indent=2)}{job_context}

Write a detailed narrative report with these sections:
1. **Executive Summary** (2-3 sentences)
2. **Key Strengths** (bullet list)
3. **Areas of Concern / Gaps** (bullet list)
4. **Technical Depth Assessment**
5. **Culture & Communication Fit**
6. **Career Trajectory Analysis**
7. **Suggested Roles & Teams**
8. **Final Recommendation** (Strong Hire / Hire / Hold / Pass / Strong Pass)

Be specific, use the actual data, and write like a human recruiter."""

        report = generate_content(prompt, timeout=45)
        return {"candidate": data["name"], "report": report}

    # ── compare_candidates ─────────────────────────────────────────────────
    if name == "compare_candidates":
        ids = args.get("candidate_ids", [])
        candidates = [db.query(Candidate).filter(Candidate.id == cid).first() for cid in ids]
        candidates = [c for c in candidates if c]
        if not candidates:
            return {"error": "None of the given candidate IDs were found."}

        profiles = [_candidate_full(c) for c in candidates]

        job_context = ""
        if args.get("job_id"):
            j = db.query(Job).filter(Job.id == args["job_id"]).first()
            if j:
                scores = {}
                for c in candidates:
                    try:
                        r = calculate_match(c, j)
                        scores[c.id] = r.get("match_score", 0)
                    except Exception:
                        scores[c.id] = 0
                for p in profiles:
                    p["match_score_for_job"] = scores.get(p["id"], 0)
                job_context = f"\nJob being compared against: {j.title}"

        summary_lines = []
        for p in profiles:
            summary_lines.append(
                f"- {p['name']} (ID:{p['id']}): {p['experience_years']}yr exp, "
                f"ATS={p['ats_score']}, Skills={', '.join(p['skills_all'][:8])}, "
                f"Status={p['status']}"
            )

        prompt = f"""Compare these {len(profiles)} candidates side-by-side.{job_context}

{chr(10).join(summary_lines)}

Create a structured comparison with:
1. **Comparison Table** (name, experience, ATS score, top skills, education)
2. **Strengths per Candidate** (brief bullets for each)
3. **Weaknesses per Candidate** (brief bullets for each)
4. **Head-to-Head Summary**
5. **Final Recommendation** — who to advance and why"""

        comparison = generate_content(prompt, timeout=40)
        return {"compared": [p["name"] for p in profiles], "comparison": comparison}

    # ── search_candidates_by_skill ─────────────────────────────────────────
    if name == "search_candidates_by_skill":
        query_skills = [s.lower() for s in args.get("skills", [])]
        results = []
        for c in db.query(Candidate).all():
            c_skills = [s.lower() for s in _load(c.skills)]
            matched = [qs for qs in query_skills if any(qs in cs or cs in qs for cs in c_skills)]
            if matched:
                snap = _candidate_snapshot(c)
                snap["matched_on"] = matched
                results.append(snap)
        return {"searched_for": query_skills, "found": len(results), "candidates": results}

    # ── get_all_jobs ───────────────────────────────────────────────────────
    if name == "get_all_jobs":
        rows = db.query(Job).all()
        return {
            "total": len(rows),
            "jobs": [
                {
                    "id": j.id,
                    "title": j.title,
                    "company": j.company,
                    "location": j.location,
                    "employment_type": j.employment_type,
                    "experience_required": j.experience,
                    "salary": j.salary,
                    "required_skills": _load(j.required_skills),
                    "status": j.status,
                }
                for j in rows
            ],
        }

    # ── rank_candidates_for_job ────────────────────────────────────────────
    if name == "rank_candidates_for_job":
        job = db.query(Job).filter(Job.id == args["job_id"]).first()
        if not job:
            return {"error": f"Job {args['job_id']} not found."}
        top_n = int(args.get("top_n", 5))
        ranked = []
        for c in db.query(Candidate).all():
            try:
                r = calculate_match(c, job)
                ranked.append({
                    "candidate_id": c.id,
                    "name": c.name,
                    "email": c.email,
                    "match_score": r.get("match_score", 0),
                    "recommendation": r.get("recommendation", ""),
                    "matched_skills": r.get("matched_skills", [])[:8],
                    "missing_skills": r.get("missing_skills", [])[:5],
                    "experience_years": c.experience_years,
                    "current_status": c.status,
                    "ats_score": c.ats_score,
                })
            except Exception as exc:
                logger.warning("Match error for %s: %s", c.id, exc)
        ranked.sort(key=lambda x: x["match_score"], reverse=True)
        return {
            "job_title": job.title,
            "total_evaluated": len(ranked),
            "top_candidates": ranked[:top_n],
        }

    # ── shortlist_top_candidates ───────────────────────────────────────────
    if name == "shortlist_top_candidates":
        job = db.query(Job).filter(Job.id == args["job_id"]).first()
        if not job:
            return {"error": f"Job {args['job_id']} not found."}
        top_n = int(args.get("top_n", 5))
        min_score = float(args.get("min_score", 0))
        ranked = []
        for c in db.query(Candidate).all():
            try:
                r = calculate_match(c, job)
                score = r.get("match_score", 0)
                if score >= min_score:
                    ranked.append((score, c))
            except Exception:
                pass
        ranked.sort(key=lambda x: x[0], reverse=True)
        shortlisted = []
        for score, c in ranked[:top_n]:
            c.status = "Screening"
            shortlisted.append({"id": c.id, "name": c.name, "match_score": score})
        db.commit()
        return {
            "job_title": job.title,
            "shortlisted_count": len(shortlisted),
            "shortlisted": shortlisted,
            "message": f"Moved top {len(shortlisted)} candidates to Screening.",
        }

    # ── get_pipeline_stats ─────────────────────────────────────────────────
    if name == "get_pipeline_stats":
        rows = db.query(Candidate).all()
        by_status: dict = {}
        total_score = 0
        for c in rows:
            by_status[c.status] = by_status.get(c.status, 0) + 1
            total_score += c.ats_score or 0
        avg = round(total_score / len(rows), 1) if rows else 0
        top5 = sorted(rows, key=lambda c: c.ats_score or 0, reverse=True)[:5]
        return {
            "total_candidates": len(rows),
            "by_status": by_status,
            "average_ats_score": avg,
            "top_candidates_by_score": [
                {"name": c.name, "ats_score": c.ats_score, "status": c.status} for c in top5
            ],
        }

    # ── update_candidate_status ────────────────────────────────────────────
    if name == "update_candidate_status":
        valid = {"Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"}
        new_status = args.get("new_status", "").strip()
        if new_status not in valid:
            return {"error": f"Invalid status '{new_status}'. Choose from: {sorted(valid)}"}
        c = db.query(Candidate).filter(Candidate.id == args["candidate_id"]).first()
        if not c:
            return {"error": f"No candidate with ID {args['candidate_id']}"}
        old = c.status
        c.status = new_status
        db.commit()
        return {"success": True, "candidate": c.name, "id": c.id, "from": old, "to": new_status}

    # ── bulk_update_status ─────────────────────────────────────────────────
    if name == "bulk_update_status":
        valid = {"Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"}
        new_status = args.get("new_status", "").strip()
        if new_status not in valid:
            return {"error": f"Invalid status '{new_status}'."}
        updated = []
        for cid in args.get("candidate_ids", []):
            c = db.query(Candidate).filter(Candidate.id == cid).first()
            if c:
                c.status = new_status
                updated.append(c.name)
        db.commit()
        return {
            "success": True,
            "updated_count": len(updated),
            "candidates_updated": updated,
            "new_status": new_status,
        }

    # ── bulk_reject_below_score ────────────────────────────────────────────
    if name == "bulk_reject_below_score":
        threshold = float(args.get("threshold", 40))
        rejected = []
        for c in db.query(Candidate).all():
            if (c.ats_score or 0) < threshold and c.status not in ("Hired", "Offer"):
                c.status = "Rejected"
                rejected.append({"name": c.name, "id": c.id, "score": c.ats_score})
        db.commit()
        return {
            "threshold": threshold,
            "rejected_count": len(rejected),
            "rejected": rejected,
        }

    # ── initiate_ai_interview ──────────────────────────────────────────────
    if name == "initiate_ai_interview":
        c = db.query(Candidate).filter(Candidate.id == args["candidate_id"]).first()
        if not c:
            return {"error": f"No candidate with ID {args['candidate_id']}"}
        data = _candidate_full(c)
        num_q = int(args.get("num_questions", 6))

        job_context = ""
        job_skills = []
        if args.get("job_id"):
            j = db.query(Job).filter(Job.id == args["job_id"]).first()
            if j:
                job_skills = _load(j.required_skills)
                job_context = (
                    f"\nTarget Role: {j.title}\n"
                    f"Required Skills: {', '.join(job_skills)}\n"
                    f"Experience Required: {j.experience or 'N/A'}"
                )

        prompt = f"""You are a senior technical interviewer. Create an interview plan for this candidate.

Candidate: {data['name']}
Skills: {', '.join(data['skills_all'][:15])}
Experience: {data['experience_years']} years | Titles: {', '.join(data['experience']['job_titles'][:3])}
Projects: {', '.join(p.get('title','') for p in data['projects'][:3])}{job_context}

Generate exactly {num_q} interview questions as a JSON array with this format:
[
  {{
    "number": 1,
    "category": "Technical|Behavioural|System Design|Problem Solving",
    "question": "The actual question text",
    "what_to_look_for": "Key points a strong answer should cover",
    "max_score": 10
  }}
]

Make questions progressively deeper. Mix technical (about their specific stack), 
behavioural (STAR format), and 1 system design if they have 2+ years experience.
Return ONLY the JSON array, no other text."""

        questions_raw = generate_content(prompt, timeout=40)
        # Strip markdown code fences if present
        questions_raw = re.sub(r"^```json\s*", "", questions_raw.strip())
        questions_raw = re.sub(r"^```\s*", "", questions_raw)
        questions_raw = re.sub(r"\s*```$", "", questions_raw)

        try:
            questions = json.loads(questions_raw)
        except Exception:
            questions = [{"number": 1, "category": "General", "question": questions_raw, "what_to_look_for": "", "max_score": 10}]

        return {
            "candidate_name": data["name"],
            "candidate_id": c.id,
            "total_questions": len(questions),
            "questions": questions,
            "first_question": questions[0]["question"] if questions else "Could not generate questions.",
            "instruction": "Ask each question one at a time. After all answers, call evaluate_full_interview with the Q&A pairs.",
        }

    # ── evaluate_full_interview ────────────────────────────────────────────
    if name == "evaluate_full_interview":
        c = db.query(Candidate).filter(Candidate.id == args["candidate_id"]).first()
        if not c:
            return {"error": f"No candidate with ID {args['candidate_id']}"}

        qa_raw = args.get("qa_pairs", "[]")
        try:
            qa_pairs = json.loads(qa_raw) if isinstance(qa_raw, str) else qa_raw
        except Exception:
            qa_pairs = []

        job_context = ""
        if args.get("job_id"):
            j = db.query(Job).filter(Job.id == args["job_id"]).first()
            if j:
                job_context = f"\nRole: {j.title} | Required: {', '.join(_load(j.required_skills))}"

        qa_text = "\n".join(
            f"Q{i+1}: {qa.get('question','')}\nAnswer: {qa.get('answer','(no answer)')}\n"
            for i, qa in enumerate(qa_pairs)
        )

        prompt = f"""You are a senior HR evaluator. Evaluate this interview transcript.

Candidate: {c.name} | Experience: {c.experience_years} years{job_context}
Skills: {', '.join(_load(c.skills)[:12])}

Interview Transcript:
{qa_text}

Provide a structured evaluation as a JSON object:
{{
  "per_question_scores": [
    {{"question_number": 1, "score": 7, "max": 10, "feedback": "brief feedback"}}
  ],
  "total_score": 72,
  "max_possible": 100,
  "technical_score": 75,
  "communication_score": 80,
  "problem_solving_score": 65,
  "key_strengths": ["strength 1", "strength 2", "strength 3"],
  "areas_for_improvement": ["area 1", "area 2"],
  "overall_assessment": "2-3 sentence narrative",
  "recommendation": "Strong Hire | Hire | Hold | Pass | Strong Pass",
  "confidence": "High | Medium | Low"
}}

Return ONLY the JSON object."""

        eval_raw = generate_content(prompt, timeout=40)
        eval_raw = re.sub(r"^```json\s*", "", eval_raw.strip())
        eval_raw = re.sub(r"^```\s*", "", eval_raw)
        eval_raw = re.sub(r"\s*```$", "", eval_raw)

        try:
            evaluation = json.loads(eval_raw)
        except Exception:
            evaluation = {"raw_evaluation": eval_raw}

        # Save to DB if requested (default True)
        if args.get("save_result", True) and isinstance(evaluation, dict):
            c.interview_result = evaluation.get("recommendation", "Completed")
            c.interview_score = int(evaluation.get("total_score", 0))
            c.interview_feedback = evaluation.get("overall_assessment", "")
            db.commit()

        return {
            "candidate_name": c.name,
            "evaluation": evaluation,
            "saved_to_db": args.get("save_result", True),
        }

    # ── create_candidate_from_text ─────────────────────────────────────────
    if name == "create_candidate_from_text":
        text = args.get("text_description", "")
        if not text.strip():
            return {"error": "No text description provided."}

        parse_prompt = f"""Extract candidate information from this text and return ONLY a valid JSON object.

Text: {text}

JSON format:
{{
  "name": "string (required)",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "linkedin": "string or null",
  "github": "string or null",
  "summary": "string or null",
  "skills": ["list of all technical and soft skills"],
  "experience_years": 0,
  "job_titles": ["previous job titles"],
  "companies": ["previous companies"],
  "fresher": false,
  "degree": "string or null",
  "college": "string or null",
  "graduation_year": "string or null",
  "certifications": ["list"],
  "languages": ["spoken languages"],
  "projects": [
    {{"title": "...", "description": "...", "technologies": [...]}}
  ]
}}

Rules:
- If email is not found, set to null
- Estimate experience_years from context
- Extract every skill mentioned (programming languages, frameworks, tools, soft skills)
- Return ONLY JSON, no markdown, no explanation"""

        parsed_raw = generate_content(parse_prompt, timeout=35)
        parsed_raw = re.sub(r"^```json\s*", "", parsed_raw.strip())
        parsed_raw = re.sub(r"^```\s*", "", parsed_raw)
        parsed_raw = re.sub(r"\s*```$", "", parsed_raw)

        try:
            parsed = json.loads(parsed_raw)
        except Exception as exc:
            return {"error": f"Could not parse candidate info from text: {exc}", "raw": parsed_raw[:300]}

        # Require name at minimum
        if not parsed.get("name"):
            return {"error": "Could not extract candidate name from the description."}

        # Generate placeholder email if not found
        email = parsed.get("email")
        if not email:
            safe_name = re.sub(r"[^a-z0-9]", ".", parsed["name"].lower())
            email = f"{safe_name}.{uuid.uuid4().hex[:6]}@candidate.ats"

        # Check for existing candidate with same email
        existing = db.query(Candidate).filter(Candidate.email == email).first()
        if existing:
            return {
                "error": f"A candidate with email {email} already exists.",
                "existing_candidate_id": existing.id,
                "existing_name": existing.name,
            }

        # Build structured experience & education objects
        experience = {
            "years": parsed.get("experience_years", 0),
            "job_titles": parsed.get("job_titles", []),
            "companies": parsed.get("companies", []),
            "fresher": parsed.get("fresher", parsed.get("experience_years", 0) == 0),
        }
        education = {
            "degree": parsed.get("degree"),
            "college": parsed.get("college"),
            "year": parsed.get("graduation_year"),
        }

        candidate = Candidate(
            name=parsed["name"],
            email=email,
            phone=parsed.get("phone"),
            location=parsed.get("location"),
            linkedin=parsed.get("linkedin"),
            github=parsed.get("github"),
            summary=parsed.get("summary"),
            skills=json.dumps(parsed.get("skills", [])),
            experience=json.dumps(experience),
            experience_years=int(parsed.get("experience_years", 0)),
            education=json.dumps(education),
            projects=json.dumps(parsed.get("projects", [])),
            certifications=json.dumps(parsed.get("certifications", [])),
            languages=json.dumps(parsed.get("languages", [])),
            ats_score=0,
            status="Applied",
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        return {
            "success": True,
            "candidate_id": candidate.id,
            "candidate_name": candidate.name,
            "email_used": email,
            "email_was_provided": bool(parsed.get("email")),
            "extracted_profile": {
                "skills_count": len(parsed.get("skills", [])),
                "experience_years": parsed.get("experience_years", 0),
                "skills": parsed.get("skills", [])[:15],
                "education": education,
                "projects_count": len(parsed.get("projects", [])),
            },
            "message": f"✅ {candidate.name} has been added to the ATS system with ID {candidate.id}.",
        }

    # ── create_job_posting ─────────────────────────────────────────────────
    if name == "create_job_posting":
        required_skills = args.get("required_skills", [])
        job = Job(
            title=args["title"],
            company=args.get("company"),
            location=args.get("location"),
            employment_type=args.get("employment_type"),
            experience=args.get("experience"),
            salary=args.get("salary"),
            description=args["description"],
            required_skills=json.dumps(required_skills),
            status="Open",
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return {
            "success": True,
            "job_id": job.id,
            "title": job.title,
            "required_skills": required_skills,
            "message": f"✅ Job '{job.title}' created successfully with ID {job.id}.",
        }

    # ── delete_candidate ───────────────────────────────────────────────────
    if name == "delete_candidate":
        c = db.query(Candidate).filter(Candidate.id == args["candidate_id"]).first()
        if not c:
            return {"error": f"No candidate with ID {args['candidate_id']}"}
        name_saved = c.name
        cid_saved = c.id
        # Delete resume file if present
        if c.resume_url:
            try:
                from pathlib import Path
                p = Path(c.resume_url)
                if p.exists():
                    p.unlink()
            except Exception:
                pass
        db.delete(c)
        db.commit()
        return {
            "success": True,
            "deleted_name": name_saved,
            "deleted_id": cid_saved,
            "message": f"🗑️ {name_saved} has been permanently deleted.",
        }

    # ── get_recruitment_intelligence ───────────────────────────────────────
    if name == "get_recruitment_intelligence":
        rows = db.query(Candidate).all()
        jobs = db.query(Job).all()
        by_status: dict = {}
        skill_freq: dict = {}
        total_score = 0
        for c in rows:
            by_status[c.status] = by_status.get(c.status, 0) + 1
            total_score += c.ats_score or 0
            for s in _load(c.skills):
                sf = s.lower().strip()
                skill_freq[sf] = skill_freq.get(sf, 0) + 1
        avg_score = round(total_score / len(rows), 1) if rows else 0
        top_skills = sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:15]
        required_skill_freq: dict = {}
        for j in jobs:
            for s in _load(j.required_skills):
                sf = s.lower().strip()
                required_skill_freq[sf] = required_skill_freq.get(sf, 0) + 1
        top_required = sorted(required_skill_freq.items(), key=lambda x: x[1], reverse=True)[:15]

        prompt = f"""You are a recruitment analytics expert. Generate a strategic intelligence report.

PIPELINE DATA:
- Total Candidates: {len(rows)} | Open Jobs: {len(jobs)}
- Average ATS Score: {avg_score}/100
- Pipeline Breakdown: {json.dumps(by_status)}
- Top 15 Skills in Candidate Pool: {json.dumps(dict(top_skills))}
- Top 15 Skills Required by Jobs: {json.dumps(dict(top_required))}

Write a strategic recruitment intelligence report with:
1. **Pipeline Health Assessment**
2. **Skill Gap Analysis** (what skills jobs need that candidates lack)
3. **Talent Pool Strengths** (what skills are abundant)
4. **Bottleneck Identification** (where candidates are stalling)
5. **Top 3 Actionable Recommendations** for the hiring team
6. **Urgency Flags** (anything that needs immediate attention)

Be specific with the numbers. Write for a hiring manager audience."""

        report = generate_content(prompt, timeout=45)
        return {
            "total_candidates": len(rows),
            "open_jobs": len(jobs),
            "avg_ats_score": avg_score,
            "pipeline": by_status,
            "intelligence_report": report,
        }

    return {"error": f"Unknown tool: {name}"}


# ─────────────────────────────────────────────
# GEMINI REST CALLER
# ─────────────────────────────────────────────

MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.1-flash-lite"]


def _call_gemini(messages: list) -> dict:
    api_key = settings.GEMINI_API_KEY
    last_error = None
    for model in MODELS:
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/"
            f"models/{model}:generateContent?key={api_key}"
        )
        payload = {
            "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": messages,
            "tools": [{"functionDeclarations": TOOL_DECLARATIONS}],
            "toolConfig": {"functionCallingConfig": {"mode": "AUTO"}},
        }
        try:
            resp = requests.post(url, json=payload, timeout=50)
            if resp.status_code == 200:
                return resp.json()
            last_error = f"{model} → HTTP {resp.status_code}: {resp.text[:200]}"
            logger.warning("Gemini: %s", last_error)
        except Exception as exc:
            last_error = str(exc)
            logger.warning("Gemini request failed: %s", last_error)
    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")


# ─────────────────────────────────────────────
# AGENT ENDPOINT
# ─────────────────────────────────────────────


class AgentRequest(BaseModel):
    message: str
    history: list = []


@router.post("/")
async def run_agent(body: AgentRequest, db: Session = Depends(get_db)):
    if not settings.GEMINI_API_KEY:
        return {
            "reply": "AI Agent is not configured. Add GEMINI_API_KEY to backend/.env.",
            "tools_used": [],
        }

    try:
        messages = []
        for msg in body.history[-10:]:
            role = "user" if msg.get("role") == "user" else "model"
            messages.append({"role": role, "parts": [{"text": msg.get("text", "")}]})
        messages.append({"role": "user", "parts": [{"text": body.message}]})

        tools_used: list[str] = []

        for _iteration in range(8):  # max 8 tool-call rounds per user message
            response = _call_gemini(messages)
            candidate_resp = response.get("candidates", [{}])[0]
            content = candidate_resp.get("content", {})
            parts = content.get("parts", [])

            fn_calls = [p for p in parts if "functionCall" in p]
            text_parts = [p for p in parts if "text" in p]

            if not fn_calls:
                reply = " ".join(p["text"] for p in text_parts).strip()
                return {"reply": reply, "tools_used": tools_used}

            messages.append({"role": "model", "parts": parts})

            fn_responses = []
            for fc_part in fn_calls:
                fc = fc_part["functionCall"]
                tool_name = fc["name"]
                tool_args = fc.get("args", {})
                logger.info("Agent → %s(%s)", tool_name, tool_args)
                tools_used.append(tool_name)
                result = _execute_tool(tool_name, tool_args, db)
                fn_responses.append({
                    "functionResponse": {
                        "name": tool_name,
                        "response": {"result": result},
                    }
                })

            messages.append({"role": "user", "parts": fn_responses})

        return {
            "reply": "I reached the maximum reasoning steps. Please try a simpler request.",
            "tools_used": tools_used,
        }

    except Exception as exc:
        logger.error("Agent error: %s", exc, exc_info=True)
        return {"reply": "The agent encountered an internal error. Please try again.", "tools_used": []}
