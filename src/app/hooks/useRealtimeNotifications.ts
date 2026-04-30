import { useEffect, useCallback } from 'react';
import { notifyNewMessage, notifyJobUpdate, logEvent } from '@/lib/edge-functions';

interface NotificationConfig {
  onNewMessage?: (conversationId: string, senderName: string, preview: string) => void;
  onJobUpdate?: (jobId: string, jobTitle: string, update: string) => void;
}

export function useRealtimeNotifications(userId: string | undefined, config: NotificationConfig = {}) {
  const { onNewMessage, onJobUpdate } = config;

  const triggerMessageNotification = useCallback(
    async (conversationId: string, senderName: string, preview: string) => {
      try {
        await notifyNewMessage(userId || '', senderName, preview, conversationId);
        onNewMessage?.(conversationId, senderName, preview);
        await logEvent({
          eventType: 'notification_sent',
          severity: 'info',
          message: 'Message notification sent',
          userId,
          metadata: { conversationId, senderName },
        });
      } catch (error) {
        console.error('Failed to send message notification:', error);
      }
    },
    [userId, onNewMessage]
  );

  const triggerJobUpdateNotification = useCallback(
    async (jobId: string, jobTitle: string, update: string) => {
      try {
        await notifyJobUpdate(userId || '', jobTitle, update, jobId);
        onJobUpdate?.(jobId, jobTitle, update);
        await logEvent({
          eventType: 'notification_sent',
          severity: 'info',
          message: 'Job update notification sent',
          userId,
          metadata: { jobId, jobTitle },
        });
      } catch (error) {
        console.error('Failed to send job update notification:', error);
      }
    },
    [userId, onJobUpdate]
  );

  return {
    triggerMessageNotification,
    triggerJobUpdateNotification,
  };
}
