import { getSampleApplications } from "../data/mockData";
import { supabase } from "../lib/supabase";
import { Application } from "../types/domain";
import { ApplicationsRow, mapApplicationRow } from "../types/supabase";
import { failureResult, isNonEmptyString, normalizeError, ServiceResult, shouldUseFallback, successResult, toSafeArray } from "./service.utils";

export async function getMyApplications(userId: string): Promise<ServiceResult<Application[]>> {
  if (!isNonEmptyString(userId)) return successResult([], "fallback");
  if (shouldUseFallback()) return successResult(getSampleApplications(userId), "fallback");

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

export async function withdrawApplication(
  applicationId: string,
  applicantUserId: string,
): Promise<ServiceResult<boolean>> {
  if (!isNonEmptyString(applicationId) || !isNonEmptyString(applicantUserId)) {
    return failureResult(false, "No pudimos identificar la postulación.");
  }

  try {
    if (shouldUseFallback()) return successResult(true, "fallback");

    const { error } = await supabase!
      .from("applications")
      .delete()
      .eq("id", applicationId)
      .eq("applicant_user_id", applicantUserId);

    if (error) throw error;

    return successResult(true);
  } catch (error) {
    return failureResult(false, normalizeError(error, "No pudimos retirarte de esta postulación."));
  }
}
