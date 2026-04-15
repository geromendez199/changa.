import { supabase } from "../lib/supabase";
import { Job } from "../types/domain";
import { JobsRow, mapJobRow } from "../types/supabase";
import { normalizeError, ServiceResult, shouldUseFallback } from "./service.utils";

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

export async function getFeaturedJobs(): Promise<ServiceResult<Job[]>> {
  return searchJobs({ sortBy: "distance" });
}

export async function searchJobs(params: SearchJobsParams): Promise<ServiceResult<Job[]>> {
  if (shouldUseFallback()) return { data: [], source: "fallback", error: "Configurá Supabase para ver changas reales." };

  try {
    let query = supabase!.from("jobs").select("*").eq("status", "publicado");

    if (params.category && params.category !== "Todos") query = query.eq("category", params.category);
    if (params.onlyUrgent) query = query.eq("urgency", "urgente");
    if (params.query?.trim()) query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%`);

    query = params.sortBy === "newest" ? query.order("posted_at", { ascending: false }) : query.order("distance_km", { ascending: true });

    const { data, error } = await query.limit(30);
    if (error) throw error;

    return { data: (data as JobsRow[]).map(mapJobRow), source: "supabase" };
  } catch (error) {
    return { data: [], source: "fallback", error: normalizeError(error) };
  }
}

export async function getJobById(id: string): Promise<ServiceResult<Job | null>> {
  if (shouldUseFallback()) return { data: null, source: "fallback", error: "Configurá Supabase para ver changas reales." };

  try {
    const { data, error } = await supabase!.from("jobs").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return { data: data ? mapJobRow(data as JobsRow) : null, source: "supabase" };
  } catch (error) {
    return { data: null, source: "fallback", error: normalizeError(error) };
  }
}

export async function createJob(input: CreateJobInput): Promise<ServiceResult<Job | null>> {
  if (shouldUseFallback()) return { data: null, source: "fallback", error: "Configurá Supabase para publicar changas reales." };

  try {
    const { data, error } = await supabase!
      .from("jobs")
      .insert({
        posted_by_user_id: input.postedByUserId,
        title: input.title,
        description: input.description,
        category: input.category,
        location: input.location,
        price_value: input.priceValue,
        availability: input.availability,
        urgency: input.urgency,
        image:
          input.image?.trim() ||
          "https://images.unsplash.com/photo-1556911220-bff31c812dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        status: "publicado",
      })
      .select("*")
      .single();

    if (error) throw error;
    return { data: mapJobRow(data as JobsRow), source: "supabase" };
  } catch (error) {
    return { data: null, source: "fallback", error: normalizeError(error) };
  }
}

export async function getMyJobs(userId: string): Promise<ServiceResult<Job[]>> {
  if (shouldUseFallback()) return { data: [], source: "fallback" };

  try {
    const { data, error } = await supabase!
      .from("jobs")
      .select("*")
      .eq("posted_by_user_id", userId)
      .order("posted_at", { ascending: false });
    if (error) throw error;
    return { data: (data as JobsRow[]).map(mapJobRow), source: "supabase" };
  } catch (error) {
    return { data: [], source: "fallback", error: normalizeError(error) };
  }
}
