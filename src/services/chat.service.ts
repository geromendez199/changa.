import { conversations as mockConversations, messages as mockMessages } from "../data/mockData";
import { supabase } from "../lib/supabase";
import { Conversation, Message } from "../types/domain";
import { ConversationsRow, MessagesRow, mapConversationRow, mapMessageRow } from "../types/supabase";
import { normalizeError, ServiceResult, shouldUseFallback } from "./service.utils";

export async function getConversationList(currentUserId: string): Promise<ServiceResult<Conversation[]>> {
  if (shouldUseFallback()) {
    return {
      data: mockConversations.filter((conversation) => conversation.participantIds.includes(currentUserId)).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
      source: "fallback",
    };
  }

  try {
    const { data, error } = await supabase!
      .from("conversations")
      .select("*")
      .or(`participant_1_id.eq.${currentUserId},participant_2_id.eq.${currentUserId}`)
      .order("last_message_at", { ascending: false });

    if (error) throw error;
    const mapped = (data as ConversationsRow[]).map(mapConversationRow);

    return mapped.length ? { data: mapped, source: "supabase" } : { data: mockConversations, source: "fallback" };
  } catch (error) {
    return { data: mockConversations, source: "fallback", error: normalizeError(error) };
  }
}

export async function getConversationMessages(conversationId: string): Promise<ServiceResult<Message[]>> {
  if (shouldUseFallback()) {
    return { data: mockMessages.filter((message) => message.conversationId === conversationId), source: "fallback" };
  }

  try {
    const { data, error } = await supabase!.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
    if (error) throw error;

    const mapped = (data as MessagesRow[]).map(mapMessageRow);
    return mapped.length ? { data: mapped, source: "supabase" } : { data: mockMessages.filter((message) => message.conversationId === conversationId), source: "fallback" };
  } catch (error) {
    return { data: mockMessages.filter((message) => message.conversationId === conversationId), source: "fallback", error: normalizeError(error) };
  }
}

export async function sendChatMessage(input: { conversationId: string; senderUserId: string; content: string }): Promise<ServiceResult<Message | null>> {
  const trimmed = input.content.trim();
  if (!trimmed) {
    return { data: null, source: "fallback", error: "El mensaje no puede estar vacío." };
  }

  if (shouldUseFallback()) {
    return {
      data: {
        id: `m-${Date.now()}`,
        conversationId: input.conversationId,
        senderUserId: input.senderUserId,
        content: trimmed,
        createdAt: new Date().toISOString(),
        read: true,
      },
      source: "fallback",
    };
  }

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
    return {
      data: {
        id: `m-${Date.now()}`,
        conversationId: input.conversationId,
        senderUserId: input.senderUserId,
        content: trimmed,
        createdAt: new Date().toISOString(),
        read: true,
      },
      source: "fallback",
      error: normalizeError(error),
    };
  }
}
