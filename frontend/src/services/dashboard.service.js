import request from "./api";

export async function getDashboardStats() {
  return request("/api/stats");
}