/**
 * WHY: Make notifications feel like a real activity center with clearer hierarchy, type cues, and calmer card treatment.
 * CHANGED: YYYY-MM-DD
 */
import { Bell } from "lucide-react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { Badge } from "../components/Badge";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { useAppState } from "../hooks/useAppState";
import { BrandLogo } from "../components/BrandLogo";
import { PreviewModeNotice } from "../components/PreviewModeNotice";
import { ScreenHeader } from "../components/ScreenHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { formatRelative } from "../utils/format";
import { getFallbackPreviewMessage, isLocalPreviewSource } from "../../services/service.utils";

export function Notifications() {
  const navigate = useNavigate();
  const { notifications, dataSource } = useAppState();
  const isPreview = isLocalPreviewSource(dataSource);

  return (
    <div className="app-screen pb-28">
      <ScreenHeader
        title="Notificaciones"
        subtitle="Alertas sobre tus changas, mensajes y movimientos importantes."
        action={
          <BrandLogo imageClassName="h-12 w-auto object-contain" fallbackClassName="text-lg font-bold" />
        }
      />

      <div className="space-y-3 px-6 py-6">
        {isPreview ? (
          <PreviewModeNotice
            description={`${getFallbackPreviewMessage("las notificaciones")} Este centro de actividad usa eventos de ejemplo para recorrer la experiencia.`}
          />
        ) : null}

        {notifications.map((item) => (
          <SurfaceCard key={item.id} padding="md">
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="font-semibold tracking-[-0.02em] text-[var(--app-text)]">{item.title}</p>
              <Badge
                variant={
                  item.type === "mensaje" ? "accent" : item.type === "pago" ? "info" : "published"
                }
                size="sm"
              >
                {item.type}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-[var(--app-text-muted)]">{item.description}</p>
            <p className="mt-3 text-xs font-medium text-[#8a9790]">{formatRelative(item.createdAt)}</p>
          </SurfaceCard>
        ))}

        {notifications.length === 0 && (
          <EmptyStateCard
            icon={<Bell size={28} />}
            eyebrow="Tu centro de novedades"
            title="Todavía no tenés notificaciones"
            description="Cuando haya respuestas, mensajes, movimientos o cambios importantes en tus changas, las vas a ver acá."
            note="Es el lugar para seguir todo lo relevante sin perder contexto."
            actionLabel="Explorar categorías"
            onAction={() => navigate("/search")}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
