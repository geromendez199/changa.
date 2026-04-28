import { useEffect, useState } from "react";
import { Conversation, Message } from "../types/domain";
import {
  getConversationList,
  getConversationMessages,
  subscribeToConversationMessages,
  subscribeToUserConversations,
} from "../services/chat.service";

export function useChatState(userId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial conversations
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadConversations = async () => {
      setIsLoading(true);
      const result = await getConversationList(userId);
      if (result.success) {
        setConversations(result.data || []);
      }
      setIsLoading(false);
    };

    loadConversations();

    // Subscribe to user's conversations
    const unsubscribe = subscribeToUserConversations(userId, loadConversations);
    return () => unsubscribe?.();
  }, [userId]);

  return { conversations, isLoading };
}

export function useConversationMessages(
  conversationId: string | null,
  userId: string | null
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!conversationId || !userId) {
      setIsLoading(false);
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);
      const result = await getConversationMessages(conversationId);
      if (result.success) {
        setMessages(result.data || []);
      }
      setIsLoading(false);
    };

    loadMessages();

    // Subscribe to new messages
    const unsubscribe = subscribeToConversationMessages(
      conversationId,
      (newMessage) => {
        // Avoid duplicates: check if message already in state
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === newMessage.id);
          return exists ? prev : [...prev, newMessage];
        });
      }
    );

    return () => unsubscribe?.();
  }, [conversationId, userId]);

  return { messages, isLoading };
}
