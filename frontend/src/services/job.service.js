import request from "./api";

export async function getJobs() {
  return request("/api/jobs/");
}

export async function getJob(id) {
  return request(`/api/jobs/${id}`);
}

export async function createJob(data) {
  return request("/api/jobs/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateJob(id, data) {
  return request(`/api/jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteJob(id) {
  return request(`/api/jobs/${id}`, {
    method: "DELETE",
  });
}