import request from "./api";

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
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCandidate(id) {
  return request(`/api/candidates/${id}`, {
    method: "DELETE",
  });
}