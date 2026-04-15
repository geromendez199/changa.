import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Profile, Review } from "../types/domain";
import { ProfilesRow, ReviewsRow, mapProfileRow, mapReviewRow } from "../types/supabase";
import { failureResult, isNonEmptyString, normalizeError, ServiceResult, shouldUseFallback, successResult, toSafeArray } from "./service.utils";

export interface ProfileBundle {
  profile: Profile;
  reviews: Review[];
}

export interface SaveProfileInput {
  fullName: string;
  location: string;
  bio?: string | null;
}

const defaultTrust = ["Email validado"];

const mapReviews = (rows: unknown): Review[] =>
  toSafeArray<Partial<ReviewsRow>>(rows)
    .map(mapReviewRow)
    .filter((review) => isNonEmptyString(review.id));

const buildDefaultProfilePayload = (userId: string, fullName: string, location: string, bio?: string | null) => ({
  id: userId,
  full_name: fullName,
  avatar_letter: fullName.trim().charAt(0).toUpperCase() || "U",
  location,
  member_since: new Date().toLocaleString("es-AR", { month: "long", year: "numeric" }),
  trust_indicators: defaultTrust,
  success_rate: 0,
  bio: isNonEmptyString(bio) ? bio.trim() : null,
});

export async function ensureProfileForUser(user: User): Promise<ServiceResult<Profile | null>> {
  if (!user?.id) return failureResult(null, "No pudimos validar tu perfil.");
  if (shouldUseFallback()) return successResult(null, "fallback");

  const defaultName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";

  try {
    const { data: existingProfile, error: existingError } = await supabase!
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<ProfilesRow>();

    if (existingError) throw existingError;

    if (existingProfile) {
      return successResult(mapProfileRow(existingProfile));
    }

    const payload = buildDefaultProfilePayload(user.id, defaultName, "Ubicación pendiente");

    const { data, error } = await supabase!
      .from("profiles")
      .insert(payload)
      .select("*")
      .single<ProfilesRow>();

    if (error) throw error;

    const mappedProfile = mapProfileRow(data);
    return successResult(mappedProfile.id ? mappedProfile : null);
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos preparar tu perfil."));
  }
}

export async function saveProfile(userId: string, input: SaveProfileInput): Promise<ServiceResult<Profile | null>> {
  if (!isNonEmptyString(userId)) return failureResult(null, "No pudimos guardar tu perfil.");
  if (!isNonEmptyString(input.fullName)) return failureResult(null, "Ingresá un nombre válido.");
  if (!isNonEmptyString(input.location)) return failureResult(null, "Ingresá una ubicación válida.");
  if (shouldUseFallback()) return successResult(null, "fallback");

  const trimmedName = input.fullName.trim();
  const trimmedLocation = input.location.trim();
  const trimmedBio = isNonEmptyString(input.bio) ? input.bio.trim() : null;

  try {
    const { data: existingProfile, error: existingError } = await supabase!
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle<ProfilesRow>();

    if (existingError) throw existingError;

    if (!existingProfile) {
      const payload = buildDefaultProfilePayload(userId, trimmedName, trimmedLocation, trimmedBio);
      const { data: insertedProfile, error: insertError } = await supabase!
        .from("profiles")
        .insert(payload)
        .select("*")
        .single<ProfilesRow>();

      if (insertError) throw insertError;
      return successResult(mapProfileRow(insertedProfile));
    }

    const { data, error } = await supabase!
      .from("profiles")
      .update({
        full_name: trimmedName,
        avatar_letter: trimmedName.charAt(0).toUpperCase() || "U",
        location: trimmedLocation,
        bio: trimmedBio,
      })
      .eq("id", userId)
      .select("*")
      .single<ProfilesRow>();

    if (error) throw error;

    return successResult(mapProfileRow(data));
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos guardar tus datos."));
  }
}

export async function updateProfileLocation(userId: string, location: string): Promise<ServiceResult<Profile | null>> {
  if (!isNonEmptyString(userId)) return failureResult(null, "No pudimos actualizar tu ubicación.");
  if (!isNonEmptyString(location)) return failureResult(null, "Ingresá una ubicación válida.");
  if (shouldUseFallback()) return successResult(null, "fallback");

  try {
    const { data, error } = await supabase!
      .from("profiles")
      .update({ location: location.trim() })
      .eq("id", userId)
      .select("*")
      .maybeSingle<ProfilesRow>();

    if (error) throw error;
    if (!data) return successResult(null);

    return successResult(mapProfileRow(data));
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos guardar tu ubicación."));
  }
}

export async function getProfileBundle(userId: string): Promise<ServiceResult<ProfileBundle | null>> {
  if (!isNonEmptyString(userId)) return successResult(null, "fallback");
  if (shouldUseFallback()) return successResult(null, "fallback");

  try {
    const [{ data: profileRow, error: profileError }, { data: reviewsRows, error: reviewsError }] = await Promise.all([
      supabase!.from("profiles").select("*").eq("id", userId).maybeSingle<ProfilesRow>(),
      supabase!.from("reviews").select("*").eq("reviewed_user_id", userId).order("created_at", { ascending: false }).limit(5),
    ]);

    if (profileError) throw profileError;
    if (reviewsError) throw reviewsError;
    if (!profileRow) return successResult(null);

    const profile = mapProfileRow(profileRow);
    if (!profile.id) return successResult(null);

    return successResult({
      profile,
      reviews: mapReviews(reviewsRows),
    });
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos cargar tu perfil."));
  }
}

export async function getPublicProfiles(): Promise<ServiceResult<Profile[]>> {
  if (shouldUseFallback()) return successResult([], "fallback");

  try {
    const { data, error } = await supabase!.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw error;

    const profiles = toSafeArray<Partial<ProfilesRow>>(data)
      .map(mapProfileRow)
      .filter((profile) => isNonEmptyString(profile.id));

    return successResult(profiles);
  } catch (error) {
    return failureResult([], normalizeError(error, "No pudimos cargar perfiles."));
  }
}
