import request from "./api";

export async function register(data) {
  return await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(credentials) {
  const response = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (typeof window !== "undefined") {
    localStorage.setItem("token", response.access_token);

    localStorage.setItem(
      "user",
      JSON.stringify(response.user)
    );

    document.cookie = `token=${response.access_token}; path=/; max-age=86400; SameSite=Lax`;
  }

  return response;
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}