/**
 * WHY: Centralize error normalization and clearly define when local fallback mode is acceptable.
 * CHANGED: YYYY-MM-DD
 */
import { PostgrestError } from "@supabase/supabase-js";
import { isSupabaseEnabled, supabase } from "../lib/supabase";
import { ValidationError } from "../lib/validation/errors";

export interface ServiceResult<T> {
  data: T;
  source: "supabase" | "fallback";
  error?: string;
}

export function successResult<T>(data: T, source: "supabase" | "fallback" = "supabase"): ServiceResult<T> {
  return { data, source };
}

export function failureResult<T>(data: T, error: string, source: "supabase" | "fallback" = "fallback"): ServiceResult<T> {
  return { data, source, error };
}

/*
 * Fallback mode means the SPA is running without a configured Supabase client.
 * It is acceptable for local development when a contributor wants to inspect UI flows
 * without provisioning a Supabase project yet.
 * It is not acceptable in production, where missing environment variables must stop boot.
 * UI code can detect fallback mode through the returned ServiceResult.source value and
 * surface a clear message instead of pretending production data loaded successfully.
 */
export const FALLBACK_MODE = !isSupabaseEnabled || !supabase;
export const IS_DEVELOPMENT_FALLBACK = FALLBACK_MODE && import.meta.env.DEV;
export const FALLBACK_PREVIEW_MESSAGE =
  "Estás viendo una vista previa local con datos de muestra. Los cambios reales están disponibles cuando la app está configurada.";

export function isLocalPreviewSource(source: "supabase" | "fallback") {
  return IS_DEVELOPMENT_FALLBACK && source === "fallback";
}

function normalizeSupabaseMessage(message: string) {
  const normalizedMessage = message.trim();
  const lowerMessage = normalizedMessage.toLowerCase();

  if (lowerMessage.includes("necesitás iniciar sesión")) return "Necesitás iniciar sesión para continuar.";
  if (lowerMessage.includes("sólo podés usar tu propia sesión")) return "Tu sesión no coincide con esta operación. Volvé a iniciar sesión e intentá de nuevo.";
  if (lowerMessage.includes("solo podés usar tu propia sesión")) return "Tu sesión no coincide con esta operación. Volvé a iniciar sesión e intentá de nuevo.";
  if (lowerMessage.includes("ya te postulaste")) return "Ya te postulaste a esta changa.";
  if (lowerMessage.includes("no podés postularte a tu propia changa")) return "No podés postularte a tu propia changa.";
  if (lowerMessage.includes("no podés postularte a tu propia publicación")) return "No podés postularte a tu propia changa.";
  if (lowerMessage.includes("esta changa ya no acepta postulaciones")) return "Esta changa ya no acepta postulaciones.";
  if (lowerMessage.includes("no encontramos la changa")) return "No encontramos la changa para completar esta acción.";
  if (lowerMessage.includes("ya existe una conversación")) return "Ese chat ya existe y acabamos de recuperarlo.";
  if (lowerMessage.includes("solo las personas participantes")) return "No tenés permisos para entrar en esta conversación.";
  if (lowerMessage.includes("sólo las personas participantes")) return "No tenés permisos para entrar en esta conversación.";
  if (lowerMessage.includes("solo la persona dueña")) return "No tenés permisos para gestionar esta postulación.";
  if (lowerMessage.includes("sólo la persona dueña")) return "No tenés permisos para gestionar esta postulación.";
  if (lowerMessage.includes("permission denied")) return "No tenés permisos para realizar esta acción.";
  if (lowerMessage.includes("jwt")) return "Tu sesión expiró. Iniciá sesión nuevamente.";
  if (lowerMessage.includes("duplicate key value violates unique constraint")) {
    if (lowerMessage.includes("applications")) return "Ya te postulaste a esta changa.";
    if (lowerMessage.includes("conversations")) return "Ese chat ya existe y acabamos de recuperarlo.";
  }
  if (
    lowerMessage.includes("violates foreign key constraint") &&
    lowerMessage.includes("posted_by_user_id")
  ) {
    return "No pudimos preparar tu perfil para publicar. Cerrá sesión, volvé a entrar e intentá nuevamente.";
  }
  if (
    lowerMessage.includes("bucket not found") ||
    lowerMessage.includes("bucket not fund") ||
    (lowerMessage.includes("bucket") && lowerMessage.includes("not found"))
  ) {
    return "No pudimos guardar la foto de perfil. Probá nuevamente más tarde o guardá el perfil sin cambiar la imagen.";
  }

  const exposesInternalDetails =
    lowerMessage.includes("does not exist") ||
    lowerMessage.includes("invalid input syntax") ||
    lowerMessage.includes("type uuid") ||
    lowerMessage.includes("schema cache") ||
    lowerMessage.includes("relation ") ||
    lowerMessage.includes("column ") ||
    lowerMessage.includes("postgrest") ||
    lowerMessage.includes("supabase") ||
    lowerMessage.includes("stack trace") ||
    lowerMessage.includes("violates check constraint") ||
    lowerMessage.includes("violates not-null constraint") ||
    lowerMessage.includes("violates row-level security");

  if (exposesInternalDetails) {
    return "No pudimos completar la acción. Intentá nuevamente en unos minutos.";
  }

  return normalizedMessage;
}

export function normalizeError(error: unknown, fallbackMessage = "Error inesperado al consultar datos."): string {
  if (!error) return fallbackMessage;
  if (typeof error === "string") return normalizeSupabaseMessage(error);
  if (error instanceof ValidationError) return error.message;

  const pgError = error as PostgrestError;
  if (pgError?.message) {
    return normalizeSupabaseMessage(pgError.message);
  }

  if (error instanceof Error) return normalizeSupabaseMessage(error.message);
  return fallbackMessage;
}

export function shouldUseFallback() {
  return FALLBACK_MODE;
}

export async function getAuthenticatedUserId() {
  if (shouldUseFallback()) return null;

  const {
    data: { user },
    error,
  } = await supabase!.auth.getUser();

  if (error) {
    throw error;
  }

  return user?.id ?? null;
}

export async function ensureAuthenticatedUser(expectedUserId?: string) {
  const authenticatedUserId = await getAuthenticatedUserId();

  if (!isNonEmptyString(authenticatedUserId)) {
    throw new Error("Necesitás iniciar sesión para continuar.");
  }

  if (isNonEmptyString(expectedUserId) && authenticatedUserId !== expectedUserId) {
    throw new Error("Sólo podés usar tu propia sesión para completar esta acción.");
  }

  return authenticatedUserId;
}

export function getFallbackPreviewMessage(scope = "esta sección") {
  return `Estás viendo ${scope} con datos de muestra en un entorno local. Los cambios reales están disponibles cuando la app está configurada.`;
}

export function getFallbackActionMessage(action: string) {
  return `${action} no está disponible en esta vista previa local.`;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function toSafeNumber(value: unknown, fallback = 0): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export function toSafeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
