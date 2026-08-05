import request from "./api";

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  return request("/api/upload/resume", {
    method: "POST",
    body: formData,
  });
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  return request("/api/upload/avatar", {
    method: "POST",
    body: formData,
  });
}