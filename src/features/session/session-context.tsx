import { createContext, useContext } from "react";
import type { Session } from "@/lib/types";

const SessionCtx = createContext<Session | null>(null);

export const SessionProvider = SessionCtx.Provider;

export function useSession(): Session {
  const s = useContext(SessionCtx);
  if (!s) throw new Error("useSession must be used within SessionProvider");
  return s;
}

export function useOptionalSession(): Session | null {
  return useContext(SessionCtx);
}
