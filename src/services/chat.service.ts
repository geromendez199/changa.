/**
 * WHY: Route chat sends through a single RPC so message creation and conversation timestamp updates stay atomic.
 * CHANGED: YYYY-MM-DD
 */
import { getSampleConversations, getSampleMessages } from "../data/mockData";
import { supabase } from "../lib/supabase";
import { chatMessageSchema, parseWithValidation } from "../lib/validation/schemas";
import { Conversation, Message } from "../types/domain";
import { ConversationsRow, MessagesRow, mapConversationRow, mapMessageRow } from "../types/supabase";
import {
  ensureAuthenticatedUser,
  failureResult,
  isNonEmptyString,
  normalizeError,
  ServiceResult,
  shouldUseFallback,
  successResult,
  toSafeArray,
} from "./service.utils";

export async function getConversationList(currentUserId: string): Promise<ServiceResult<Conversation[]>> {
  if (!isNonEmptyString(currentUserId)) return successResult([], "fallback");
  if (shouldUseFallback()) return successResult(getSampleConversations(currentUserId), "fallback");

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
  if (shouldUseFallback()) return successResult(getSampleMessages(conversationId), "fallback");

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
  try {
    const validatedInput = parseWithValidation(chatMessageSchema, input);
    if (shouldUseFallback()) return failureResult(null, "No se pueden enviar mensajes reales en esta vista previa.");

    const { data, error } = await supabase!.rpc("send_message", {
      p_conversation_id: validatedInput.conversationId,
      p_sender_user_id: validatedInput.senderUserId,
      p_content: validatedInput.content,
    });

    if (error) throw error;
    if (!data) return successResult(null);

    return successResult(mapMessageRow(data as Partial<MessagesRow>));
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos enviar tu mensaje."));
  }
}

export async function getOrCreateConversation(input: {
  participant1Id: string;
  participant2Id: string;
  jobId: string;
}): Promise<ServiceResult<Conversation | null>> {
  const participantIds = [input.participant1Id, input.participant2Id].filter(isNonEmptyString);
  if (participantIds.length !== 2 || !isNonEmptyString(input.jobId)) {
    return failureResult(null, "No pudimos preparar el chat para esta changa.");
  }

  if (shouldUseFallback()) return successResult(null, "fallback");

  try {
    const [participant1Id, participant2Id] = participantIds;
    await ensureAuthenticatedUser();

    const { data, error } = await supabase!.rpc("create_or_get_conversation", {
      p_participant_1_id: participant1Id,
      p_participant_2_id: participant2Id,
      p_job_id: input.jobId,
    });

    if (error) throw error;
    if (!data) return successResult(null);

    return successResult(mapConversationRow(data as Partial<ConversationsRow>));
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos abrir el chat de esta changa."));
  }
}

/**
 * Subscribe to realtime message updates for a conversation
 */
export function subscribeToConversationMessages(
  conversationId: string,
  onMessage: (message: Message) => void
): (() => void) | null {
  if (!supabase || !isNonEmptyString(conversationId)) {
    return null;
  }

  try {
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          try {
            const mapped = mapMessageRow(payload.new as MessagesRow);
            onMessage(mapped);
          } catch (err) {
            console.error("Error mapping realtime message:", err);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Chat] Subscribed to conversation ${conversationId}`);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          console.warn(
            `[Chat] Subscription to conversation ${conversationId} closed/error`
          );
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  } catch (err) {
    console.error("Error subscribing to conversation messages:", err);
    return null;
  }
}

/**
 * Subscribe to realtime conversation updates for a user (new messages, reorder)
 */
export function subscribeToUserConversations(
  userId: string,
  onChange: () => void
): (() => void) | null {
  if (!supabase || !isNonEmptyString(userId)) {
    return null;
  }

  try {
    const subscription = supabase
      .channel(`user-conversations:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `participant_1_id=eq.${userId}`,
        },
        () => onChange()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `participant_2_id=eq.${userId}`,
        },
        () => onChange()
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Chat] Subscribed to conversations for user ${userId}`);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  } catch (err) {
    console.error("Error subscribing to user conversations:", err);
    return null;
  }
}
