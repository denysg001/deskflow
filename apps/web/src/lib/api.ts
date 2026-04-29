const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type SessionUser = { id: string; name: string; email: string; role: "ADMIN" | "OPERATOR" | "CLIENT"; clientId?: string };

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("deskflow_token");
}

export function setSession(token: string, user: SessionUser) {
  window.localStorage.setItem("deskflow_token", token);
  window.localStorage.setItem("deskflow_user", JSON.stringify(user));
}

export function getUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("deskflow_user");
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  window.localStorage.removeItem("deskflow_token");
  window.localStorage.removeItem("deskflow_user");
  window.location.href = "/login";
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro inesperado." }));
    throw new Error(error.message || "Erro inesperado.");
  }
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("text/csv")) return (await response.text()) as T;
  return response.json();
}
