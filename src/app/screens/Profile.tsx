/**
 * WHY: Keep the profile screen cleaner and easier to scan by removing explanatory blocks and focusing on core user info.
 * CHANGED: YYYY-MM-DD
 */
import { BottomNav } from "../components/BottomNav";
import { Star, Briefcase, Shield, CreditCard, Settings, ChevronRight, TrendingUp, Bell, LogOut, Pencil } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../components/Badge";
import { useAppState, useCurrentUser } from "../hooks/useAppState";
import { useAuth } from "../../context/AuthContext";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { SectionHeader } from "../components/SectionHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { UserAvatar } from "../components/UserAvatar";

export function Profile() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { profiles, reviews, refreshProfile, isLoading, dataSource } = useAppState();
  const { signOut, userId: authUserId } = useAuth();
  const isPreview = dataSource === "fallback";

  useEffect(() => {
    if (currentUser?.id) void refreshProfile(currentUser.id);
  }, [currentUser?.id, refreshProfile]);

  if (!currentUser) return null;

  const profile = profiles.find((item) => item.id === currentUser.id) ?? currentUser;
  const myReviews = reviews.filter((review) => review.reviewedUserId === profile.id).slice(0, 2);

  return (
    <div className="app-screen pb-28">
      <div className="relative overflow-hidden rounded-b-[36px] bg-[linear-gradient(135deg,#0DAE79_0%,#0B9A6B_55%,#087A55_100%)] px-6 pt-14 pb-12">
        <div className="absolute right-10 top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-8 left-8 h-36 w-36 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <button onClick={() => navigate("/profile/edit")} className="rounded-full bg-white/12 p-2.5 backdrop-blur-sm transition-colors hover:bg-white/20">
              <Pencil size={20} className="text-white" />
            </button>
            <div className="w-10" />
            <button onClick={() => navigate("/notifications")} className="rounded-full bg-white/12 p-2.5 backdrop-blur-sm transition-colors hover:bg-white/20">
              <Bell size={20} className="text-white" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <UserAvatar
              name={profile.name}
              avatarUrl={profile.avatarUrl}
              fallbackLetter={profile.avatarLetter}
              size="xl"
              tone="surface"
              className="mb-4"
            />
            <h1 className="mb-1 text-2xl font-bold tracking-[-0.02em] text-white">{profile.name}</h1>
            <p className="text-white/80 text-sm">Miembro desde {profile.memberSince}</p>
            <div className="mt-4">
              {profile.verified ? (
                <Badge variant="verified" icon={<Shield size={12} />}>
                  Verificado
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-8 mb-6 px-6">
        <SurfaceCard className="shadow-[var(--app-shadow-lg)]" padding="lg">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <div className="rounded-xl bg-yellow-50 p-2">
                  <Star size={20} className="text-[#FBBF24]" />
                </div>
              </div>
              <p className="mb-0.5 text-2xl font-bold text-[var(--app-text)]">{profile.rating}</p>
              <p className="text-xs font-medium text-[var(--app-text-muted)]">Rating</p>
            </div>
            <div className="text-center border-x border-[var(--app-border)]">
              <div className="mb-2 flex items-center justify-center">
                <div className="rounded-xl bg-[var(--app-brand-soft)] p-2">
                  <Briefcase size={20} className="text-[var(--app-brand)]" />
                </div>
              </div>
              <p className="mb-0.5 text-2xl font-bold text-[var(--app-text)]">{profile.completedJobs}</p>
              <p className="text-xs font-medium text-[var(--app-text-muted)]">Completados</p>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <div className="rounded-xl bg-blue-50 p-2">
                  <TrendingUp size={20} className="text-blue-500" />
                </div>
              </div>
              <p className="mb-0.5 text-2xl font-bold text-[var(--app-text)]">{profile.successRate}%</p>
              <p className="text-xs font-medium text-[var(--app-text-muted)]">Éxito</p>
            </div>
          </div>
        </SurfaceCard>
      </div>

      {profile.trustIndicators.filter((indicator) => !indicator.toLowerCase().includes("email")).length > 0 ? (
        <div className="px-6 mb-6">
          <SurfaceCard padding="md">
            <div className="flex flex-wrap gap-2">
              {profile.trustIndicators
                .filter((indicator) => !indicator.toLowerCase().includes("email"))
                .map((indicator) => (
                <Badge key={indicator} variant="verified">
                  {indicator}
                </Badge>
              ))}
            </div>
          </SurfaceCard>
        </div>
      ) : null}

      <div className="px-6 space-y-3 mb-6">
        <button onClick={() => navigate("/payments")} className="app-surface flex w-full items-center gap-4 p-5 text-left transition-transform duration-200 hover:translate-y-[-2px]">
          <div className="rounded-2xl bg-[var(--app-brand-soft)] p-3">
            <CreditCard size={24} className="text-[var(--app-brand)]" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-base font-bold text-[var(--app-text)]">Pagos</h3>
            <p className="text-sm text-[var(--app-text-muted)]">Métodos y movimientos</p>
          </div>
          <ChevronRight size={20} className="text-[#9aa7a0]" />
        </button>
        <button onClick={() => navigate("/profile/edit")} className="app-surface flex w-full items-center gap-4 p-5 text-left transition-transform duration-200 hover:translate-y-[-2px]">
          <div className="rounded-2xl bg-[var(--app-surface-muted)] p-3">
            <Settings size={24} className="text-[var(--app-text-muted)]" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-base font-bold text-[var(--app-text)]">Configuración</h3>
            <p className="text-sm text-[var(--app-text-muted)]">Datos personales y privacidad</p>
          </div>
          <ChevronRight size={20} className="text-[#9aa7a0]" />
        </button>
      </div>

      <div className="px-6">
        <SectionHeader
          title="Reseñas"
          className="mb-4"
        />
        <div className="space-y-3">
          {myReviews.map((review) => {
            const reviewer = profiles.find((u) => u.id === review.reviewerUserId);
            return (
              <SurfaceCard key={review.id} padding="md">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={reviewer?.name}
                      avatarUrl={reviewer?.avatarUrl}
                      fallbackLetter={reviewer?.avatarLetter ?? "?"}
                      size="sm"
                      tone="brand"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-[var(--app-text)]">{reviewer?.name ?? "Usuario"}</h3>
                      <div className="mt-0.5 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? "text-[#FBBF24] fill-[#FBBF24]" : "text-gray-300"} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[var(--app-text-muted)]">{review.comment}</p>
              </SurfaceCard>
            );
          })}
        </div>
        {!isLoading && myReviews.length === 0 && (
          <EmptyStateCard
            icon={<Star size={28} />}
            title="Todavía no tenés reseñas"
            description="Tus reseñas van a aparecer acá."
            actionLabel="Completar perfil"
            onAction={() => navigate("/profile/edit")}
          />
        )}
      </div>

      <div className="mb-4 mt-8 px-6">
        <button
          onClick={async () => {
            if (isPreview && !authUserId) {
              navigate("/home");
              return;
            }

            await signOut();
            navigate("/login");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut size={18} />
          {isPreview && !authUserId ? "Salir de la vista previa" : "Cerrar sesión"}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
