/**
 * WHY: Bring the inbox into the same premium system with clearer rows, identity cues, and polished loading states.
 * CHANGED: YYYY-MM-DD
 */
import { getSampleMessages } from "../../data/mockData";
import { MessageCircle, Shield } from "lucide-react";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { useAppState } from "../hooks/useAppState";
import { formatRelative } from "../utils/format";
import { Badge } from "../components/Badge";
import { ScreenHeader } from "../components/ScreenHeader";
import { SkeletonBlock } from "../components/SkeletonBlock";
import { SurfaceCard } from "../components/SurfaceCard";
import { UserAvatar } from "../components/UserAvatar";

export function Chat() {
  const navigate = useNavigate();
  const { conversations, messages, currentUserId, jobs, profiles, isLoading, dataSource } = useAppState();
  const isPreview = dataSource === "fallback";

  const rows = conversations
    .map((conv) => {
      const otherUserId = conv.participantIds.find((id) => id !== currentUserId)!;
      const otherUser = profiles.find((u) => u.id === otherUserId);
      const conversationMessages =
        isPreview && messages.every((message) => message.conversationId !== conv.id)
          ? getSampleMessages(conv.id)
          : messages.filter((m) => m.conversationId === conv.id);
      const lastMessage = conversationMessages[conversationMessages.length - 1];
      const unreadCount = conversationMessages.filter((m) => m.senderUserId !== currentUserId && !m.read).length;
      const relatedJob = jobs.find((job) => job.id === conv.jobId);
      const otherRole =
        relatedJob && otherUser
          ? relatedJob.postedByUserId === otherUser.id
            ? "Cliente"
            : "Trabajador"
          : null;
      return { conv, otherUser, lastMessage, unreadCount, relatedJob, otherRole };
    })
    .sort((a, b) => new Date(b.conv.lastMessageAt).getTime() - new Date(a.conv.lastMessageAt).getTime());

  return (
    <div className="app-screen pb-28">
      <ScreenHeader
        title="Mensajes"
        subtitle={`${rows.filter((r) => r.unreadCount > 0).length} conversaciones con novedades`}
      />

      <div className="space-y-3 px-6 py-4">
        {isLoading && rows.length === 0
          ? Array.from({ length: 4 }).map((_, index) => (
              <SurfaceCard key={`chat-skeleton-${index}`} padding="md">
                <div className="flex items-start gap-4">
                  <SkeletonBlock className="h-14 w-14 rounded-[20px]" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <SkeletonBlock className="h-4 w-28 rounded-full" />
                      <SkeletonBlock className="h-3 w-12 rounded-full" />
                    </div>
                    <SkeletonBlock className="h-3 w-20 rounded-full" />
                    <SkeletonBlock className="h-4 w-full rounded-full" />
                  </div>
                </div>
              </SurfaceCard>
            ))
          : null}

        {rows.map(({ conv, otherUser, lastMessage, unreadCount, relatedJob, otherRole }) => (
          <button
            key={conv.id}
            onClick={() => navigate(`/chat/${conv.id}`)}
            className={`app-surface w-full p-4 text-left transition-[transform,box-shadow] duration-200 hover:translate-y-[-2px] hover:shadow-[var(--app-shadow-md)] ${
              unreadCount > 0 ? "border-[rgba(13,174,121,0.28)]" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <UserAvatar
                name={otherUser?.name}
                avatarUrl={otherUser?.avatarUrl}
                fallbackLetter={otherUser?.avatarLetter ?? "?"}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold tracking-[-0.02em] text-[var(--app-text)]">
                        {otherUser?.name ?? "Usuario"}
                      </h3>
                      {otherRole ? (
                        <Badge variant="default" size="sm">
                          {otherRole}
                        </Badge>
                      ) : null}
                      {otherUser?.verified && (
                        <Badge variant="verified" size="sm" icon={<Shield size={10} />}>
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">
                      {relatedJob?.title ?? "Trabajo"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="whitespace-nowrap text-xs text-[var(--app-text-muted)]">
                      {formatRelative(conv.lastMessageAt)}
                    </span>
                    {unreadCount > 0 ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--app-brand)] text-xs font-bold text-white">
                        {unreadCount}
                      </div>
                    ) : null}
                  </div>
                </div>
                <p
                  className={`line-clamp-1 text-sm ${
                    unreadCount > 0
                      ? "font-semibold text-[var(--app-text)]"
                      : "text-[var(--app-text-muted)]"
                  }`}
                >
                  {lastMessage?.content ?? "Sin mensajes"}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {rows.length === 0 && !isLoading && (
        <div className="px-6 py-8">
          <EmptyStateCard
            icon={<MessageCircle size={28} />}
            title="Todavía no tenés conversaciones"
            description="Cuando una changa avance, el chat entre cliente y trabajador va a aparecer acá."
            actionLabel="Explorar changas"
            onAction={() => navigate("/search")}
          />
        </div>
      )}

      <BottomNav />
    </div>
  );
}
