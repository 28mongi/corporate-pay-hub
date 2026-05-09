import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "./types";
import { users, company } from "./mock-data";

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  companyName: string;
}

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "cpp.session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* noop */ }
    }
  }, []);

  const login = async (email: string, _password: string) => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? users[0];
    setUser(found);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <Ctx.Provider value={{ user, login, logout, companyName: company.name }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
