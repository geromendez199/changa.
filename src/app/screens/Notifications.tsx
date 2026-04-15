import { Bell } from "lucide-react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { useAppState } from "../hooks/useAppState";

export function Notifications() {
  const navigate = useNavigate();
  const { notifications } = useAppState();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto font-['Inter']">
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#111827] mb-1">Notificaciones</h1>
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
            title="Todavía no tenés notificaciones"
            description="Cuando tengas novedades sobre postulaciones, mensajes o pagos las vas a ver acá."
            actionLabel="Explorar categorías"
            onAction={() => navigate("/search")}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
