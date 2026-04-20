/**
 * WHY: Make publish confirmation feel like a polished completion state instead of a generic success message.
 * CHANGED: YYYY-MM-DD
 */
import { CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/Button";
import { SurfaceCard } from "../../components/SurfaceCard";
import { useAppState } from "../../hooks/useAppState";

export function PublishConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { jobs } = useAppState();
  const job = jobs.find((item) => item.id === id);
  const itemLabel = job?.listingType === "service" ? "servicio" : "publicación";

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
          {job
            ? `Tu ${itemLabel} "${job.title}" ya está visible para personas de tu zona.`
            : "Tu publicación fue creada correctamente."}
        </p>
        <div className="mb-6 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 text-sm leading-relaxed text-[var(--app-text-muted)]">
          {job?.listingType === "service"
            ? "Ahora otras personas pueden descubrir tu propuesta, pedirte presupuesto y empezar la conversación desde changa."
            : "Ahora quienes estén disponibles pueden verla, entender el contexto y responderte desde changa."}
        </div>
        <div className="space-y-3">
          {job && (
            <Button fullWidth onClick={() => navigate(`/job/${job.id}`)}>
              Ver publicación
            </Button>
          )}
          <Button fullWidth variant="secondary" onClick={() => navigate("/my-jobs")}>
            Ir a mis publicaciones
          </Button>
        </div>
      </SurfaceCard>
    </div>
  );
}
