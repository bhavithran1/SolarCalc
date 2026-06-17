import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, clearToken, getToken } from "../lib/api.js";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api("/auth/me").then((d) => setUser(d.user)).catch(() => clearToken()).finally(() => setLoading(false));
  }, []);

  const handleAuth = (data) => { setToken(data.token); setUser(data.user); return data.user; };
  const login = async (email, password) => handleAuth(await api("/auth/login", { method: "POST", body: { email, password } }));
  const register = async (payload) => handleAuth(await api("/auth/register", { method: "POST", body: payload }));
  const logout = () => { clearToken(); setUser(null); };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
