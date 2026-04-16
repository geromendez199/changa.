/**
 * WHY: Make chat feel more intentional with clearer context and reliable feedback after sending messages.
 * CHANGED: YYYY-MM-DD
 */
import { ArrowLeft, CircleHelp, Flag, Send, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Input } from "../../components/Input";
import { useAppState } from "../../hooks/useAppState";
import { formatRelative } from "../../utils/format";

export function ChatDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { conversations, messages, currentUserId, sendMessage, jobs, profiles, refreshChatDetail } = useAppState();
  const [text, setText] = useState("");
  const [composerFeedback, setComposerFeedback] = useState<string | null>(null);

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
      <div className="min-h-screen bg-[#F8FAFC] px-6 pt-20 max-w-md mx-auto">
        <p className="text-sm text-gray-500">No pudimos cargar esta conversación.</p>
        <button onClick={() => navigate("/chat")} className="mt-3 text-[#0DAE79] font-semibold">Volver a mensajes</button>
      </div>
    );
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
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-[#111827]">{otherUser?.name}</h1>
              {otherUser?.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#0DAE79]">
                  <Shield size={10} />
                  Verificado
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{relatedJob?.title}</p>
            <p className="mt-1 text-[11px] font-medium text-[#0DAE79]">
              Coordiná por este chat para mantener el contexto de la changa.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() =>
                  toast("Centro de ayuda", {
                    description: "La guía de seguridad del chat se va a sumar en una próxima etapa.",
                  })
                }
                className="rounded-full bg-[#F8FAFC] px-3 py-1 text-[11px] font-semibold text-[#111827]"
              >
                <span className="inline-flex items-center gap-1">
                  <CircleHelp size={12} />
                  Ayuda
                </span>
              </button>
              <button
                onClick={() =>
                  toast("Reporte registrado", {
                    description: "El flujo completo para reportar conversaciones se va a sumar en una próxima etapa.",
                  })
                }
                className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-700"
              >
                <span className="inline-flex items-center gap-1">
                  <Flag size={12} />
                  Reportar
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto">
        {conversationMessages.map((message) => {
          const isOwn = message.senderUserId === currentUserId;
          return (
            <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${isOwn ? "bg-[#0DAE79] text-white" : "bg-white text-[#111827] border border-gray-100"}`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-[10px] mt-1 ${isOwn ? "text-white/80" : "text-gray-400"}`}>{formatRelative(message.createdAt)}</p>
              </div>
            </div>
          );
        })}
        {conversationMessages.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">
            Todavía no empezaron a coordinar. El primer mensaje suele destrabar rápido una changa.
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 max-w-md mx-auto flex items-center gap-3">
        <div className="flex-1">
          <Input placeholder="Escribí un mensaje..." value={text} onChange={setText} />
          {composerFeedback && (
            <p className="mt-2 text-xs font-medium text-[#0DAE79]">{composerFeedback}</p>
          )}
        </div>
        <button
          onClick={async () => {
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
          disabled={!text.trim()}
          className="bg-[#0DAE79] disabled:bg-gray-300 text-white p-3 rounded-full"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
