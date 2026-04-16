/**
 * WHY: Use indexed full-text search and centralized query shaping so job reads scale better without changing UI contracts.
 * CHANGED: YYYY-MM-DD
 */
import { getSampleJobById, getSampleJobs, getSampleMyJobs } from "../data/mockData";
import { supabase } from "../lib/supabase";
import { jobCreateSchema, jobSearchParamsSchema, parseWithValidation } from "../lib/validation/schemas";
import { Job } from "../types/domain";
import { JobsRow, mapJobRow } from "../types/supabase";
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
  onlyUrgent?: boolean;
  sortBy?: "distance" | "newest";
}

export interface CreateJobInput {
  postedByUserId: string;
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

const mapJobs = (rows: unknown): Job[] =>
  toSafeArray<Partial<JobsRow>>(rows)
    .map(mapJobRow)
    .filter((job) => isNonEmptyString(job.id));

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
    if (validatedParams.onlyUrgent) {
      query = query.eq("urgency", "urgente");
    }
    if (validatedParams.query?.trim()) {
      const sanitized = validatedParams.query.trim().replace(/[&|!():<>]/g, " ");
      query = query.textSearch("search_document", sanitized, {
        config: "simple",
        type: "websearch",
      });
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
    return failureResult(null, "No pudimos encontrar ese trabajo.");
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

    const { data, error } = await supabase!
      .from("jobs")
      .insert({
        posted_by_user_id: validatedInput.postedByUserId,
        title: validatedInput.title,
        description: validatedInput.description,
        category: validatedInput.category,
        location: validatedInput.location,
        price_value: Math.round(validatedInput.priceValue),
        availability: validatedInput.availability,
        urgency: validatedInput.urgency,
        image: validatedInput.image?.trim() || DEFAULT_JOB_IMAGE,
        status: "publicado",
      })
      .select("*")
      .single<JobsRow>();

    if (error) throw error;

    const createdJob = mapJobRow(data);
    return successResult(createdJob.id ? createdJob : null);
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos publicar tu changa."));
  }
}

export async function updateJob(input: UpdateJobInput): Promise<ServiceResult<Job | null>> {
  try {
    const validatedInput = parseWithValidation(jobCreateSchema, {
      ...input,
      priceValue: Math.round(input.priceValue),
    });
    if (shouldUseFallback()) {
      return failureResult(null, getFallbackActionMessage("Editar una changa"));
    }

    const { data, error } = await supabase!
      .from("jobs")
      .update({
        title: validatedInput.title,
        description: validatedInput.description,
        category: validatedInput.category,
        location: validatedInput.location,
        price_value: Math.round(validatedInput.priceValue),
        availability: validatedInput.availability,
        urgency: validatedInput.urgency,
        image: validatedInput.image?.trim() || DEFAULT_JOB_IMAGE,
      })
      .eq("id", input.id)
      .eq("posted_by_user_id", input.postedByUserId)
      .select("*")
      .single<JobsRow>();

    if (error) throw error;

    const updatedJob = mapJobRow(data);
    return successResult(updatedJob.id ? updatedJob : null);
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos guardar los cambios de tu changa."));
  }
}

export async function deleteJob(jobId: string, postedByUserId: string): Promise<ServiceResult<boolean>> {
  if (!isNonEmptyString(jobId) || !isNonEmptyString(postedByUserId)) {
    return failureResult(false, "No pudimos identificar la changa que querés eliminar.");
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
    return failureResult([], normalizeError(error, "No pudimos cargar tus changas."));
  }
}
