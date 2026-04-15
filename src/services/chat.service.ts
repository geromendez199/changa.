import { supabase } from "../lib/supabase";
import { Conversation, Message } from "../types/domain";
import { ConversationsRow, MessagesRow, mapConversationRow, mapMessageRow } from "../types/supabase";
import { failureResult, isNonEmptyString, normalizeError, ServiceResult, shouldUseFallback, successResult, toSafeArray } from "./service.utils";

export async function getConversationList(currentUserId: string): Promise<ServiceResult<Conversation[]>> {
  if (!isNonEmptyString(currentUserId)) return successResult([], "fallback");
  if (shouldUseFallback()) return successResult([], "fallback");

  try {
    const { data, error } = await supabase!
      .from("conversations")
      .select("*")
      .or(`participant_1_id.eq.${currentUserId},participant_2_id.eq.${currentUserId}`)
      .order("last_message_at", { ascending: false });

    if (error) throw error;

    const rows = toSafeArray<Partial<ConversationsRow>>(data)
      .map(mapConversationRow)
      .filter((conversation) => isNonEmptyString(conversation.id));

    return successResult(rows);
  } catch (error) {
    return failureResult([], normalizeError(error, "No pudimos cargar tus conversaciones."));
  }
}

export async function getConversationMessages(conversationId: string): Promise<ServiceResult<Message[]>> {
  if (!isNonEmptyString(conversationId)) return successResult([], "fallback");
  if (shouldUseFallback()) return successResult([], "fallback");

  try {
    const { data, error } = await supabase!
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const messages = toSafeArray<Partial<MessagesRow>>(data)
      .map(mapMessageRow)
      .filter((message) => isNonEmptyString(message.id));

    return successResult(messages);
  } catch (error) {
    return failureResult([], normalizeError(error, "No pudimos cargar los mensajes."));
  }
}

export async function sendChatMessage(input: { conversationId: string; senderUserId: string; content: string }): Promise<ServiceResult<Message | null>> {
  const trimmed = input.content.trim();
  if (!trimmed) return failureResult(null, "El mensaje no puede estar vacío.");
  if (!isNonEmptyString(input.conversationId) || !isNonEmptyString(input.senderUserId)) {
    return failureResult(null, "No pudimos enviar el mensaje. Intentá nuevamente.");
  }
  if (shouldUseFallback()) return failureResult(null, "Configurá Supabase para enviar mensajes reales.");

  try {
    const { data, error } = await supabase!
      .from("messages")
      .insert({
        conversation_id: input.conversationId,
        sender_user_id: input.senderUserId,
        content: trimmed,
      })
      .select("*")
      .single<MessagesRow>();

    if (error) throw error;

    await supabase!
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", input.conversationId);

    return successResult(mapMessageRow(data));
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos enviar tu mensaje."));
  }
}
