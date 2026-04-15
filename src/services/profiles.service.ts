import { reviews as mockReviews, users as mockUsers } from "../data/mockData";
import { supabase } from "../lib/supabase";
import { Profile, Review } from "../types/domain";
import { ProfilesRow, ReviewsRow, mapProfileRow, mapReviewRow } from "../types/supabase";
import { normalizeError, ServiceResult, shouldUseFallback } from "./service.utils";

export interface ProfileBundle {
  profile: Profile;
  reviews: Review[];
}

export async function getProfileBundle(userId: string): Promise<ServiceResult<ProfileBundle | null>> {
  if (shouldUseFallback()) {
    const profile = mockUsers.find((user) => user.id === userId) ?? null;
    if (!profile) return { data: null, source: "fallback" };
    return {
      data: {
        profile,
        reviews: mockReviews.filter((review) => review.reviewedUserId === userId),
      },
      source: "fallback",
    };
  }

  try {
    const [{ data: profileRow, error: profileError }, { data: reviewsRows, error: reviewsError }] = await Promise.all([
      supabase!.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase!.from("reviews").select("*").eq("reviewed_user_id", userId).order("created_at", { ascending: false }).limit(5),
    ]);

    if (profileError) throw profileError;
    if (reviewsError) throw reviewsError;

    if (!profileRow) {
      const profile = mockUsers.find((user) => user.id === userId) ?? null;
      if (!profile) return { data: null, source: "supabase" };
      return {
        data: {
          profile,
          reviews: mockReviews.filter((review) => review.reviewedUserId === userId),
        },
        source: "fallback",
      };
    }

    return {
      data: {
        profile: mapProfileRow(profileRow as ProfilesRow),
        reviews: (reviewsRows as ReviewsRow[]).map(mapReviewRow),
      },
      source: "supabase",
    };
  } catch (error) {
    const profile = mockUsers.find((user) => user.id === userId) ?? null;
    if (!profile) return { data: null, source: "fallback", error: normalizeError(error) };
    return {
      data: {
        profile,
        reviews: mockReviews.filter((review) => review.reviewedUserId === userId),
      },
      source: "fallback",
      error: normalizeError(error),
    };
  }
}

export async function getPublicProfiles(): Promise<ServiceResult<Profile[]>> {
  if (shouldUseFallback()) {
    return { data: mockUsers, source: "fallback" };
  }

  try {
    const { data, error } = await supabase!.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw error;

    const mapped = (data as ProfilesRow[]).map(mapProfileRow);
    return mapped.length ? { data: mapped, source: "supabase" } : { data: mockUsers, source: "fallback" };
  } catch (error) {
    return { data: mockUsers, source: "fallback", error: normalizeError(error) };
  }
}
