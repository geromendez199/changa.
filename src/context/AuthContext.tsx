import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getCurrentSession, onAuthStateChange, signInWithEmail, signOutUser, signUpWithEmail } from "../services/auth.service";
import { ensureProfileForUser } from "../services/profiles.service";

interface AuthContextValue {
  session: Session | null;
  userId: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signUp: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<{ ok: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const currentSession = await getCurrentSession();
      if (!mounted) return;
      setSession(currentSession);
      if (currentSession?.user) await ensureProfileForUser(currentSession.user);
      setIsLoading(false);
    };

    void bootstrap();

    const subscription = onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        await ensureProfileForUser(nextSession.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      userId: session?.user.id ?? null,
      isLoading,
      signIn: signInWithEmail,
      signUp: async (email: string, password: string) => {
        const result = await signUpWithEmail(email, password);
        if (result.ok) {
          const nextSession = await getCurrentSession();
          setSession(nextSession);
          if (nextSession?.user) await ensureProfileForUser(nextSession.user);
        }
        return result;
      },
      signOut: async () => {
        const result = await signOutUser();
        if (result.ok) {
          setSession(null);
        }
        return result;
      },
    }),
    [isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
