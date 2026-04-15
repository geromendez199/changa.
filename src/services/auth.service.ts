import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface AuthResult {
  ok: boolean;
  message?: string;
}

function mapAuthError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("Invalid login credentials")) return "Email o contraseña incorrectos.";
    if (error.message.includes("User already registered")) return "Ese email ya está registrado.";
    return error.message;
  }
  return "Ocurrió un error inesperado con la autenticación.";
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  if (!supabase) return { unsubscribe: () => undefined };
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: "Falta configurar Supabase para iniciar sesión." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: mapAuthError(error) };
  return { ok: true };
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: "Falta configurar Supabase para crear la cuenta." };

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, message: mapAuthError(error) };
  return { ok: true, message: "Te enviamos un email para confirmar tu cuenta si tu proyecto lo requiere." };
}

export async function signOutUser(): Promise<AuthResult> {
  if (!supabase) return { ok: true };

  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, message: mapAuthError(error) };
  return { ok: true };
}

export type { User };
