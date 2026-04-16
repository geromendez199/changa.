/**
 * WHY: Isolate conversation and message state so chat behavior can evolve independently from other app concerns.
 * CHANGED: YYYY-MM-DD
 */
import { useCallback, useState } from "react";
import {
  getConversationList,
  getConversationMessages,
  sendChatMessage,
} from "../services/chat.service";
import { successResult } from "../services/service.utils";
import { Conversation, Message } from "../types/domain";

interface UseChatStateOptions {
  userId: string | null;
  pushError: (message?: string) => void;
}

interface SendMessageResult {
  ok: boolean;
  message?: string;
}

export function useChatState({ userId, pushError }: UseChatStateOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const loadConversationList = useCallback(async () => {
    if (!userId) {
      setConversations([]);
      return successResult<Conversation[]>([], "fallback");
    }

    const result = await getConversationList(userId);
    setConversations(result.data);
    pushError(result.error);
    return result;
  }, [pushError, userId]);

  const refreshChatDetail = useCallback(
    async (conversationId: string) => {
      const result = await getConversationMessages(conversationId);
      setMessages((prev) => {
        const withoutConversation = prev.filter(
          (message) => message.conversationId !== conversationId,
        );
        return [...withoutConversation, ...result.data];
      });
      pushError(result.error);
    },
    [pushError],
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      if (!userId) {
        const message = "Necesitás iniciar sesión para enviar mensajes.";
        pushError(message);
        return { ok: false, message } satisfies SendMessageResult;
      }

      const result = await sendChatMessage({
        conversationId,
        senderUserId: userId,
        content,
      });
      if (!result.data) {
        const message = result.error ?? "No pudimos enviar tu mensaje.";
        pushError(message);
        return { ok: false, message } satisfies SendMessageResult;
      }

      setMessages((prev) => [...prev, result.data!]);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, lastMessageAt: result.data!.createdAt }
            : conversation,
        ),
      );

      return { ok: true } satisfies SendMessageResult;
    },
    [pushError, userId],
  );

  const resetChatState = useCallback(() => {
    setConversations([]);
    setMessages([]);
  }, []);

  return {
    conversations,
    messages,
    loadConversationList,
    refreshChatDetail,
    sendMessage,
    resetChatState,
  };
}
