/**
 * WHY: Isolate jobs and applications state from the global app-state composition layer.
 * CHANGED: YYYY-MM-DD
 */
import { useCallback, useState } from "react";
import { getMyApplications, withdrawApplication } from "../services/applications.service";
import {
  createJob,
  deleteJob,
  getFeaturedJobs,
  getJobById,
  getMyJobs,
  searchJobs,
  SearchJobsParams,
  updateJob,
} from "../services/jobs.service";
import { shouldUseFallback, successResult } from "../services/service.utils";
import { Application, Job } from "../types/domain";

export interface NewJobInput {
  title: string;
  description: string;
  category: Job["category"];
  location: string;
  priceValue: number;
  availability: string;
  urgency: Job["urgency"];
  image?: string;
}

interface UseJobsStateOptions {
  userId: string | null;
  pushError: (message?: string) => void;
}

export function useJobsState({ userId, pushError }: UseJobsStateOptions) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  const refreshJobs = useCallback(
    async (params: SearchJobsParams = {}) => {
      const result =
        Object.keys(params).length > 0 ? await searchJobs(params) : await getFeaturedJobs();
      setJobs(result.data);
      pushError(result.error);
      return result;
    },
    [pushError],
  );

  const loadJobById = useCallback(
    async (id: string) => {
      const result = await getJobById(id);
      pushError(result.error);
      return result.data;
    },
    [pushError],
  );

  const loadAuthenticatedJobData = useCallback(async () => {
    if (!userId) {
      setMyJobs([]);
      setApplications([]);
      return {
        myJobsResult: successResult<Job[]>([], "fallback"),
        applicationsResult: successResult<Application[]>([], "fallback"),
      };
    }

    const [myJobsResult, applicationsResult] = await Promise.all([
      getMyJobs(userId),
      getMyApplications(userId),
    ]);

    setMyJobs(myJobsResult.data);
    setApplications(applicationsResult.data);
    pushError(myJobsResult.error ?? applicationsResult.error);

    return { myJobsResult, applicationsResult };
  }, [pushError, userId]);

  const addPublishedJob = useCallback(
    async (input: NewJobInput) => {
      if (!userId) {
        const message = "Necesitás iniciar sesión para publicar.";
        pushError(message);
        return null;
      }

      const createdResult = await createJob({ ...input, postedByUserId: userId });
      if (!createdResult.data) {
        pushError(createdResult.error ?? "No pudimos publicar tu changa.");
        return null;
      }

      setJobs((prev) => [
        createdResult.data!,
        ...prev.filter((job) => job.id !== createdResult.data!.id),
      ]);
      setMyJobs((prev) => [
        createdResult.data!,
        ...prev.filter((job) => job.id !== createdResult.data!.id),
      ]);

      return createdResult.data;
    },
    [pushError, userId],
  );

  const updatePublishedJob = useCallback(
    async (jobId: string, input: NewJobInput) => {
      if (!userId) {
        const message = "Necesitás iniciar sesión para editar.";
        pushError(message);
        return { ok: false, message, job: null as Job | null };
      }

      const existingJob = myJobs.find((job) => job.id === jobId);
      if (!existingJob) {
        const message = "No encontramos esa changa para editar.";
        pushError(message);
        return { ok: false, message, job: null as Job | null };
      }

      if (shouldUseFallback()) {
        const updatedJob: Job = {
          ...existingJob,
          ...input,
          priceValue: Math.round(input.priceValue),
          priceLabel: `$${Math.round(input.priceValue).toLocaleString("es-AR")}`,
          image: input.image?.trim() || existingJob.image,
        };

        setJobs((prev) => prev.map((job) => (job.id === jobId ? updatedJob : job)));
        setMyJobs((prev) => prev.map((job) => (job.id === jobId ? updatedJob : job)));
        return { ok: true, message: "Cambios guardados en esta vista previa.", job: updatedJob };
      }

      const result = await updateJob({ id: jobId, postedByUserId: userId, ...input });
      if (!result.data) {
        const message = result.error ?? "No pudimos guardar los cambios.";
        pushError(message);
        return { ok: false, message, job: null as Job | null };
      }

      setJobs((prev) => prev.map((job) => (job.id === jobId ? result.data! : job)));
      setMyJobs((prev) => prev.map((job) => (job.id === jobId ? result.data! : job)));
      return { ok: true, message: "Changa actualizada.", job: result.data };
    },
    [myJobs, pushError, userId],
  );

  const removePublishedJob = useCallback(
    async (jobId: string) => {
      if (!userId) {
        const message = "Necesitás iniciar sesión para eliminar.";
        pushError(message);
        return { ok: false, message };
      }

      const result = shouldUseFallback()
        ? successResult(true, "fallback")
        : await deleteJob(jobId, userId);

      if (!result.data) {
        const message = result.error ?? "No pudimos eliminar la changa.";
        pushError(message);
        return { ok: false, message };
      }

      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      setMyJobs((prev) => prev.filter((job) => job.id !== jobId));
      setApplications((prev) => prev.filter((application) => application.jobId !== jobId));
      return {
        ok: true,
        message:
          result.source === "fallback"
            ? "La changa se ocultó en esta vista previa."
            : "La changa se eliminó correctamente.",
      };
    },
    [pushError, userId],
  );

  const withdrawMyApplication = useCallback(
    async (applicationId: string) => {
      if (!userId) {
        const message = "Necesitás iniciar sesión para retirarte.";
        pushError(message);
        return { ok: false, message };
      }

      const result = shouldUseFallback()
        ? successResult(true, "fallback")
        : await withdrawApplication(applicationId, userId);

      if (!result.data) {
        const message = result.error ?? "No pudimos retirarte de la postulación.";
        pushError(message);
        return { ok: false, message };
      }

      setApplications((prev) => prev.filter((application) => application.id !== applicationId));
      return {
        ok: true,
        message:
          result.source === "fallback"
            ? "Te retiraste en esta vista previa."
            : "Te retiraste de la postulación.",
      };
    },
    [pushError, userId],
  );

  const resetUserJobState = useCallback(() => {
    setMyJobs([]);
    setApplications([]);
  }, []);

  return {
    jobs,
    myJobs,
    applications,
    refreshJobs,
    loadJobById,
    loadAuthenticatedJobData,
    addPublishedJob,
    updatePublishedJob,
    removePublishedJob,
    withdrawMyApplication,
    resetUserJobState,
  };
}
