import { supabase } from "../lib/supabase";
import { Notification } from "../types/domain";
import { NotificationsRow, mapNotificationRow } from "../types/supabase";
import { failureResult, isNonEmptyString, normalizeError, ServiceResult, shouldUseFallback, successResult, toSafeArray } from "./service.utils";

export async function getMyNotifications(userId: string): Promise<ServiceResult<Notification[]>> {
  if (!isNonEmptyString(userId)) return successResult([], "fallback");
  if (shouldUseFallback()) return successResult([], "fallback");

  try {
    const { data, error } = await supabase!
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw error;

    return successResult(
      toSafeArray<Partial<NotificationsRow>>(data)
        .map(mapNotificationRow)
        .filter((notification) => isNonEmptyString(notification.id)),
    );
  } catch (error) {
    return failureResult([], normalizeError(error, "No pudimos cargar tus notificaciones."));
  }
}
