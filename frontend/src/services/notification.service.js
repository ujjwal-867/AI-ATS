import request from "./api";

export async function getNotifications() {
  return request("/api/notifications/");
}