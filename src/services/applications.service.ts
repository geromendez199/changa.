import { supabase } from "../lib/supabase";
import { Application } from "../types/domain";
import { ApplicationsRow, mapApplicationRow } from "../types/supabase";
import { normalizeError, ServiceResult, shouldUseFallback } from "./service.utils";

export async function getMyApplications(userId: string): Promise<ServiceResult<Application[]>> {
  if (shouldUseFallback()) return { data: [], source: "fallback" };

  try {
    const { data, error } = await supabase!
      .from("applications")
      .select("*")
      .eq("applicant_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: (data as ApplicationsRow[]).map(mapApplicationRow), source: "supabase" };
  } catch (error) {
    return { data: [], source: "fallback", error: normalizeError(error) };
  }
}
