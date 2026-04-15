import { isSupabaseEnabled, supabase } from "../lib/supabase";

export interface ServiceResult<T> {
  data: T;
  source: "supabase" | "fallback";
  error?: string;
}

export function normalizeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Error inesperado al consultar datos.";
}

export function shouldUseFallback() {
  return !isSupabaseEnabled || !supabase;
}
