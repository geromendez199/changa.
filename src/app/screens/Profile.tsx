import { BottomNav } from "../components/BottomNav";
import { Star, Briefcase, Shield, CreditCard, Settings, ChevronRight, Award, TrendingUp, Bell, LogOut, Pencil } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../components/Badge";
import { useAppState, useCurrentUser } from "../hooks/useAppState";
import { useAuth } from "../../context/AuthContext";
import { EmptyStateCard } from "../components/EmptyStateCard";

export function Profile() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { jobs, profiles, reviews, refreshProfile, isLoading } = useAppState();
  const { signOut } = useAuth();

  useEffect(() => {
    if (currentUser?.id) refreshProfile(currentUser.id);
  }, [currentUser?.id]);

  if (!currentUser) return null;

  const profile = profiles.find((item) => item.id === currentUser.id) ?? currentUser;
  const myReviews = reviews.filter((review) => review.reviewedUserId === profile.id).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto font-['Inter']">
      <div className="bg-gradient-to-br from-[#0DAE79] via-[#0B9A6B] to-[#087A55] px-6 pt-14 pb-24 rounded-b-[48px] relative overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate("/profile/edit")} className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"><Pencil size={20} className="text-white" /></button>
            <button onClick={() => navigate("/notifications")} className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"><Bell size={20} className="text-white" /></button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-[#0DAE79] font-bold text-3xl mb-4 shadow-2xl">{profile.avatarLetter}</div>
            <h1 className="text-2xl font-bold text-white mb-1">{profile.name}</h1>
            <p className="text-white/80 text-sm">Miembro desde {profile.memberSince}</p>
            <div className="mt-4">{profile.verified && <Badge variant="success" icon={<Shield size={12} />}>Verificado</Badge>}</div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-16 mb-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center"><div className="flex items-center justify-center mb-2"><div className="bg-yellow-50 p-2 rounded-xl"><Star size={20} className="text-[#FBBF24]" /></div></div><p className="text-2xl font-bold text-[#111827] mb-0.5">{profile.rating}</p><p className="text-xs text-gray-500 font-medium">Rating</p></div>
            <div className="text-center border-x border-gray-100"><div className="flex items-center justify-center mb-2"><div className="bg-green-50 p-2 rounded-xl"><Briefcase size={20} className="text-[#0DAE79]" /></div></div><p className="text-2xl font-bold text-[#111827] mb-0.5">{jobs.filter((job) => job.postedByUserId === profile.id).length}</p><p className="text-xs text-gray-500 font-medium">Publicados</p></div>
            <div className="text-center"><div className="flex items-center justify-center mb-2"><div className="bg-blue-50 p-2 rounded-xl"><TrendingUp size={20} className="text-blue-500" /></div></div><p className="text-2xl font-bold text-[#111827] mb-0.5">{profile.successRate}%</p><p className="text-xs text-gray-500 font-medium">Éxito</p></div>
          </div>
        </div>
      </div>

      <div className="px-6 mb-6"><div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-5 border border-blue-100 flex items-center gap-4"><div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-2xl shadow-lg"><Award size={24} className="text-white" /></div><div className="flex-1"><h3 className="font-bold text-[#111827] mb-0.5">Confianza de la comunidad</h3><p className="text-sm text-gray-600">{profile.trustIndicators.join(" • ")}</p></div></div></div>

      <div className="px-6 space-y-3 mb-6">
        <button onClick={() => navigate("/payments")} className="w-full bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4 border border-gray-100"><div className="bg-green-50 p-3 rounded-2xl"><CreditCard size={24} className="text-[#0DAE79]" /></div><div className="flex-1 text-left"><h3 className="font-bold text-[#111827] text-base">Pagos</h3><p className="text-sm text-gray-500">Métodos y movimientos</p></div><ChevronRight size={20} className="text-gray-400" /></button>
        <button onClick={() => navigate("/profile/edit")} className="w-full bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4 border border-gray-100"><div className="bg-gray-50 p-3 rounded-2xl"><Settings size={24} className="text-gray-600" /></div><div className="flex-1 text-left"><h3 className="font-bold text-[#111827] text-base">Configuración</h3><p className="text-sm text-gray-500">Datos personales y privacidad</p></div><ChevronRight size={20} className="text-gray-400" /></button>
      </div>

      <div className="px-6">
        <div className="flex items-center justify-between mb-4"><div><h2 className="font-bold text-[#111827] text-lg">Reseñas</h2><p className="text-sm text-gray-500">Últimas calificaciones</p></div></div>
        <div className="space-y-3">
          {myReviews.map((review) => {
            const reviewer = profiles.find((u) => u.id === review.reviewerUserId);
            return (
              <div key={review.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center text-white font-bold">{reviewer?.avatarLetter ?? "?"}</div><div><h3 className="font-bold text-[#111827] text-sm">{reviewer?.name ?? "Usuario"}</h3><div className="flex items-center gap-1 mt-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < review.rating ? "text-[#FBBF24] fill-[#FBBF24]" : "text-gray-300"} />)}</div></div></div></div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
              </div>
            );
          })}
        </div>
        {!isLoading && myReviews.length === 0 && (
          <EmptyStateCard
            icon={<Star size={28} />}
            title="Todavía no tenés reseñas"
            description="Completá tu perfil y empezá a publicar para recibir tus primeras calificaciones."
            actionLabel="Completar perfil"
            onAction={() => navigate("/profile/edit")}
          />
        )}
      </div>

      <div className="px-6 mt-8 mb-4"><button onClick={async () => { await signOut(); navigate("/login"); }} className="w-full text-red-600 font-semibold text-sm py-3 flex items-center justify-center gap-2 hover:bg-red-50 rounded-2xl transition-colors"><LogOut size={18} />Cerrar sesión</button></div>
      <BottomNav />
    </div>
  );
}
