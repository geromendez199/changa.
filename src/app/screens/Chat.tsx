import { MessageCircle, Shield } from "lucide-react";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { useAppState } from "../hooks/useAppState";
import { formatRelative } from "../utils/format";

export function Chat() {
  const navigate = useNavigate();
  const { conversations, messages, currentUserId, jobs, profiles } = useAppState();

  const rows = conversations
    .map((conv) => {
      const otherUserId = conv.participantIds.find((id) => id !== currentUserId)!;
      const otherUser = profiles.find((u) => u.id === otherUserId);
      const conversationMessages = messages.filter((m) => m.conversationId === conv.id);
      const lastMessage = conversationMessages[conversationMessages.length - 1];
      const unreadCount = conversationMessages.filter((m) => m.senderUserId !== currentUserId && !m.read).length;
      const relatedJob = jobs.find((job) => job.id === conv.jobId);
      return { conv, otherUser, lastMessage, unreadCount, relatedJob };
    })
    .sort((a, b) => new Date(b.conv.lastMessageAt).getTime() - new Date(a.conv.lastMessageAt).getTime());

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto font-['Inter']">
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-[#111827]">Mensajes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {rows.filter((r) => r.unreadCount > 0).length} conversaciones con novedades
          </p>
        </div>
      </div>

      <div className="px-6 py-4 space-y-2">
        {rows.map(({ conv, otherUser, lastMessage, unreadCount, relatedJob }) => (
          <button key={conv.id} onClick={() => navigate(`/chat/${conv.id}`)} className={`w-full text-left bg-white rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all duration-200 border ${unreadCount > 0 ? "border-[#0DAE79]/20" : "border-gray-100"}`}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0DAE79] to-[#0B9A6B] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">{otherUser?.avatarLetter ?? "?"}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#111827] text-base">{otherUser?.name ?? "Usuario"}</h3>
                      {otherUser?.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#0DAE79]">
                          <Shield size={10} />
                          Verificado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{relatedJob?.title ?? "Trabajo"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">{formatRelative(conv.lastMessageAt)}</span>
                    {unreadCount > 0 && <div className="bg-[#0DAE79] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{unreadCount}</div>}
                  </div>
                </div>
                <p className={`text-sm line-clamp-1 ${unreadCount > 0 ? "text-[#111827] font-semibold" : "text-gray-600"}`}>{lastMessage?.content ?? "Sin mensajes"}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="px-6 py-8">
          <EmptyStateCard
            icon={<MessageCircle size={28} />}
            eyebrow="Todavía no arrancaste chats"
            title="Tus conversaciones van a aparecer acá"
            description="Cuando publiques una changa o te contacten por una oportunidad, vas a poder seguir todo desde este inbox."
            note="Tener el contexto de la tarea y el historial en un mismo lugar ayuda a coordinar mejor."
            actionLabel="Explorar changas"
            onAction={() => navigate("/search")}
          />
        </div>
      )}

      <BottomNav />
    </div>
  );
}
