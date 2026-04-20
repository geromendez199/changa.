/**
 * WHY: Turn job detail into a complete marketplace flow where workers can apply and clients can manage applicants with chat continuity.
 * CHANGED: YYYY-MM-DD
 */
import { ArrowLeft, Calendar, MapPin, Shield, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { PreviewModeNotice } from "../components/PreviewModeNotice";
import { SectionHeader } from "../components/SectionHeader";
import { SkeletonBlock } from "../components/SkeletonBlock";
import { SurfaceCard } from "../components/SurfaceCard";
import { Textarea } from "../components/Textarea";
import { UserAvatar } from "../components/UserAvatar";
import { useAppState } from "../hooks/useAppState";
import { Application, Job } from "../../types/domain";
import { formatDistance, formatUrgencyLabel } from "../utils/format";
import { getFallbackPreviewMessage } from "../../services/service.utils";
import { getListingActionCopy, getListingTypeLabel } from "../utils/listings";

export function JobDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    loadJobById,
    profiles,
    applications,
    conversations,
    currentUserId,
    loadJobApplications,
    applyToJob,
    setApplicationDecision,
    ensureConversation,
    dataSource,
  } = useAppState();
  const [job, setJob] = useState<Job | null>(null);
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [coverMessage, setCoverMessage] = useState("");
  const [proposedAmount, setProposedAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [activeApplicationId, setActiveApplicationId] = useState<string | null>(null);
  const isPreview = dataSource === "fallback";

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      const data = await loadJobById(id);
      setJob(data);
      setIsLoading(false);
    }

    void load();
  }, [id, loadJobById]);

  useEffect(() => {
    async function loadApplications() {
      if (!job || currentUserId !== job.postedByUserId) {
        setJobApplications([]);
        return;
      }

      const nextApplications = await loadJobApplications(job.id);
      setJobApplications(nextApplications);
    }

    void loadApplications();
  }, [currentUserId, job, loadJobApplications]);

  const publisher = useMemo(
    () => (job ? profiles.find((user) => user.id === job.postedByUserId) : undefined),
    [job, profiles],
  );

  const isOwner = Boolean(job && currentUserId && currentUserId === job.postedByUserId);
  const myApplication = job
    ? applications.find(
        (application) =>
          application.jobId === job.id && application.applicantUserId === currentUserId,
      ) ?? null
    : null;

  if (isLoading) {
    return (
      <div className="app-screen px-6 pt-20 pb-12">
        <SkeletonBlock className="h-[280px] rounded-[28px]" />
        <div className="mt-6 space-y-4">
          <SkeletonBlock className="h-7 w-4/5 rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            <SkeletonBlock className="h-24 rounded-[24px]" />
            <SkeletonBlock className="h-24 rounded-[24px]" />
          </div>
          <SkeletonBlock className="h-28 rounded-[28px]" />
          <SkeletonBlock className="h-40 rounded-[28px]" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="app-screen px-6 pt-20">
        <button onClick={() => navigate(-1)} className="app-icon-button">
          <ArrowLeft size={24} className="text-[var(--app-text)]" />
        </button>
        <SurfaceCard className="mt-8 text-center" padding="lg">
          <h1 className="mb-2 text-xl font-bold tracking-[-0.02em] text-[var(--app-text)]">
            Publicación no encontrada
          </h1>
          <p className="mb-6 text-sm text-[var(--app-text-muted)]">
            Esta publicación no existe o fue eliminada.
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate("/search")} fullWidth>
              Ver otras publicaciones
            </Button>
            <Button
              variant="secondary"
              onClick={() => id && void loadJobById(id).then(setJob)}
              fullWidth
            >
              Intentá nuevamente
            </Button>
          </div>
        </SurfaceCard>
      </div>
    );
  }

  const listingCopy = getListingActionCopy(job.listingType);

  const trustSignals = publisher
    ? [
        {
          label: "Verificación",
          value: publisher.verified ? "Activa" : "Pendiente",
        },
        {
          label: "Trabajos",
          value: `${publisher.completedJobs}`,
        },
        {
          label: "Cumplimiento",
          value: `${publisher.successRate}%`,
        },
      ]
    : [];

  const handleApply = async () => {
    if (!currentUserId) {
      navigate(`/login?redirect=${encodeURIComponent(`/job/${job.id}`)}`);
      return;
    }

    setIsSubmittingApplication(true);
    const result = await applyToJob({
      jobId: job.id,
      coverMessage,
      proposedAmount: Number(proposedAmount),
    });
    setIsSubmittingApplication(false);

    if (!result.ok || !result.application) {
      toast.error(
        `No pudimos enviar ${job.listingType === "service" ? "la solicitud" : "la postulación"}`,
        {
        description: result.message,
        },
      );
      return;
    }

    setCoverMessage("");
    setProposedAmount("");
    toast.success(job.listingType === "service" ? "Solicitud enviada" : "Postulación enviada", {
      description: listingCopy.detailApplySuccessDescription,
    });
  };

  const handleApplicationDecision = async (
    application: Application,
    status: "aceptada" | "rechazada",
  ) => {
    setActiveApplicationId(application.id);
    const result = await setApplicationDecision({
      applicationId: application.id,
      jobId: job.id,
      applicantUserId: application.applicantUserId,
      status,
    });

    if (!result.ok) {
      setActiveApplicationId(null);
      toast.error("No pudimos actualizar la solicitud", {
        description: result.message,
      });
      return;
    }

    setJobApplications((prev) =>
      prev.map((item) =>
        item.id === application.id
          ? {
              ...item,
              status,
              coverMessage: item.coverMessage,
              proposedAmount: item.proposedAmount,
            }
          : item,
      ),
    );

    if (status === "aceptada") {
      const conversationResult = await ensureConversation({
        participant1Id: job.postedByUserId,
        participant2Id: application.applicantUserId,
        jobId: job.id,
      });

      setActiveApplicationId(null);

      if (!conversationResult.ok || !conversationResult.conversation) {
        toast.error("La solicitud fue aceptada, pero falló el chat", {
          description:
            conversationResult.message ?? "Intentá abrir la conversación nuevamente.",
        });
        return;
      }

      toast.success(job.listingType === "service" ? "Solicitud aceptada" : "Postulante aceptado", {
        description:
          job.listingType === "service"
            ? "La conversación ya quedó disponible para coordinar el servicio."
            : "La conversación ya quedó disponible para coordinar la changa.",
      });
      return;
    }

    setActiveApplicationId(null);
    toast.success(job.listingType === "service" ? "Solicitud rechazada" : "Postulación rechazada", {
      description:
        job.listingType === "service"
          ? "Tu servicio sigue visible para otras personas."
          : "La changa sigue abierta para otras personas.",
    });
  };

  const openConversationForApplication = async (application: Application) => {
    const existingConversation = conversations.find(
      (conversation) =>
        conversation.jobId === job.id &&
        conversation.participantIds.includes(job.postedByUserId) &&
        conversation.participantIds.includes(application.applicantUserId),
    );

    if (existingConversation) {
      navigate(`/chat/${existingConversation.id}`);
      return;
    }

    const conversationResult = await ensureConversation({
      participant1Id: job.postedByUserId,
      participant2Id: application.applicantUserId,
      jobId: job.id,
    });

    if (!conversationResult.ok || !conversationResult.conversation) {
      toast.error("No pudimos abrir el chat", {
        description: conversationResult.message ?? "Intentá nuevamente.",
      });
      return;
    }

    navigate(`/chat/${conversationResult.conversation.id}`);
  };

  const openMyAcceptedChat = async () => {
    if (!currentUserId) return;

    const existingConversation = conversations.find(
      (conversation) =>
        conversation.jobId === job.id &&
        conversation.participantIds.includes(currentUserId) &&
        conversation.participantIds.includes(job.postedByUserId),
    );

    if (existingConversation) {
      navigate(`/chat/${existingConversation.id}`);
      return;
    }

    const conversationResult = await ensureConversation({
      participant1Id: job.postedByUserId,
      participant2Id: currentUserId,
      jobId: job.id,
    });

    if (!conversationResult.ok || !conversationResult.conversation) {
      toast.error("No pudimos abrir el chat", {
        description: conversationResult.message ?? "Intentá nuevamente.",
      });
      return;
    }

    navigate(`/chat/${conversationResult.conversation.id}`);
  };

  return (
    <div className="app-screen pb-32">
      <div className="relative">
        <img src={job.image} alt={job.title} className="h-[260px] w-full object-cover sm:h-[320px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        <button
          onClick={() => navigate(-1)}
          className="app-icon-button absolute left-4 top-6 bg-white/95 sm:left-6 sm:top-14"
        >
          <ArrowLeft size={20} className="text-[var(--app-text)]" />
        </button>

        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 sm:bottom-6 sm:left-6">
          <Badge variant="published">{getListingTypeLabel(job.listingType)}</Badge>
          <Badge variant="accent">{job.category}</Badge>
          {job.urgency === "urgente" ? (
            <Badge variant="urgent">{formatUrgencyLabel(job.urgency)}</Badge>
          ) : null}
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <h1 className="mb-3 text-2xl font-bold leading-tight tracking-[-0.03em] text-[var(--app-text)]">
          {job.title}
        </h1>

        {isPreview ? (
          <PreviewModeNotice className="mb-5" description={getFallbackPreviewMessage("esta publicación")} />
        ) : null}

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SurfaceCard tone="muted" padding="sm">
            <div className="mb-1 flex items-center gap-2 text-[var(--app-text-muted)]">
              <MapPin size={16} className="text-[var(--app-brand)]" />
              <span className="text-xs font-medium">Ubicación</span>
            </div>
            <p className="text-sm font-semibold text-[var(--app-text)]">{job.location}</p>
            <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">
              {formatDistance(job.distanceKm)} de distancia
            </p>
          </SurfaceCard>
          <SurfaceCard tone="muted" padding="sm">
            <div className="mb-1 flex items-center gap-2 text-[var(--app-text-muted)]">
              <Calendar size={16} className="text-[var(--app-brand)]" />
              <span className="text-xs font-medium">Disponibilidad</span>
            </div>
            <p className="text-sm font-semibold text-[var(--app-text)]">{job.availability}</p>
            <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">Coordinación directa</p>
          </SurfaceCard>
        </div>

        <div className="mb-6 rounded-3xl bg-gradient-to-br from-[#0DAE79] to-[#0B9A6B] p-6 shadow-xl shadow-[#0DAE79]/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-sm text-white/80">
                {job.listingType === "service" ? "Precio base" : "Presupuesto"}
              </p>
              <p className="text-3xl font-bold text-white">{job.priceLabel}</p>
              <p className="mt-1 text-xs text-white/70">
                {job.listingType === "service"
                  ? "Podés pedir presupuesto o coordinar por la app"
                  : "A coordinar por la app"}
              </p>
            </div>
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
              <Shield size={32} className="text-white" />
            </div>
          </div>
        </div>

        <SurfaceCard className="mb-6" padding="lg">
          <SectionHeader title="Descripción" />
          <p className="mt-4 leading-relaxed text-[var(--app-text-muted)]">{job.description}</p>
        </SurfaceCard>

        {publisher ? (
          <SurfaceCard className="mb-6" padding="md">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
              {job.listingType === "service" ? "Servicio publicado por" : "Publicado por"}
            </p>
            <div className="flex items-center gap-4">
              <UserAvatar
                name={publisher.name}
                avatarUrl={publisher.avatarUrl}
                fallbackLetter={publisher.avatarLetter}
                size="md"
              />
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-bold text-[var(--app-text)]">{publisher.name}</h3>
                  {publisher.verified ? (
                    <Badge variant="verified" icon={<Shield size={10} />}>
                      Verificado
                    </Badge>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-[#FBBF24] text-[#FBBF24]" />
                    <span className="font-semibold text-[var(--app-text)]">{publisher.rating}</span>
                    <span className="text-[var(--app-text-muted)]">({publisher.totalReviews})</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-[#cad4cf]" />
                  <span className="text-[var(--app-text-muted)]">
                    {publisher.completedJobs} trabajos
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {trustSignals.map((signal) => (
                <SurfaceCard key={signal.label} tone="muted" padding="sm" className="text-center">
                  <p className="text-[11px] font-semibold text-[var(--app-text-muted)]">
                    {signal.label}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[var(--app-text)]">{signal.value}</p>
                </SurfaceCard>
              ))}
            </div>
          </SurfaceCard>
        ) : null}

        {isOwner ? (
          <SurfaceCard className="mb-6" padding="lg">
            <SectionHeader
              title={listingCopy.detailOwnerSection}
              subtitle={
                jobApplications.length > 0
                  ? `${jobApplications.length} personas respondieron esta publicación`
                  : job.listingType === "service"
                    ? "Todavía no hay solicitudes"
                    : "Todavía no hay postulaciones"
              }
            />

            {jobApplications.length > 0 ? (
              <div className="mt-4 space-y-3">
                {jobApplications.map((application) => {
                  const applicant = profiles.find((profile) => profile.id === application.applicantUserId);
                  const isAccepted = application.status === "aceptada";
                  const isRejected = application.status === "rechazada";

                  return (
                    <SurfaceCard key={application.id} tone="muted" padding="md">
                      <div className="flex items-start gap-3">
                        <UserAvatar
                          name={applicant?.name}
                          avatarUrl={applicant?.avatarUrl}
                          fallbackLetter={applicant?.avatarLetter ?? "?"}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-[var(--app-text)]">
                              {applicant?.name ?? "Usuario"}
                            </h3>
                            <Badge
                              variant={
                                isAccepted ? "accepted" : isRejected ? "error" : "pending"
                              }
                              size="sm"
                            >
                              {isAccepted ? "Aceptada" : isRejected ? "Rechazada" : "Pendiente"}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
                            {application.coverMessage}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[var(--app-brand)]">
                            Propone {`$${application.proposedAmount.toLocaleString("es-AR")}`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        {application.status === "enviada" ? (
                          <>
                            <Button
                              fullWidth
                              size="sm"
                              disabled={activeApplicationId === application.id}
                              onClick={() => void handleApplicationDecision(application, "aceptada")}
                            >
                              Aceptar
                            </Button>
                            <Button
                              fullWidth
                              size="sm"
                              variant="secondary"
                              disabled={activeApplicationId === application.id}
                              onClick={() => void handleApplicationDecision(application, "rechazada")}
                            >
                              Rechazar
                            </Button>
                          </>
                        ) : null}

                        {isAccepted ? (
                          <Button
                            fullWidth
                            size="sm"
                            variant="secondary"
                            onClick={() => void openConversationForApplication(application)}
                          >
                            Abrir chat
                          </Button>
                        ) : null}
                      </div>
                    </SurfaceCard>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-5 text-sm text-[var(--app-text-muted)]">
                {listingCopy.ownerEmptyApplicants}
              </div>
            )}
          </SurfaceCard>
        ) : (
          <SurfaceCard className="mb-6" padding="lg">
            {myApplication ? (
              <>
                <SectionHeader title={job.listingType === "service" ? "Tu solicitud" : "Tu postulación"} />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Badge
                    variant={
                      myApplication.status === "aceptada"
                        ? "accepted"
                        : myApplication.status === "rechazada"
                          ? "error"
                          : "pending"
                    }
                  >
                    {myApplication.status === "aceptada"
                      ? "Aceptada"
                      : myApplication.status === "rechazada"
                        ? "Rechazada"
                        : "En revisión"}
                  </Badge>
                  <span className="text-sm font-semibold text-[var(--app-brand)]">
                    {`$${myApplication.proposedAmount.toLocaleString("es-AR")}`}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--app-text-muted)]">
                  {myApplication.coverMessage}
                </p>

                {myApplication.status === "aceptada" ? (
                  <div className="mt-4">
                    <Button fullWidth onClick={() => void openMyAcceptedChat()}>
                      Abrir chat con {job.listingType === "service" ? "quien ofrece el servicio" : "el cliente"}
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <SectionHeader
                  title={listingCopy.detailApplyTitle}
                  subtitle={
                    job.listingType === "service"
                      ? "Contá qué necesitás, para cuándo lo querés y el presupuesto que tenés en mente."
                      : "Mandá una propuesta clara para que el cliente pueda decidir rápido."
                  }
                />
                <div className="mt-4 space-y-3">
                  <Textarea
                    value={coverMessage}
                    onChange={(event) => setCoverMessage(event.target.value)}
                    placeholder={
                      job.listingType === "service"
                        ? "Contá qué necesitás, cuándo lo querés resolver y cualquier detalle útil para cotizar."
                        : "Contá tu experiencia, cuándo podrías hacerlo y cualquier detalle útil."
                    }
                  />
                  <Input
                    type="number"
                    value={proposedAmount}
                    onChange={setProposedAmount}
                    placeholder={job.listingType === "service" ? "Tu presupuesto estimado en ARS" : "Monto propuesto en ARS"}
                    size="lg"
                  />
                  <Button
                    fullWidth
                    disabled={
                      isSubmittingApplication ||
                      coverMessage.trim().length < 12 ||
                      Number(proposedAmount) <= 0
                    }
                    onClick={() => void handleApply()}
                  >
                    {isSubmittingApplication
                      ? "Enviando..."
                      : job.listingType === "service"
                        ? "Enviar solicitud"
                        : "Enviar postulación"}
                  </Button>
                </div>
              </>
            )}
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
