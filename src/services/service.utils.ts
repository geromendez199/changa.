import { PostgrestError } from "@supabase/supabase-js";
import { isSupabaseEnabled, supabase } from "../lib/supabase";

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

export function normalizeError(error: unknown, fallbackMessage = "Error inesperado al consultar datos."): string {
  if (!error) return fallbackMessage;
  if (typeof error === "string") return error;

  const pgError = error as PostgrestError;
  if (pgError?.message) {
    if (pgError.message.includes("permission denied")) return "No tenés permisos para realizar esta acción.";
    if (pgError.message.includes("JWT")) return "Tu sesión expiró. Iniciá sesión nuevamente.";
    return pgError.message;
  }

  if (error instanceof Error) return error.message;
  return fallbackMessage;
}

export function shouldUseFallback() {
  return !isSupabaseEnabled || !supabase;
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
