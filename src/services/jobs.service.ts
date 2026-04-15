import { jobs as mockJobs } from "../data/mockData";
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

function applySearchFilters(rows: Job[], params: SearchJobsParams): Job[] {
  const normalizedQuery = (params.query ?? "").trim().toLowerCase();

  return rows
    .filter((job) => {
      const matchesQuery =
        !normalizedQuery ||
        job.title.toLowerCase().includes(normalizedQuery) ||
        job.description.toLowerCase().includes(normalizedQuery) ||
        job.category.toLowerCase().includes(normalizedQuery);
      const matchesCategory = !params.category || params.category === "Todos" || job.category === params.category;
      const matchesUrgency = !params.onlyUrgent || job.urgency === "urgente";

      return matchesQuery && matchesCategory && matchesUrgency;
    })
    .sort((a, b) => {
      if (params.sortBy === "newest") {
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      }
      return a.distanceKm - b.distanceKm;
    });
}

export async function getFeaturedJobs(): Promise<ServiceResult<Job[]>> {
  return searchJobs({ sortBy: "distance" });
}

export async function searchJobs(params: SearchJobsParams): Promise<ServiceResult<Job[]>> {
  if (shouldUseFallback()) {
    return { data: applySearchFilters(mockJobs, params), source: "fallback" };
  }

  try {
    let query = supabase!.from("jobs").select("*").eq("status", "publicado");

    if (params.category && params.category !== "Todos") {
      query = query.eq("category", params.category);
    }

    if (params.onlyUrgent) {
      query = query.eq("urgency", "urgente");
    }

    if (params.query?.trim()) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%`);
    }

    query = params.sortBy === "newest" ? query.order("posted_at", { ascending: false }) : query.order("distance_km", { ascending: true });

    const { data, error } = await query.limit(30);
    if (error) throw error;

    const mapped = (data as JobsRow[]).map(mapJobRow);
    if (mapped.length === 0) {
      return { data: applySearchFilters(mockJobs, params), source: "fallback", error: "Sin datos en Supabase" };
    }

    return { data: mapped, source: "supabase" };
  } catch (error) {
    return { data: applySearchFilters(mockJobs, params), source: "fallback", error: normalizeError(error) };
  }
}

export async function getJobById(id: string): Promise<ServiceResult<Job | null>> {
  if (shouldUseFallback()) {
    return { data: mockJobs.find((job) => job.id === id) ?? null, source: "fallback" };
  }

  try {
    const { data, error } = await supabase!.from("jobs").select("*").eq("id", id).maybeSingle();
    if (error) throw error;

    if (!data) {
      const fallback = mockJobs.find((job) => job.id === id) ?? null;
      return { data: fallback, source: fallback ? "fallback" : "supabase" };
    }

    return { data: mapJobRow(data as JobsRow), source: "supabase" };
  } catch (error) {
    const fallback = mockJobs.find((job) => job.id === id) ?? null;
    return { data: fallback, source: "fallback", error: normalizeError(error) };
  }
}
