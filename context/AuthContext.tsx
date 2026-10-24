import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/fetcher";
import type { SessionUser } from "@/types";

interface AuthContextValue {
  currentUser: SessionUser | null;
  isLoggedIn: boolean;
  /** True until the initial session check finishes. */
  loading: boolean;
  login: (user: SessionUser) => void;
  logout: (redirectTo?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ user: SessionUser | null }>("/api/auth/me").then((data) => {
      if (data.success) setCurrentUser(data.user);
      setLoading(false);
    });
  }, []);

  // Admins only browse the admin area.
  useEffect(() => {
    if (
      currentUser?.isAdmin &&
      !router.pathname.startsWith("/admin") &&
      router.pathname !== "/admindashboard"
    ) {
      router.replace("/admindashboard");
    }
  }, [currentUser, router]);

  const login = useCallback(
    (user: SessionUser) => {
      setCurrentUser(user);
      router.replace(user.isAdmin ? "/admindashboard" : "/profile");
    },
    [router]
  );

  const logout = useCallback(
    async (redirectTo = "/auth") => {
      await api("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      router.replace(redirectTo);
    },
    [router]
  );

  return (
    <AuthContext.Provider value={{ currentUser, isLoggedIn: !!currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
