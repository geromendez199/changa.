import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import {
  getCurrentSession,
  onAuthStateChange,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
} from "../services/auth.service";
import { ensureProfileForUser } from "../services/profiles.service";

interface AuthContextValue {
  session: Session | null;
  userId: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signInWithGoogle: (redirectPath?: string) => Promise<{ ok: boolean; message?: string }>;
  signUp: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<{ ok: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const ensureProfile = useCallback(async (nextSession: Session | null) => {
    if (!nextSession?.user) return;

    await ensureProfileForUser(nextSession.user);
  }, []);

  const syncSessionProfile = useCallback(
    async (nextSession: Session | null) => {
      setSession(nextSession);
      await ensureProfile(nextSession);
      return nextSession;
    },
    [ensureProfile],
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const currentSession = await getCurrentSession();
      if (!mounted) return;

      setSession(currentSession);
      setIsLoading(false);
      void ensureProfile(currentSession);
    };

    void bootstrap();

    const subscription = onAuthStateChange((_event, nextSession) => {
      void ensureProfile(nextSession);
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [ensureProfile]);

  const value = useMemo(
    () => ({
      session,
      userId: session?.user.id ?? null,
      isLoading,
      signIn: async (email: string, password: string) => {
        const result = await signInWithEmail(email, password);
        if (!result.ok) return result;

        const nextSession = await getCurrentSession();
        await syncSessionProfile(nextSession);
        return result;
      },
      signInWithGoogle: async (redirectPath?: string) => signInWithGoogle(redirectPath),
      signUp: async (email: string, password: string) => {
        const result = await signUpWithEmail(email, password);
        if (result.ok) {
          const nextSession = await getCurrentSession();
          await syncSessionProfile(nextSession);
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
    [isLoading, session, syncSessionProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
