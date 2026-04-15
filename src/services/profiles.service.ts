import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Profile, Review } from "../types/domain";
import { ProfilesRow, ReviewsRow, mapProfileRow, mapReviewRow } from "../types/supabase";
import { normalizeError, ServiceResult, shouldUseFallback } from "./service.utils";

export interface ProfileBundle {
  profile: Profile;
  reviews: Review[];
}

const defaultTrust = ["Email validado"];

export async function ensureProfileForUser(user: User): Promise<ServiceResult<Profile | null>> {
  if (shouldUseFallback()) return { data: null, source: "fallback" };

  const defaultName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";
  const avatarLetter = defaultName.trim().charAt(0).toUpperCase() || "U";

  try {
    const payload = {
      id: user.id,
      full_name: defaultName,
      avatar_letter: avatarLetter,
      location: "Ubicación pendiente",
      member_since: new Date().toLocaleString("es-AR", { month: "long", year: "numeric" }),
      trust_indicators: defaultTrust,
      success_rate: 0,
    };

    const { data, error } = await supabase!.from("profiles").upsert(payload).select("*").single();
    if (error) throw error;
    return { data: mapProfileRow(data as ProfilesRow), source: "supabase" };
  } catch (error) {
    return { data: null, source: "fallback", error: normalizeError(error) };
  }
}

export async function updateProfileLocation(userId: string, location: string): Promise<ServiceResult<Profile | null>> {
  if (shouldUseFallback()) return { data: null, source: "fallback" };

  try {
    const { data, error } = await supabase!
      .from("profiles")
      .update({ location })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return { data: mapProfileRow(data as ProfilesRow), source: "supabase" };
  } catch (error) {
    return { data: null, source: "fallback", error: normalizeError(error) };
  }
}

export async function getProfileBundle(userId: string): Promise<ServiceResult<ProfileBundle | null>> {
  if (shouldUseFallback()) return { data: null, source: "fallback" };

  try {
    const [{ data: profileRow, error: profileError }, { data: reviewsRows, error: reviewsError }] = await Promise.all([
      supabase!.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase!.from("reviews").select("*").eq("reviewed_user_id", userId).order("created_at", { ascending: false }).limit(5),
    ]);

    if (profileError) throw profileError;
    if (reviewsError) throw reviewsError;
    if (!profileRow) return { data: null, source: "supabase" };

    return {
      data: {
        profile: mapProfileRow(profileRow as ProfilesRow),
        reviews: (reviewsRows as ReviewsRow[]).map(mapReviewRow),
      },
      source: "supabase",
    };
  } catch (error) {
    return { data: null, source: "fallback", error: normalizeError(error) };
  }
}

export async function getPublicProfiles(): Promise<ServiceResult<Profile[]>> {
  if (shouldUseFallback()) return { data: [], source: "fallback" };

  try {
    const { data, error } = await supabase!.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return { data: (data as ProfilesRow[]).map(mapProfileRow), source: "supabase" };
  } catch (error) {
    return { data: [], source: "fallback", error: normalizeError(error) };
  }
}
