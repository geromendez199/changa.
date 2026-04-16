/**
 * WHY: Keep the home screen simple and focused on finding changas fast without extra explanatory blocks.
 * CHANGED: YYYY-MM-DD
 */
import { Bell, Compass, MapPin, Search } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { BrandLogo } from "../components/BrandLogo";
import { Input } from "../components/Input";
import { JobCard } from "../components/JobCard";
import { JobCardSkeleton } from "../components/JobCardSkeleton";
import { SectionHeader } from "../components/SectionHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { primaryCategoryFilters } from "../constants/catalog";
import { useAppState } from "../hooks/useAppState";
import { formatDistance, formatUrgencyLabel } from "../utils/format";

export function Home() {
  const navigate = useNavigate();
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

  const featuredJobs = jobs.slice(0, 3);
  const nearbyJobs = [...jobs].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);
  const shouldShowLoadingCards = isLoading && jobs.length === 0;

  return (
    <div className="app-screen pb-28">
      <div className="app-header-shell pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <BrandLogo
              className="justify-start"
              imageClassName="h-16 w-auto object-contain"
              fallbackClassName="text-2xl font-bold tracking-tight text-[var(--app-text)]"
            />
            <button
              onClick={() => navigate(currentUserId ? "/notifications" : "/login")}
              className="app-icon-button"
              aria-label="Abrir notificaciones"
            >
              <Bell size={20} className="text-[var(--app-text-muted)]" />
            </button>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
            <Input
              placeholder="Buscar changas, oficios o categorías"
              icon={<Search size={20} />}
              size="lg"
              onChange={(value) => navigate(`/search?q=${encodeURIComponent(value)}`)}
            />

            <SurfaceCard tone="muted" padding="sm" className="xl:mt-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
                  <MapPin size={16} className="text-[var(--app-brand)]" />
                  <span className="font-semibold text-[var(--app-text)]">
                    {selectedLocation || "Ubicación pendiente"}
                  </span>
                </div>
                <button
                  onClick={requestDeviceLocation}
                  className="text-xs font-semibold text-[var(--app-brand)]"
                >
                  Actualizar
                </button>
              </div>
            </SurfaceCard>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {primaryCategoryFilters.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => navigate(`/search?category=${encodeURIComponent(cat)}`)}
              className={`flex items-center gap-2 rounded-full px-5 py-3 whitespace-nowrap transition-all duration-200 ${
                idx === 0
                  ? "bg-[var(--app-brand)] text-white shadow-[0_16px_30px_rgba(13,174,121,0.2)]"
                  : "border border-[var(--app-border)] bg-white text-[var(--app-text)]"
              }`}
            >
              <span className="font-semibold text-sm">{cat}</span>
            </button>
          ))}
          <button
            onClick={() => navigate("/search")}
            className="border border-[var(--app-border)] bg-white text-[var(--app-text-muted)] flex items-center gap-2 rounded-full px-5 py-3 whitespace-nowrap transition-all duration-200"
          >
            <span className="font-semibold text-sm">Ver más</span>
          </button>
        </div>
      </div>

      {errorMessage ? (
        <SurfaceCard
          tone="soft"
          padding="sm"
          className="mx-auto mb-4 max-w-6xl border-amber-100 bg-[#FFFDF7] text-sm text-[var(--app-text-muted)] shadow-none"
        >
          <p className="font-semibold text-[var(--app-text)]">No pudimos actualizar las changas.</p>
          <button onClick={() => void refreshJobs()} className="mt-2 font-semibold text-[var(--app-brand)]">
            Reintentar
          </button>
        </SurfaceCard>
      ) : null}

      {(featuredJobs.length > 0 || shouldShowLoadingCards) && (
        <div className="mb-8">
          <div className="mx-auto mb-5 max-w-6xl px-4 sm:px-6">
            <SectionHeader
              title="Destacadas"
              actionLabel="Ver todas"
              onAction={() => navigate("/search")}
            />
          </div>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide xl:grid xl:grid-cols-3 xl:overflow-visible">
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
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-5">
          <SectionHeader
            title="Cerca tuyo"
            subtitle={
              isLoading
                ? "Cargando changas..."
                : jobs.length > 0
                  ? `${jobs.length} changas`
                  : "No hay changas por ahora"
            }
          />
        </div>

        {shouldShowLoadingCards ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <JobCardSkeleton key={`nearby-skeleton-${index}`} />
            ))}
          </div>
        ) : nearbyJobs.length > 0 ? (
          <div className="grid gap-3 xl:grid-cols-2">
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
              title="Todavía no hay changas"
              description="Volvé a intentar en un rato o activá tu ubicación."
              actionLabel="Activar ubicación"
              onAction={requestDeviceLocation}
            />
          )
        )}
      </div>

      <BottomNav />
    </div>
  );
}
