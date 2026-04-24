/**
 * WHY: Validate auth credentials consistently before calling Supabase Auth.
 * CHANGED: YYYY-MM-DD
 */
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { authCredentialsSchema, parseWithValidation } from "../lib/validation/schemas";
import { isNonEmptyString, shouldUseFallback, normalizeError } from "./service.utils";
import { supabase } from "../lib/supabase";

export interface AuthResult {
  ok: boolean;
  message?: string;
}

function mapAuthError(error: unknown): string {
  const errorMessage = normalizeError(error, "Ocurrió un error inesperado con la autenticación.");

  if (errorMessage.includes("Invalid login credentials")) return "Email o contraseña incorrectos.";
  if (errorMessage.includes("User already registered")) return "Ese email ya está registrado.";
  if (errorMessage.includes("Password should be at least")) return "La contraseña debe tener al menos 6 caracteres.";
  if (errorMessage.includes("Email not confirmed")) return "Confirmá tu email para continuar.";

  return errorMessage;
}

function buildOAuthRedirectUrl(redirectPath = "/home") {
  const fallbackPath = "/home";
  const safePath =
    isNonEmptyString(redirectPath) && redirectPath.startsWith("/") && !redirectPath.startsWith("//")
      ? redirectPath
      : fallbackPath;

  return new URL(safePath, window.location.origin).toString();
}

export async function getCurrentSession(): Promise<Session | null> {
  if (shouldUseFallback()) return null;

  try {
    const { data, error } = await supabase!.auth.getSession();
    if (error) throw error;
    return data.session ?? null;
  } catch {
    return null;
  }
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  if (shouldUseFallback()) return { unsubscribe: () => undefined };

  const { data } = supabase!.auth.onAuthStateChange((event, session) => {
    callback(event, session ?? null);
  });

  return data.subscription;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const credentials = parseWithValidation(authCredentialsSchema, { email, password });
    if (shouldUseFallback()) return { ok: false, message: "El inicio de sesión no está disponible en esta vista previa." };

    const { error } = await supabase!.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, message: mapAuthError(error) };
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const credentials = parseWithValidation(authCredentialsSchema, { email, password });
    if (shouldUseFallback()) return { ok: false, message: "El registro no está disponible en esta vista previa." };

    const { error } = await supabase!.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw error;

    return { ok: true, message: "Cuenta creada. Revisá tu email si tu proyecto requiere confirmación." };
  } catch (error) {
    return { ok: false, message: mapAuthError(error) };
  }
}

export async function signInWithGoogle(redirectPath = "/home"): Promise<AuthResult> {
  if (shouldUseFallback()) {
    return { ok: false, message: "Google Auth no está disponible en esta vista previa." };
  }

  try {
    const { error } = await supabase!.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildOAuthRedirectUrl(redirectPath),
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, message: mapAuthError(error) };
  }
}

export async function signOutUser(): Promise<AuthResult> {
  if (shouldUseFallback()) return { ok: true };

  try {
    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, message: mapAuthError(error) };
  }
}

export type { User };
