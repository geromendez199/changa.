import { Bell } from "lucide-react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { useAppState } from "../hooks/useAppState";
import { BrandLogo } from "../components/BrandLogo";

export function Notifications() {
  const navigate = useNavigate();
  const { notifications } = useAppState();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto font-['Inter']">
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <div className="flex items-center justify-between mb-2"><h1 className="text-2xl font-bold text-[#111827]">Notificaciones</h1><BrandLogo imageClassName="h-12 w-auto object-contain" fallbackClassName="text-lg font-bold" /></div>
        <p className="text-sm text-gray-500">Alertas sobre tus changas y mensajes</p>
      </div>

      <div className="px-6 py-6 space-y-3">
        {notifications.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-gray-100 p-4">
            <p className="font-semibold text-[#111827]">{item.title}</p>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
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
