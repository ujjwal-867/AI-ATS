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
    localStorage.setItem(
      "token",
      response.access_token
    );

    if (response.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );
    }

    const isSecure =
      typeof window !== "undefined" &&
      window.location.protocol === "https:";

    document.cookie =
      `token=${response.access_token}; ` +
      `path=/; ` +
      `max-age=86400; ` +
      `SameSite=Lax` +
      (isSecure ? "; Secure" : "");
  }

  return response;
}

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const user = localStorage.getItem("user");

    if (!user) {
      return null;
    }

    return JSON.parse(user);
  } catch (error) {
    console.error(
      "Unable to read current user",
      error
    );

    return null;
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    const isSecure = window.location.protocol === "https:";
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax" +
      (isSecure ? "; Secure" : "");
  }
}

export async function getLoginHistory() {
  return await request("/api/auth/login-history");
}

export async function getUsersActivity() {
  return await request("/api/auth/users-activity");
}

export async function getRecentActivity() {
  return await request("/api/auth/recent-activity");
}