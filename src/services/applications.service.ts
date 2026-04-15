import { supabase } from "../lib/supabase";
import { Application } from "../types/domain";
import { ApplicationsRow, mapApplicationRow } from "../types/supabase";
import { failureResult, isNonEmptyString, normalizeError, ServiceResult, shouldUseFallback, successResult, toSafeArray } from "./service.utils";

export async function getMyApplications(userId: string): Promise<ServiceResult<Application[]>> {
  if (!isNonEmptyString(userId)) return successResult([], "fallback");
  if (shouldUseFallback()) return successResult([], "fallback");

  try {
    const { data, error } = await supabase!
      .from("applications")
      .select("*")
      .eq("applicant_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return successResult(
      toSafeArray<Partial<ApplicationsRow>>(data)
        .map(mapApplicationRow)
        .filter((application) => isNonEmptyString(application.id)),
    );
  } catch (error) {
    return failureResult([], normalizeError(error, "No pudimos cargar tus postulaciones."));
  }
}
