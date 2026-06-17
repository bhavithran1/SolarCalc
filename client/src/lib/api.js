const TOKEN_KEY = "solarcalc_token";
const API_BASE = import.meta.env.VITE_API_URL || "";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function api(path, { method = "GET", body, timeout = 12000 } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let res;
  try {
    res = await fetch(`${API_BASE}/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: controller.signal });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") throw new Error("Request timed out — check your connection.");
    throw new Error("Can't reach the server. Is the backend running?");
  }
  clearTimeout(timer);
  if (res.status === 401 && token) clearToken();

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}
