import request from "./api";


// =========================================================
// CANDIDATES
// =========================================================

export async function getCandidates() {
  return request("/api/candidates");
}


export async function getCandidate(id) {
  return request(`/api/candidates/${id}`);
}


export async function createCandidate(data) {
  return request("/api/candidates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


export async function updateCandidate(id, data) {
  return request(`/api/candidates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}


export async function deleteCandidate(id) {
  return request(`/api/candidates/${id}`, {
    method: "DELETE",
  });
}


// =========================================================
// INTERVIEWS
// =========================================================

export async function getInterviewCandidates() {
  return request("/api/candidates/interviews");
}


export async function getCompletedInterviews() {
  return request("/api/candidates/interviews/completed");
}


export async function scheduleInterview(id, data) {
  return request(
    `/api/candidates/${id}/interview`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}


export async function completeInterview(id, data) {
  return request(
    `/api/candidates/${id}/interview/result`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}


// =========================================================
// EMAIL VERIFICATION
// =========================================================

export async function verifyCandidateEmail(email) {
  return request(
    `/api/candidates/verify-email?email=${encodeURIComponent(email)}`
  );
}