import request from "./api";

export async function getAnalytics() {
  return request("/api/analytics");
}