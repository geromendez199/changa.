/**
 * WHY: Make publish confirmation feel like a polished completion state instead of a generic success message.
 * CHANGED: YYYY-MM-DD
 */
import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/Button";
import { SkeletonBlock } from "../../components/SkeletonBlock";
import { SurfaceCard } from "../../components/SurfaceCard";
import { useAppState } from "../../hooks/useAppState";
import type { Job } from "../../../types/domain";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function PublishConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { jobs, currentUserId, loadJobById } = useAppState();
  const [resolvedJob, setResolvedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isValidId = Boolean(id && UUID_PATTERN.test(id));

  useEffect(() => {
    let cancelled = false;

    async function resolveJob() {
      if (!id || !isValidId) {
        setResolvedJob(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const stateJob = jobs.find((item) => item.id === id);
      const nextJob = stateJob ?? (await loadJobById(id));

      if (!cancelled) {
        setResolvedJob(nextJob);
        setIsLoading(false);
      }
    }

    void resolveJob();

    return () => {
      cancelled = true;
    };
  }, [id, isValidId, jobs, loadJobById]);

  const isOwnPublication = Boolean(
    resolvedJob && currentUserId && resolvedJob.postedByUserId === currentUserId,
  );
  const isWaitingForUserSync = Boolean(resolvedJob && !currentUserId);
  const itemLabel = resolvedJob?.listingType === "service" ? "servicio" : "publicación";

  if (isLoading || isWaitingForUserSync) {
    return (
      <div className="app-screen px-6 pt-20">
        <SurfaceCard padding="lg">
          <SkeletonBlock className="mx-auto mb-5 h-18 w-18 rounded-[24px]" />
          <SkeletonBlock className="mx-auto mb-3 h-7 w-56 rounded-full" />
          <SkeletonBlock className="mx-auto h-4 w-72 max-w-full rounded-full" />
        </SurfaceCard>
      </div>
    );
  }

  if (!resolvedJob || !isOwnPublication) {
    return (
      <div className="app-screen px-6 pt-20">
        <SurfaceCard className="text-center" padding="lg">
          <div className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-[24px] bg-amber-50 text-amber-600">
            <AlertCircle size={54} />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-[-0.02em] text-[var(--app-text)]">
            Publicación no encontrada
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-[var(--app-text-muted)]">
            No encontramos una publicación válida asociada a tu cuenta para confirmar.
          </p>
          <div className="space-y-3">
            <Button fullWidth onClick={() => navigate("/my-jobs")}>
              Ir a mis publicaciones
            </Button>
            <Button fullWidth variant="secondary" onClick={() => navigate("/publish")}>
              Crear una publicación
            </Button>
          </div>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className="app-screen px-6 pt-20">
      <SurfaceCard className="text-center" padding="lg">
        <div className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-[24px] bg-[var(--app-brand-soft)] text-[var(--app-brand)]">
          <CheckCircle size={56} />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-[-0.02em] text-[var(--app-text)]">
          ¡Publicación creada!
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-[var(--app-text-muted)]">
          Tu {itemLabel} "{resolvedJob.title}" ya está visible para personas de tu zona.
        </p>
        <div className="mb-6 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 text-sm leading-relaxed text-[var(--app-text-muted)]">
          {resolvedJob.listingType === "service"
            ? "Ahora otras personas pueden descubrir tu propuesta, pedirte presupuesto y empezar la conversación desde changa."
            : "Ahora quienes estén disponibles pueden verla, entender el contexto y responderte desde changa."}
        </div>
        <div className="space-y-3">
          <Button fullWidth onClick={() => navigate(`/job/${resolvedJob.id}`)}>
            Ver publicación
          </Button>
          <Button fullWidth variant="secondary" onClick={() => navigate("/my-jobs")}>
            Ir a mis publicaciones
          </Button>
        </div>
      </SurfaceCard>
    </div>
  );
}
