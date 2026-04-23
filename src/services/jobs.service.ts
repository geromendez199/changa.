/**
 * WHY: Use indexed full-text search and centralized query shaping so job reads scale better without changing UI contracts.
 * CHANGED: YYYY-MM-DD
 */
import { getSampleJobById, getSampleJobs, getSampleMyJobs } from "../data/mockData";
import { supabase } from "../lib/supabase";
import { jobCreateSchema, jobSearchParamsSchema, parseWithValidation } from "../lib/validation/schemas";
import { Job } from "../types/domain";
import { JobsRow, mapJobRow } from "../types/supabase";
import { ensureProfileForUser } from "./profiles.service";
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

export interface SearchJobsParams {
  query?: string;
  category?: string;
  listingType?: Job["listingType"];
  onlyUrgent?: boolean;
  sortBy?: "distance" | "newest";
}

export interface CreateJobInput {
  postedByUserId: string;
  listingType: Job["listingType"];
  title: string;
  description: string;
  category: Job["category"];
  location: string;
  priceValue: number;
  availability: string;
  urgency: Job["urgency"];
  image?: string;
}

export interface UpdateJobInput extends CreateJobInput {
  id: string;
}

const DEFAULT_JOB_IMAGE =
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const mapJobs = (rows: unknown): Job[] =>
  toSafeArray<Partial<JobsRow>>(rows)
    .map(mapJobRow)
    .filter((job) => isNonEmptyString(job.id));

function isValidUuid(value: string) {
  return UUID_PATTERN.test(value.trim());
}

function toIlikePattern(value: string) {
  const safeTerm = value.trim().replace(/[%,()]/g, " ").replace(/\s+/g, " ");
  return `%${safeTerm}%`;
}

async function ensureAuthorProfileReady(postedByUserId: string) {
  if (!isNonEmptyString(postedByUserId) || shouldUseFallback()) return;

  const {
    data: { user },
  } = await supabase!.auth.getUser();

  if (!user || user.id !== postedByUserId) return;

  const profileResult = await ensureProfileForUser(user);
  if (profileResult.error) {
    throw new Error(profileResult.error);
  }
}

function isMissingAuthorProfileError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("violates foreign key constraint") &&
    normalizedMessage.includes("posted_by_user_id")
  );
}

export async function getFeaturedJobs(): Promise<ServiceResult<Job[]>> {
  return searchJobs({ sortBy: "distance" });
}

export async function searchJobs(params: SearchJobsParams): Promise<ServiceResult<Job[]>> {
  try {
    const validatedParams = parseWithValidation(jobSearchParamsSchema, params);
    if (shouldUseFallback()) {
      // Keep public browsing useful in local preview without pretending writes or auth are live.
      return successResult(getSampleJobs(validatedParams), "fallback");
    }

    let query = supabase!.from("jobs").select("*").eq("status", "publicado");

    if (validatedParams.category && validatedParams.category !== "Todos") {
      query = query.eq("category", validatedParams.category);
    }
    if (validatedParams.listingType) {
      query = query.eq("listing_type", validatedParams.listingType);
    }
    if (validatedParams.onlyUrgent) {
      query = query.eq("urgency", "urgente");
    }
    if (validatedParams.query?.trim()) {
      const pattern = toIlikePattern(validatedParams.query);
      query = query.or(
        [
          `title.ilike.${pattern}`,
          `description.ilike.${pattern}`,
          `category.ilike.${pattern}`,
          `location.ilike.${pattern}`,
        ].join(","),
      );
    }

    query =
      validatedParams.sortBy === "newest"
        ? query.order("posted_at", { ascending: false })
        : query.order("distance_km", { ascending: true }).order("posted_at", { ascending: false });

    const { data, error } = await query.limit(30);
    if (error) throw error;

    return successResult(mapJobs(data));
  } catch (error) {
    return failureResult([], normalizeError(error, "No pudimos cargar changas por ahora."));
  }
}

export async function getJobById(id: string): Promise<ServiceResult<Job | null>> {
  if (!isNonEmptyString(id)) {
    return successResult(null);
  }

  if (!isValidUuid(id)) {
    return successResult(null);
  }

  if (shouldUseFallback()) {
    // Preview mode still needs believable detail pages for demos and UI work.
    return successResult(getSampleJobById(id), "fallback");
  }

  try {
    const { data, error } = await supabase!.from("jobs").select("*").eq("id", id).maybeSingle<JobsRow>();
    if (error) throw error;
    if (!data) return successResult(null);

    const mappedJob = mapJobRow(data);
    if (!mappedJob.id) return successResult(null);

    return successResult(mappedJob);
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos cargar ese trabajo."));
  }
}

export async function createJob(input: CreateJobInput): Promise<ServiceResult<Job | null>> {
  try {
    const validatedInput = parseWithValidation(jobCreateSchema, {
      ...input,
      priceValue: Math.round(input.priceValue),
    });
    if (shouldUseFallback()) {
      return failureResult(null, getFallbackActionMessage("Publicar una changa"));
    }

    await ensureAuthorProfileReady(validatedInput.postedByUserId);

    const insertPayload = {
      posted_by_user_id: validatedInput.postedByUserId,
      listing_type: validatedInput.listingType,
      title: validatedInput.title,
      description: validatedInput.description,
      category: validatedInput.category,
      location: validatedInput.location,
      price_value: Math.round(validatedInput.priceValue),
      availability: validatedInput.availability,
      urgency: validatedInput.urgency,
      image: validatedInput.image?.trim() || DEFAULT_JOB_IMAGE,
      status: "publicado" as const,
    };

    let data: JobsRow | null = null;
    let error: unknown = null;

    const initialInsertResult = await supabase!.from("jobs").insert(insertPayload).select("*").single<JobsRow>();
    data = initialInsertResult.data;
    error = initialInsertResult.error;

    if (error && isMissingAuthorProfileError(error)) {
      await ensureAuthorProfileReady(validatedInput.postedByUserId);
      const retryInsertResult = await supabase!.from("jobs").insert(insertPayload).select("*").single<JobsRow>();
      data = retryInsertResult.data;
      error = retryInsertResult.error;
    }

    if (error) throw error;
    if (!data) {
      return successResult(null);
    }

    const createdJob = mapJobRow(data);
    return successResult(createdJob.id ? createdJob : null);
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos publicar tu aviso."));
  }
}

export async function updateJob(input: UpdateJobInput): Promise<ServiceResult<Job | null>> {
  if (!isNonEmptyString(input.id) || !isValidUuid(input.id)) {
    return failureResult(null, "No encontramos esa publicación para editar.");
  }

  try {
    const validatedInput = parseWithValidation(jobCreateSchema, {
      ...input,
      priceValue: Math.round(input.priceValue),
    });
    if (shouldUseFallback()) {
      return failureResult(null, getFallbackActionMessage("Editar una changa"));
    }

    await ensureAuthorProfileReady(validatedInput.postedByUserId);

    const updatePayload = {
      title: validatedInput.title,
      description: validatedInput.description,
      listing_type: validatedInput.listingType,
      category: validatedInput.category,
      location: validatedInput.location,
      price_value: Math.round(validatedInput.priceValue),
      availability: validatedInput.availability,
      urgency: validatedInput.urgency,
      image: validatedInput.image?.trim() || DEFAULT_JOB_IMAGE,
    };

    let data: JobsRow | null = null;
    let error: unknown = null;

    const initialUpdateResult = await supabase!
      .from("jobs")
      .update(updatePayload)
      .eq("id", input.id)
      .eq("posted_by_user_id", input.postedByUserId)
      .select("*")
      .single<JobsRow>();

    data = initialUpdateResult.data;
    error = initialUpdateResult.error;

    if (error && isMissingAuthorProfileError(error)) {
      await ensureAuthorProfileReady(validatedInput.postedByUserId);
      const retryUpdateResult = await supabase!
        .from("jobs")
        .update(updatePayload)
        .eq("id", input.id)
        .eq("posted_by_user_id", input.postedByUserId)
        .select("*")
        .single<JobsRow>();

      data = retryUpdateResult.data;
      error = retryUpdateResult.error;
    }

    if (error) throw error;
    if (!data) {
      return successResult(null);
    }

    const updatedJob = mapJobRow(data);
    return successResult(updatedJob.id ? updatedJob : null);
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos guardar los cambios de tu aviso."));
  }
}

export async function deleteJob(jobId: string, postedByUserId: string): Promise<ServiceResult<boolean>> {
  if (!isNonEmptyString(jobId) || !isNonEmptyString(postedByUserId)) {
    return failureResult(false, "No pudimos identificar la changa que querés eliminar.");
  }

  if (!isValidUuid(jobId)) {
    return failureResult(false, "No encontramos esa publicación para eliminar.");
  }

  try {
    if (shouldUseFallback()) {
      return successResult(true, "fallback");
    }

    const { error } = await supabase!
      .from("jobs")
      .delete()
      .eq("id", jobId)
      .eq("posted_by_user_id", postedByUserId);

    if (error) throw error;

    return successResult(true);
  } catch (error) {
    return failureResult(false, normalizeError(error, "No pudimos eliminar tu changa."));
  }
}

export async function getMyJobs(userId: string): Promise<ServiceResult<Job[]>> {
  if (!isNonEmptyString(userId)) return successResult([], "fallback");
  if (shouldUseFallback()) {
    return successResult(getSampleMyJobs(userId), "fallback");
  }

  try {
    const { data, error } = await supabase!
      .from("jobs")
      .select("*")
      .eq("posted_by_user_id", userId)
      .order("posted_at", { ascending: false });

    if (error) throw error;
    return successResult(mapJobs(data));
  } catch (error) {
    return failureResult([], normalizeError(error, "No pudimos cargar tus publicaciones."));
  }
}
