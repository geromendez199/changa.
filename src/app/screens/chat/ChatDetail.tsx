/**
 * WHY: Make the chat easier to understand with clear client-worker context and a simpler, more useful conversation layout.
 * CHANGED: YYYY-MM-DD
 */
import { MapPin, Send, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "../../components/Badge";
import { Input } from "../../components/Input";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfaceCard } from "../../components/SurfaceCard";
import { UserAvatar } from "../../components/UserAvatar";
import { useAppState } from "../../hooks/useAppState";
import { useRealtimeNotifications } from "../../hooks/useRealtimeNotifications";
import { formatRelative } from "../../utils/format";
import { isLocalPreviewSource } from "../../../services/service.utils";
import { subscribeToConversationMessages } from "../../../services/chat.service";

export function ChatDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { conversations, messages, currentUserId, sendMessage, jobs, profiles, refreshChatDetail, dataSource } = useAppState();
  const [text, setText] = useState("");
  const [composerFeedback, setComposerFeedback] = useState<string | null>(null);
  const isPreview = isLocalPreviewSource(dataSource);
  const { triggerMessageNotification } = useRealtimeNotifications(currentUserId);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!id || !currentUserId) return;

    const conversation = conversations.find((c) => c.id === id);
    const otherUserId = conversation?.participantIds.find((uid) => uid !== currentUserId);
    const otherUser = profiles.find((p) => p.id === otherUserId);

    const unsubscribe = subscribeToConversationMessages(id, (newMessage) => {
      // Only notify if message is from the other user and user is not the sender
      if (newMessage.senderUserId !== currentUserId && otherUser) {
        void triggerMessageNotification(id, otherUser.name, newMessage.content.substring(0, 50));
      }
      console.log("[Chat] Received realtime message:", newMessage.id);
    });

    return () => unsubscribe?.();
  }, [id, currentUserId, conversations, profiles, triggerMessageNotification]);

  const conversation = conversations.find((item) => item.id === id);

  useEffect(() => {
    if (id) {
      void refreshChatDetail(id);
    }
  }, [id, refreshChatDetail]);

  const conversationMessages = useMemo(
    () => messages.filter((msg) => msg.conversationId === id),
    [id, messages],
  );

  if (!conversation) {
    return (
      <div className="app-screen px-6 pt-20">
        <p className="text-sm text-[var(--app-text-muted)]">No pudimos cargar esta conversación.</p>
        <button onClick={() => navigate("/chat")} className="mt-3 font-semibold text-[var(--app-brand)]">
          Volver a mensajes
        </button>
      </div>
    );
  }

  const otherUserId = conversation.participantIds.find((item) => item !== currentUserId)!;
  const otherUser = profiles.find((u) => u.id === otherUserId);
  const relatedJob = jobs.find((job) => job.id === conversation.jobId);
  const currentUserRole = relatedJob
    ? relatedJob.postedByUserId === currentUserId
      ? "Cliente"
      : "Trabajador"
    : null;
  const otherUserRole =
    relatedJob && otherUser
      ? relatedJob.postedByUserId === otherUser.id
        ? "Cliente"
        : "Trabajador"
      : null;

  return (
    <div className="app-screen flex min-h-screen flex-col pb-24">
      <ScreenHeader
        title={otherUser?.name ?? "Conversación"}
        subtitle={relatedJob?.title}
        onBack={() => navigate(-1)}
      >
        <div className="flex items-start gap-3">
          <UserAvatar
            name={otherUser?.name}
            avatarUrl={otherUser?.avatarUrl}
            fallbackLetter={otherUser?.avatarLetter ?? "?"}
            size="md"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {otherUserRole ? <Badge variant="default" size="sm">{otherUserRole}</Badge> : null}
              {otherUser?.verified ? (
                <Badge variant="verified" size="sm" icon={<Shield size={10} />}>
                  Verificado
                </Badge>
              ) : null}
            </div>
            {currentUserRole ? (
              <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                Vos actuás como {currentUserRole.toLowerCase()} en esta changa.
              </p>
            ) : null}
          </div>
        </div>
      </ScreenHeader>

      <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto">
        {relatedJob ? (
          <SurfaceCard tone="muted" padding="md" className="shadow-none">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-brand)]">
                  Changa en conversación
                </p>
                <h2 className="mt-1 text-sm font-bold text-[var(--app-text)]">{relatedJob.title}</h2>
                <div className="mt-2 flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                  <MapPin size={12} />
                  <span>{relatedJob.location}</span>
                  <span>•</span>
                  <span>{relatedJob.priceLabel}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/job/${relatedJob.id}`)}
                className="text-xs font-semibold text-[var(--app-brand)]"
              >
                Ver aviso
              </button>
            </div>
          </SurfaceCard>
        ) : null}

        {conversationMessages.map((message) => {
          const isOwn = message.senderUserId === currentUserId;
          return (
            <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-[22px] px-4 py-3 shadow-sm ${
                  isOwn
                    ? "bg-[var(--app-brand)] text-white"
                    : "border border-[var(--app-border)] bg-white text-[var(--app-text)]"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    isOwn ? "text-white/80" : "text-[var(--app-text-muted)]"
                  }`}
                >
                  {formatRelative(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        {conversationMessages.length === 0 && (
          <SurfaceCard tone="muted" padding="md" className="py-10 text-center text-sm text-[var(--app-text-muted)] shadow-none">
            Arranquen por lo importante: horario, alcance y precio final.
          </SurfaceCard>
        )}
      </div>

      <div className="app-floating-bar fixed bottom-0 left-0 right-0">
        <div className="app-content-shell flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex-1">
            <Input placeholder="Escribí un mensaje..." value={text} onChange={setText} size="lg" />
            {composerFeedback && (
              <p className="mt-2 text-xs font-medium text-[var(--app-brand)]">{composerFeedback}</p>
            )}
          </div>
          <button
            onClick={async () => {
              if (isPreview) {
                toast("Vista previa", {
                  description: "El chat funciona como demo local y no envía mensajes reales.",
                });
                return;
              }

              const result = await sendMessage(conversation.id, text);
              if (!result.ok) {
                toast.error("No pudimos enviar el mensaje", {
                  description: result.message ?? "Intentá nuevamente.",
                });
                return;
              }

              setText("");
              setComposerFeedback("Mensaje enviado");
              window.setTimeout(() => setComposerFeedback(null), 2200);
            }}
            disabled={!text.trim() || isPreview}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--app-brand)] text-white disabled:bg-[#c9d3ce]"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
