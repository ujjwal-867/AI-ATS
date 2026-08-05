import request from "./api";

export async function matchCandidate(data) {
  return request("/api/match", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMatchHistory() {
  return request("/api/match/history");
}

export async function getMatchById(id) {
  return request(`/api/match/${id}`);
}