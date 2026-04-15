import { supabase } from "../lib/supabase";
import { Conversation, Message } from "../types/domain";
import { ConversationsRow, MessagesRow, mapConversationRow, mapMessageRow } from "../types/supabase";
import { normalizeError, ServiceResult, shouldUseFallback } from "./service.utils";

export async function getConversationList(currentUserId: string): Promise<ServiceResult<Conversation[]>> {
  if (shouldUseFallback()) return { data: [], source: "fallback" };

  try {
    const { data, error } = await supabase!
      .from("conversations")
      .select("*")
      .or(`participant_1_id.eq.${currentUserId},participant_2_id.eq.${currentUserId}`)
      .order("last_message_at", { ascending: false });

    if (error) throw error;
    return { data: (data as ConversationsRow[]).map(mapConversationRow), source: "supabase" };
  } catch (error) {
    return { data: [], source: "fallback", error: normalizeError(error) };
  }
}

export async function getConversationMessages(conversationId: string): Promise<ServiceResult<Message[]>> {
  if (shouldUseFallback()) return { data: [], source: "fallback" };

  try {
    const { data, error } = await supabase!.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
    if (error) throw error;

    return { data: (data as MessagesRow[]).map(mapMessageRow), source: "supabase" };
  } catch (error) {
    return { data: [], source: "fallback", error: normalizeError(error) };
  }
}

export async function sendChatMessage(input: { conversationId: string; senderUserId: string; content: string }): Promise<ServiceResult<Message | null>> {
  const trimmed = input.content.trim();
  if (!trimmed) return { data: null, source: "fallback", error: "El mensaje no puede estar vacío." };
  if (shouldUseFallback()) return { data: null, source: "fallback", error: "Configurá Supabase para enviar mensajes reales." };

  try {
    const { data, error } = await supabase!
      .from("messages")
      .insert({
        conversation_id: input.conversationId,
        sender_user_id: input.senderUserId,
        content: trimmed,
      })
      .select("*")
      .single();

    if (error) throw error;
    return { data: mapMessageRow(data as MessagesRow), source: "supabase" };
  } catch (error) {
    return { data: null, source: "fallback", error: normalizeError(error) };
  }
}
