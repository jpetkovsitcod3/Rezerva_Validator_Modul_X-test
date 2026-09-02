import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  apiLogin,
  apiLogout,
  apiSignup,
  fetchSessionUser,
  type User,
} from "./db";

/* ================= tiny hash router =================
   In-page anchors (#features) stay native; app routes
   live under #/… so a static single-file build works. */

export function currentRoute(): string {
  const h = window.location.hash;
  return h.startsWith("#/") ? h.slice(1) : "/";
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function useRoute(): string {
  const [route, setRoute] = useState(currentRoute());
  useEffect(() => {
    const on = () => setRoute(currentRoute());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

/* ================= auth ================= */

interface AuthCtx {
  user: User | null;
  booting: boolean;
  login: (email: string, pw: string) => Promise<User>;
  signup: (name: string, email: string, pw: string) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  booting: true,
  login: async () => Promise.reject(new Error("no provider")),
  signup: async () => Promise.reject(new Error("no provider")),
  logout: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchSessionUser()
      .then((u) => alive && setUser(u))
      .finally(() => alive && setBooting(false));
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (email: string, pw: string) => {
    const u = await apiLogin(email, pw);
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (name: string, email: string, pw: string) => {
    const u = await apiSignup(name, email, pw);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    navigate("/");
  }, []);

  const refresh = useCallback(async () => {
    const u = await fetchSessionUser();
    setUser(u);
  }, []);

  return (
    <Ctx.Provider value={{ user, booting, login, signup, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

/* ================= route guards ================= */

export function BootSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-1)]">
      <div className="flex flex-col items-center gap-4">
        <span className="spin size-8 rounded-full border-2 border-[rgba(160,160,184,.2)] border-t-[var(--cyan)]" />
        <span className="font-data text-[10px] tracking-[0.24em] text-[var(--text-3)] uppercase">
          Warming SMTP pools…
        </span>
      </div>
    </div>
  );
}

export function Guard({ admin, children }: { admin?: boolean; children: ReactNode }) {
  const { user, booting } = useAuth();
  useEffect(() => {
    if (booting) return;
    if (!user) navigate("/login");
    else if (admin && user.role !== "admin") navigate("/app");
  }, [user, booting, admin]);
  if (booting) return <BootSplash />;
  if (!user) return null;
  if (admin && user.role !== "admin") return null;
  return <>{children}</>;
}
