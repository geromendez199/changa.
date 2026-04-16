/**
 * WHY: Turn the home screen into a clearer startup-style entry point with role-aware messaging, trust cues, and better loading and empty states.
 * CHANGED: YYYY-MM-DD
 */
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Compass,
  MapPin,
  MessageSquareText,
  Search,
  ShieldCheck,
  WalletCards,
  Wrench,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { JobCard } from "../components/JobCard";
import { JobCardSkeleton } from "../components/JobCardSkeleton";
import { Input } from "../components/Input";
import { useAppState } from "../hooks/useAppState";
import { formatDistance, formatUrgencyLabel } from "../utils/format";
import { categoryFilters } from "../constants/catalog";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { BrandLogo } from "../components/BrandLogo";
import { ROLE_INTENT_DETAILS, useRoleIntent } from "../../hooks/useRoleIntent";

export function Home() {
  const navigate = useNavigate();
  const { roleIntent, roleIntentDetails, setRoleIntent } = useRoleIntent();
  const {
    jobs,
    isLoading,
    errorMessage,
    refreshJobs,
    selectedLocation,
    requestDeviceLocation,
    currentUserId,
  } = useAppState();

  useEffect(() => {
    void refreshJobs();
  }, [refreshJobs]);

  const activeRole = roleIntent ?? "help";
  const roleToggleItems = [
    { id: "help" as const, label: ROLE_INTENT_DETAILS.help.label, icon: Wrench },
    { id: "work" as const, label: ROLE_INTENT_DETAILS.work.label, icon: BriefcaseBusiness },
  ];
  const trustHighlights = [
    { label: "Perfiles con reputación", icon: ShieldCheck },
    { label: "Chat con contexto", icon: MessageSquareText },
    { label: "Pagos protegidos", icon: WalletCards },
  ] as const;
  const featuredJobs = jobs.slice(0, 3);
  const nearbyJobs = [...jobs].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);
  const shouldShowLoadingCards = isLoading && jobs.length === 0;

  const handlePrimaryIntentAction = () => {
    if (activeRole === "help") {
      navigate(currentUserId ? "/publish" : "/signup?role=help");
      return;
    }

    navigate(currentUserId ? "/profile/edit" : "/signup?role=work");
  };

  const handleSecondaryIntentAction = () => {
    if (activeRole === "help") {
      setRoleIntent("work");
      navigate("/search");
      return;
    }

    setRoleIntent("help");
    navigate(currentUserId ? "/publish" : "/signup?role=help");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto font-['Inter']">
      <div className="bg-white px-6 pt-14 pb-8 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <BrandLogo className="justify-start" imageClassName="h-16 w-auto object-contain" fallbackClassName="text-2xl font-bold tracking-tight text-[#111827]" />
            <button onClick={() => navigate(currentUserId ? "/notifications" : "/login")} className="p-3 bg-[#F8FAFC] rounded-full hover:bg-gray-100 transition-colors">
              <Bell size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <Input placeholder="Buscar changas, oficios o categorías" icon={<Search size={20} />} onChange={(value) => navigate(`/search?q=${encodeURIComponent(value)}`)} />

        <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
          <MapPin size={16} className="text-[#0DAE79]" />
          <span className="font-medium">{selectedLocation || "Ubicación pendiente"}</span>
        </div>
      </div>

      <div className="px-6 pt-6">
        <div className="rounded-[32px] border border-gray-100 bg-white p-5 shadow-[0_18px_40px_rgba(17,24,39,0.06)]">
          <div className="inline-flex rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#0DAE79]">
            Changa te conecta con tareas y oportunidades reales de tu zona
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {roleToggleItems.map((item) => {
              const isActive = activeRole === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setRoleIntent(item.id)}
                  className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                    isActive
                      ? "border-[#0DAE79] bg-[#F0FDF4] text-[#111827]"
                      : "border-gray-200 bg-[#F8FAFC] text-gray-600"
                  }`}
                >
                  <item.icon size={18} className={isActive ? "text-[#0DAE79]" : "text-gray-400"} />
                  <p className="mt-2 text-sm font-semibold">{item.label}</p>
                </button>
              );
            })}
          </div>

          <h1 className="mt-5 text-2xl font-black leading-tight text-[#111827]">
            {roleIntentDetails.homeTitle}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {roleIntentDetails.homeDescription}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {trustHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-100 bg-[#F8FAFC] px-3 py-3 text-center"
              >
                <item.icon size={18} className="mx-auto mb-2 text-[#0DAE79]" />
                <p className="text-[11px] font-semibold leading-tight text-[#111827]">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            <button
              onClick={handlePrimaryIntentAction}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0DAE79] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#0DAE79]/20 transition-all duration-200 active:scale-[0.98]"
            >
              {activeRole === "help"
                ? "Publicar una changa"
                : currentUserId
                  ? "Completar mi perfil"
                  : "Crear cuenta para trabajar"}
              <ArrowRight size={16} />
            </button>
            <button
              onClick={handleSecondaryIntentAction}
              className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition-colors hover:bg-gray-50"
            >
              {activeRole === "help" ? "Quiero encontrar changas" : "Necesito ayuda con una tarea"}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {categoryFilters.map((cat, idx) => (
            <button key={cat} onClick={() => navigate(`/search?category=${encodeURIComponent(cat)}`)} className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all duration-200 ${idx === 0 ? "bg-[#0DAE79] text-white shadow-lg shadow-[#0DAE79]/25" : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"}`}>
              <span className="font-semibold text-sm">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="mx-6 mb-4 rounded-3xl border border-amber-100 bg-[#FFFDF7] p-4 text-sm text-gray-600">
          <p className="font-semibold text-[#111827]">No pudimos actualizar las changas ahora mismo.</p>
          <p className="mt-1">{errorMessage || "Intentá nuevamente en unos segundos."}</p>
          <button onClick={() => void refreshJobs()} className="text-[#0DAE79] font-semibold mt-3">
            Reintentar
          </button>
        </div>
      )}

      {(featuredJobs.length > 0 || shouldShowLoadingCards) && (
        <div className="mb-8">
          <div className="px-6 mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#111827] text-lg mb-1">Destacadas para hoy</h2>
              <p className="text-sm text-gray-500">
                Pedidos activos con buena visibilidad y contexto claro.
              </p>
            </div>
            <button onClick={() => navigate("/search")} className="text-[#0DAE79] text-sm font-semibold hover:underline">
              Ver todas
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-6 scrollbar-hide -mx-6">
            <div className="w-4 flex-shrink-0" />
            {shouldShowLoadingCards
              ? Array.from({ length: 3 }).map((_, index) => (
                  <JobCardSkeleton key={`featured-skeleton-${index}`} featured />
                ))
              : featuredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    image={job.image}
                    title={job.title}
                    category={job.category}
                    price={job.priceLabel}
                    rating={job.rating}
                    distance={formatDistance(job.distanceKm)}
                    urgency={formatUrgencyLabel(job.urgency)}
                    featured
                  />
                ))}
            <div className="w-4 flex-shrink-0" />
          </div>
        </div>
      )}

      <div className="px-6">
        <div className="mb-5">
          <h2 className="font-bold text-[#111827] text-lg mb-1">Cerca de tu zona</h2>
          <p className="text-sm text-gray-500">
            {isLoading
              ? "Buscando oportunidades cercanas..."
              : jobs.length > 0
                ? `${jobs.length} changas activas para explorar`
                : "Todavía no hay changas publicadas en esta zona"}
          </p>
        </div>

        {shouldShowLoadingCards ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <JobCardSkeleton key={`nearby-skeleton-${index}`} />
            ))}
          </div>
        ) : nearbyJobs.length > 0 ? (
          <div className="space-y-3">
            {nearbyJobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                image={job.image}
                title={job.title}
                description={job.description}
                category={job.category}
                price={job.priceLabel}
                rating={job.rating}
                distance={formatDistance(job.distanceKm)}
                urgency={formatUrgencyLabel(job.urgency)}
              />
            ))}
          </div>
        ) : (
          !isLoading && (
            <EmptyStateCard
              icon={<Compass size={28} />}
              eyebrow="Todavía no hay movimiento cerca"
              title="Tu zona todavía no tiene changas visibles"
              description="Podés publicar lo que necesitás o activar tu ubicación para priorizar resultados cercanos apenas aparezcan."
              note="Mientras tanto, también podés explorar categorías para descubrir oportunidades en otras zonas."
              actionLabel={activeRole === "help" ? "Publicar una changa" : "Explorar categorías"}
              onAction={() =>
                navigate(
                  activeRole === "help"
                    ? currentUserId
                      ? "/publish"
                      : "/login?redirect=%2Fpublish"
                    : "/search",
                )
              }
              secondaryActionLabel="Activar ubicación"
              onSecondaryAction={requestDeviceLocation}
            />
          )
        )}
      </div>

      <BottomNav />
    </div>
  );
}
