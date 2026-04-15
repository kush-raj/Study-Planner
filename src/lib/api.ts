// Central API configuration
// Change this to your deployed URL when deploying
export const API_URL = "http://localhost:5000";

// Helper to get auth headers
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

// Helper to check if user is logged in
export function isLoggedIn(): boolean {
  return !!localStorage.getItem("token");
}

// Auth event system - broadcast login/logout across components
export const AUTH_EVENT = "authStateChanged";
export const SCHEDULE_EVENT = "scheduleUpdated";

export function broadcastAuth(user: any | null) {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: user }));
}

export function broadcastScheduleUpdate(schedule: any[]) {
  window.dispatchEvent(new CustomEvent(SCHEDULE_EVENT, { detail: schedule }));
}

// Typed fetch helper with error handling
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}
