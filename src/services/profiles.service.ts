/**
 * WHY: Validate profile mutations consistently before persisting them through Supabase.
 * CHANGED: YYYY-MM-DD
 */
import type { User } from "@supabase/supabase-js";
import { getSampleProfileBundle, getSampleProfiles } from "../data/mockData";
import { parseWithValidation, profileUpdateSchema } from "../lib/validation/schemas";
import { supabase } from "../lib/supabase";
import { Profile, Review } from "../types/domain";
import { ProfilesRow, ReviewsRow, mapProfileRow, mapReviewRow } from "../types/supabase";
import {
  failureResult,
  getFallbackActionMessage,
  isNonEmptyString,
  normalizeError,
  ServiceResult,
  shouldUseFallback,
  successResult,
  toSafeArray,
} from "./service.utils";

export interface ProfileBundle {
  profile: Profile;
  reviews: Review[];
}

export interface SaveProfileInput {
  fullName: string;
  location: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

const defaultTrust: string[] = [];
const PROFILE_AVATAR_BUCKET = "profile-avatars";

const getProfileAvatarPath = (userId: string) => `${userId}/avatar.jpg`;
const getVersionedAvatarUrl = (publicUrl: string) => `${publicUrl}?updated=${Date.now()}`;

const mapReviews = (rows: unknown): Review[] =>
  toSafeArray<Partial<ReviewsRow>>(rows)
    .map(mapReviewRow)
    .filter((review) => isNonEmptyString(review.id));

const buildReviewSummary = (reviews: Review[]) => {
  const totalReviews = reviews.length;
  if (totalReviews === 0) {
    return { rating: 0, totalReviews: 0 };
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + Math.max(0, Math.min(5, review.rating)), 0) / totalReviews;

  return {
    rating: Number(averageRating.toFixed(1)),
    totalReviews,
  };
};

const buildDefaultProfilePayload = (
  userId: string,
  fullName: string,
  location: string,
  bio?: string | null,
  avatarUrl?: string | null,
) => ({
  id: userId,
  full_name: fullName,
  avatar_letter: fullName.trim().charAt(0).toUpperCase() || "U",
  avatar_url: isNonEmptyString(avatarUrl) ? avatarUrl.trim() : null,
  location,
  member_since: new Date().toLocaleString("es-AR", { month: "long", year: "numeric" }),
  trust_indicators: defaultTrust,
  success_rate: 0,
  bio: isNonEmptyString(bio) ? bio.trim() : null,
});

export async function ensureProfileForUser(user: User): Promise<ServiceResult<Profile | null>> {
  if (!user?.id) return failureResult(null, "No pudimos validar tu perfil.");
  if (shouldUseFallback()) return successResult(null, "fallback");

  const defaultName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Usuario";
  const defaultAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

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

    const payload = buildDefaultProfilePayload(
      user.id,
      defaultName,
      "Ubicación pendiente",
      null,
      defaultAvatarUrl,
    );

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
  try {
    if (!isNonEmptyString(userId)) return failureResult(null, "No pudimos guardar tu perfil.");

    const validatedInput = parseWithValidation(profileUpdateSchema, {
      fullName: input.fullName,
      location: input.location,
      bio: input.bio,
      avatarUrl: input.avatarUrl,
    });
    if (shouldUseFallback()) {
      return failureResult(null, getFallbackActionMessage("Guardar tu perfil"));
    }

    const trimmedName = validatedInput.fullName.trim();
    const trimmedLocation = validatedInput.location.trim();
    const trimmedBio = isNonEmptyString(validatedInput.bio) ? validatedInput.bio.trim() : null;
    const normalizedAvatarUrl =
      typeof validatedInput.avatarUrl === "undefined"
        ? undefined
        : isNonEmptyString(validatedInput.avatarUrl)
          ? validatedInput.avatarUrl.trim()
          : null;

    const { data: existingProfile, error: existingError } = await supabase!
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle<ProfilesRow>();

    if (existingError) throw existingError;

    if (!existingProfile) {
      const payload = buildDefaultProfilePayload(
        userId,
        trimmedName,
        trimmedLocation,
        trimmedBio,
        normalizedAvatarUrl,
      );
      const { data: insertedProfile, error: insertError } = await supabase!
        .from("profiles")
        .insert(payload)
        .select("*")
        .single<ProfilesRow>();

      if (insertError) throw insertError;
      return successResult(mapProfileRow(insertedProfile));
    }

    const profileUpdatePayload = {
      full_name: trimmedName,
      avatar_letter: trimmedName.charAt(0).toUpperCase() || "U",
      location: trimmedLocation,
      bio: trimmedBio,
      ...(typeof normalizedAvatarUrl !== "undefined" ? { avatar_url: normalizedAvatarUrl } : {}),
    };

    const { data, error } = await supabase!
      .from("profiles")
      .update(profileUpdatePayload)
      .eq("id", userId)
      .select("*")
      .single<ProfilesRow>();

    if (error) throw error;

    return successResult(mapProfileRow(data));
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos guardar tus datos."));
  }
}

export async function uploadProfileAvatar(userId: string, file: File): Promise<ServiceResult<string | null>> {
  try {
    if (!isNonEmptyString(userId)) return failureResult(null, "No pudimos identificar tu perfil.");
    if (!(file instanceof File)) return failureResult(null, "Elegí una imagen válida para tu perfil.");
    if (shouldUseFallback()) {
      return failureResult(null, getFallbackActionMessage("Subir tu foto de perfil"));
    }

    const avatarPath = getProfileAvatarPath(userId);
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase!.storage
      .from(PROFILE_AVATAR_BUCKET)
      .upload(avatarPath, fileBuffer, {
        upsert: true,
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
      });

    if (uploadError) throw uploadError;

    const { data } = supabase!.storage.from(PROFILE_AVATAR_BUCKET).getPublicUrl(avatarPath);
    if (!isNonEmptyString(data.publicUrl)) {
      return failureResult(null, "No pudimos obtener la foto subida.");
    }

    return successResult(getVersionedAvatarUrl(data.publicUrl));
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos subir tu foto de perfil."));
  }
}

export async function removeProfileAvatar(userId: string): Promise<ServiceResult<null>> {
  try {
    if (!isNonEmptyString(userId)) return failureResult(null, "No pudimos identificar tu perfil.");
    if (shouldUseFallback()) {
      return failureResult(null, getFallbackActionMessage("Eliminar tu foto de perfil"));
    }

    const avatarPath = getProfileAvatarPath(userId);
    const { error } = await supabase!.storage.from(PROFILE_AVATAR_BUCKET).remove([avatarPath]);
    if (error && !error.message.toLowerCase().includes("not found")) throw error;

    return successResult(null);
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos eliminar tu foto de perfil."));
  }
}

export async function updateProfileLocation(userId: string, location: string): Promise<ServiceResult<Profile | null>> {
  try {
    if (!isNonEmptyString(userId)) return failureResult(null, "No pudimos actualizar tu ubicación.");

    const validatedInput = parseWithValidation(profileUpdateSchema.pick({ location: true }), {
      location,
    });
    if (shouldUseFallback()) {
      return failureResult(null, getFallbackActionMessage("Guardar tu ubicación"));
    }

    const { data, error } = await supabase!
      .from("profiles")
      .update({ location: validatedInput.location.trim() })
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
  if (shouldUseFallback()) {
    // Reuse realistic sample trust data so preview job details do not collapse into blank posters.
    return successResult(getSampleProfileBundle(userId), "fallback");
  }

  try {
    const [{ data: profileRow, error: profileError }, { data: reviewsRows, error: reviewsError }] = await Promise.all([
      supabase!.from("profiles").select("*").eq("id", userId).maybeSingle<ProfilesRow>(),
      supabase!.from("reviews").select("*").eq("reviewed_user_id", userId).order("created_at", { ascending: false }),
    ]);

    if (profileError) throw profileError;
    if (reviewsError) throw reviewsError;
    if (!profileRow) return successResult(null);

    const reviews = mapReviews(reviewsRows);
    const reviewSummary = buildReviewSummary(reviews);
    const profile = mapProfileRow({
      ...profileRow,
      rating: reviewSummary.rating,
      total_reviews: reviewSummary.totalReviews,
    });
    if (!profile.id) return successResult(null);

    return successResult({
      profile,
      reviews,
    });
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos cargar tu perfil."));
  }
}

export async function getPublicProfiles(): Promise<ServiceResult<Profile[]>> {
  if (shouldUseFallback()) {
    // Public profile metadata powers trust cues across the preview experience.
    return successResult(getSampleProfiles(), "fallback");
  }

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
