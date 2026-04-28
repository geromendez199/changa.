import { optimizeImageUrl } from '@/lib/image';
import { useDocumentHead } from "@/hooks/useDocumentHead";
/**
 * WHY: Standardize job management screens with clearer tabs, consistent status badges, and calmer card hierarchy.
 * CHANGED: YYYY-MM-DD
 */
import { BottomNav } from "../components/BottomNav";
import { MapPin, Clock, CheckCircle, AlertCircle, Star, BriefcaseBusiness, Send, MessageCircle, Pencil, Trash2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../components/Badge";
import { useAppState } from "../hooks/useAppState";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { useNavigate } from "react-router";
import { ScreenHeader } from "../components/ScreenHeader";
import { SurfaceCard } from "../components/SurfaceCard";

export function MyJobs() {
  const navigate = useNavigate();
  const {
    myJobs,
    applications,
    jobs,
    conversations,
    currentUserId,
    ensureConversation,
    removePublishedJob,
    withdrawMyApplication,
  } = useAppState();
  const [activeTab, setActiveTab] = useState<"publicados" | "postulados" | "completados">("publicados");
  const appliedRows = useMemo(
    () => applications.map((application) => ({ application, job: jobs.find((j) => j.id === application.jobId) })).filter((item) => item.job),
    [applications, jobs],
  );
  const completed = useMemo(() => myJobs.filter((job) => job.status === "completado"), [myJobs]);

  const tabData = { publicados: myJobs, postulados: appliedRows, completados: completed } as const;

  return (
    <div className="app-screen pb-28">
      <ScreenHeader
        title="Mis publicaciones"
        subtitle="Gestioná tus pedidos, servicios, postulaciones y trabajos completados."
      >
        <div className="grid grid-cols-3 gap-1 rounded-[22px] bg-[var(--app-surface-muted)] p-1">
          {([
            ["publicados", "Publicados", myJobs.length],
            ["postulados", "Postulados", appliedRows.length],
            ["completados", "Hechos", completed.length],
          ] as const).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`min-w-0 rounded-[18px] px-1 py-2.5 text-xs font-semibold transition-all min-[380px]:text-sm ${
                activeTab === key
                  ? "bg-white text-[var(--app-brand)] shadow-[0_8px_20px_rgba(17,24,39,0.06)]"
                  : "text-[var(--app-text-muted)]"
              }`}
            >
              {label}
              <span
                className={`ml-1.5 rounded-full px-2 py-0.5 text-xs ${
                  activeTab === key
                    ? "bg-[var(--app-brand)] text-white"
                    : "bg-[#dce5e0] text-[var(--app-text-muted)]"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </ScreenHeader>

      <div className="app-page-section space-y-3 py-6">
        {activeTab === "publicados" && myJobs.map((job) => (
          <SurfaceCard key={job.id} padding="none" className="overflow-hidden">
            <div className="flex gap-3 p-3 min-[380px]:gap-4 min-[380px]:p-4">
              <img src={job.image} alt={job.title} className="h-16 w-16 shrink-0 rounded-[16px] object-cover min-[380px]:h-20 min-[380px]:w-20 min-[380px]:rounded-[20px]" />
              <div className="min-w-0 flex-1">
                <h3 className="mb-2 line-clamp-2 text-sm font-bold tracking-normal text-[var(--app-text)] min-[380px]:text-base">
                  {job.title}
                </h3>
                <Badge variant="published" icon={<AlertCircle size={12} />}>
                  {job.listingType === "service" ? "Servicio" : "Pedido"}
                </Badge>
                <div className="mt-3 flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                  <MapPin size={12} />
                  <span>{job.location}</span>
                </div>
              </div>
              <p className="shrink-0 text-sm font-bold text-[var(--app-brand)] min-[380px]:text-base">{job.priceLabel}</p>
            </div>
            <div className="flex flex-col gap-2 border-t border-[var(--app-border)] px-4 pb-4 pt-3 sm:flex-row">
              <button
                onClick={() => navigate(`/job/${job.id}`)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--app-border)] px-3 py-3 text-sm font-semibold text-[var(--app-text)]"
              >
                Ver aviso
              </button>
              <button
                onClick={() => navigate(`/publish?edit=${job.id}`)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--app-border)] px-3 py-3 text-sm font-semibold text-[var(--app-text)]"
              >
                <Pencil size={15} />
                Editar
              </button>
              <button
                onClick={async () => {
                  const confirmed = window.confirm(
                    `¿Querés eliminar este ${job.listingType === "service" ? "servicio" : "pedido"}?`,
                  );
                  if (!confirmed) return;

                  const result = await removePublishedJob(job.id);
                  if (!result.ok) {
                    toast.error(
                      `No pudimos eliminar el ${job.listingType === "service" ? "servicio" : "pedido"}`,
                      {
                      description: result.message,
                      },
                    );
                    return;
                  }

                  toast.success(
                    `${job.listingType === "service" ? "Servicio" : "Pedido"} eliminado`,
                    {
                    description: result.message,
                    },
                  );
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-200 px-3 py-3 text-sm font-semibold text-red-600"
              >
                <Trash2 size={15} />
                Eliminar
              </button>
            </div>
          </SurfaceCard>
        ))}

        {activeTab === "postulados" && appliedRows.map(({ application, job }) => (
          <SurfaceCard key={application.id} padding="md">
            <h3 className="mb-1 font-bold tracking-normal text-[var(--app-text)]">{job!.title}</h3>
            <p className="mb-3 text-sm leading-relaxed text-[var(--app-text-muted)]">{application.coverMessage}</p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge
                variant={
                  application.status === "aceptada"
                    ? "accepted"
                    : application.status === "rechazada"
                      ? "error"
                      : "pending"
                }
              >
                {application.status === "aceptada"
                  ? "Aceptada"
                  : application.status === "rechazada"
                    ? "Rechazada"
                    : "Enviada"}
              </Badge>
              <button
                onClick={() => navigate(`/job/${job!.id}`)}
                className="text-xs font-semibold text-[var(--app-brand)]"
              >
                Ver aviso
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-2 min-[380px]:flex-row">
              {application.status === "aceptada" ? (
                <button
                  onClick={() => {
                    const conversation = conversations.find(
                      (item) =>
                        item.jobId === job!.id && item.participantIds.includes(currentUserId ?? ""),
                    );

                    if (!conversation) {
                      void ensureConversation({
                        participant1Id: job!.postedByUserId,
                        participant2Id: currentUserId ?? "",
                        jobId: job!.id,
                      }).then((result) => {
                        if (!result.ok || !result.conversation) {
                          toast.error("No pudimos abrir el chat", {
                            description: result.message ?? "Intentá nuevamente.",
                          });
                          return;
                        }

                        navigate(`/chat/${result.conversation.id}`);
                      });
                    } else {
                      navigate(`/chat/${conversation.id}`);
                    }
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--app-brand)] px-3 py-3 text-sm font-semibold text-white"
                >
                  <MessageCircle size={15} />
                  Abrir chat
                </button>
              ) : null}

              {application.status === "enviada" ? (
                <button
                  onClick={async () => {
                    const confirmed = window.confirm("¿Querés retirarte de esta postulación?");
                    if (!confirmed) return;

                    const result = await withdrawMyApplication(application.id);
                    if (!result.ok) {
                      toast.error("No pudimos retirarte", {
                        description: result.message,
                      });
                      return;
                    }

                    toast.success("Postulación retirada", {
                      description: result.message,
                    });
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--app-border)] px-3 py-3 text-sm font-semibold text-[var(--app-text)]"
                >
                  <XCircle size={15} />
                  Retirarme
                </button>
              ) : null}
            </div>
          </SurfaceCard>
        ))}

        {activeTab === "completados" && completed.map((job) => (
          <SurfaceCard key={job.id} padding="md" className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
            <div className="min-w-0">
              <h3 className="font-bold tracking-normal text-[var(--app-text)]">{job.title}</h3>
              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                <Clock size={12} />
                <span>Trabajo finalizado</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-[#FBBF24] fill-[#FBBF24]" />
              <Badge variant="completed" size="sm">
                Calificado
              </Badge>
            </div>
          </SurfaceCard>
        ))}

        {tabData[activeTab].length === 0 && (
          <EmptyStateCard
            icon={activeTab === "publicados" ? <BriefcaseBusiness size={28} /> : activeTab === "postulados" ? <Send size={28} /> : <CheckCircle size={28} />}
            title={activeTab === "publicados" ? "Todavía no publicaste nada" : activeTab === "postulados" ? "No tenés solicitudes activas" : "Tus trabajos completados van a aparecer acá"}
            description={activeTab === "publicados" ? "Publicá tu primer pedido o servicio para empezar a mover tu perfil en la zona." : activeTab === "postulados" ? "Explorá pedidos o servicios y empezá a conectar con personas cerca tuyo." : "Cuando cierres trabajos y acumules reseñas, esta sección va a mostrar tu historial."}
            actionLabel={activeTab === "publicados" ? "Publicar" : "Explorar"}
            onAction={() => navigate(activeTab === "publicados" ? "/publish" : "/search")}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
