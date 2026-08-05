import request from "./api";

export async function getDashboardAnalytics() {
  return request("/api/stats");
}

export async function getRecruiterAnalytics() {
  return request("/api/stats/recruiter");
}

export async function getCandidateAnalytics() {
  return request("/api/stats/candidate");
}

export async function getHiringTrends() {
  return request("/api/stats/trends");
}