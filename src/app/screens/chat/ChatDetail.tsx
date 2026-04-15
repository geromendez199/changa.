import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Input } from "../../components/Input";
import { useAppState } from "../../hooks/useAppState";
import { formatRelative } from "../../utils/format";

export function ChatDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { conversations, messages, currentUserId, sendMessage, jobs, profiles, refreshChatDetail } = useAppState();
  const [text, setText] = useState("");

  const conversation = conversations.find((item) => item.id === id);

  useEffect(() => {
    if (id) {
      refreshChatDetail(id);
    }
  }, [id]);

  const conversationMessages = useMemo(
    () => messages.filter((msg) => msg.conversationId === id),
    [id, messages],
  );

  if (!conversation) {
    return <div className="min-h-screen bg-[#F8FAFC] px-6 pt-20 max-w-md mx-auto">Conversación no encontrada.</div>;
  }

  const otherUserId = conversation.participantIds.find((item) => item !== currentUserId)!;
  const otherUser = profiles.find((u) => u.id === otherUserId);
  const relatedJob = jobs.find((job) => job.id === conversation.jobId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 max-w-md mx-auto font-['Inter'] flex flex-col">
      <div className="bg-white px-6 pt-14 pb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-[#111827]" />
          </button>
          <div>
            <h1 className="font-bold text-[#111827]">{otherUser?.name}</h1>
            <p className="text-xs text-gray-500">{relatedJob?.title}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto">
        {conversationMessages.map((message) => {
          const isOwn = message.senderUserId === currentUserId;
          return (
            <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${isOwn ? "bg-[#10B981] text-white" : "bg-white text-[#111827] border border-gray-100"}`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-[10px] mt-1 ${isOwn ? "text-white/80" : "text-gray-400"}`}>{formatRelative(message.createdAt)}</p>
              </div>
            </div>
          );
        })}
        {conversationMessages.length === 0 && <div className="text-center text-sm text-gray-500 py-10">No hay mensajes todavía.</div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 max-w-md mx-auto flex items-center gap-3">
        <div className="flex-1">
          <Input placeholder="Escribí un mensaje..." value={text} onChange={setText} />
        </div>
        <button
          onClick={() => {
            sendMessage(conversation.id, text);
            setText("");
          }}
          disabled={!text.trim()}
          className="bg-[#10B981] disabled:bg-gray-300 text-white p-3 rounded-full"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
