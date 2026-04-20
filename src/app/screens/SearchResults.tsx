/**
 * WHY: Improve search clarity with stronger marketplace copy, steadier loading states, and more useful empty-state guidance.
 * CHANGED: YYYY-MM-DD
 */
import { MapPin, SlidersHorizontal, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/Button";
import { JobCard } from "../components/JobCard";
import { JobCardSkeleton } from "../components/JobCardSkeleton";
import { Input } from "../components/Input";
import { categoryFilters, primaryCategoryFilters } from "../constants/catalog";
import { useAppState } from "../hooks/useAppState";
import { formatDistance, formatUrgencyLabel } from "../utils/format";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { PreviewModeNotice } from "../components/PreviewModeNotice";
import { ScreenHeader } from "../components/ScreenHeader";
import { SectionHeader } from "../components/SectionHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { getFallbackPreviewMessage } from "../../services/service.utils";
import type { Job } from "../../types/domain";

const sortingOptions = [
  { label: "Distancia", value: "distance" },
  { label: "Más recientes", value: "newest" },
] as const;

export function SearchResults() {
  const navigate = useNavigate();
  const { jobs, refreshJobs, errorMessage, isLoading, selectedLocation, dataSource } = useAppState();
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "Todos");
  const [listingType, setListingType] = useState<Job["listingType"] | "all">(
    (params.get("listingType") as Job["listingType"] | null) ?? "all",
  );
  const [sortBy, setSortBy] = useState<"distance" | "newest">("distance");
  const [showFilters, setShowFilters] = useState(false);
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const shouldShowLoadingCards = isLoading && jobs.length === 0;
  const isPreview = dataSource === "fallback";

  useEffect(() => {
    void refreshJobs({ query, category, listingType: listingType === "all" ? undefined : listingType, onlyUrgent, sortBy });
  }, [category, listingType, onlyUrgent, query, refreshJobs, sortBy]);

  return (
    <div className="app-screen pb-28">
      <ScreenHeader
        title="Explorar marketplace"
        subtitle={
          selectedLocation
            ? `Resultados priorizados para ${selectedLocation}.`
            : "Buscá pedidos, servicios, urgencia o cercanía."
        }
        onBack={() => navigate("/home")}
        sticky
      >
        <Input
          placeholder="Buscar changas, servicios u oficios"
          value={query}
          size="lg"
          onChange={(value) => {
            setQuery(value);
            setParams((prev) => {
              const next = new URLSearchParams(prev);
              if (value.trim()) next.set("q", value);
              else next.delete("q");
              return next;
            });
          }}
        />

        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {([
            ["all", "Todo"],
            ["request", "Pedidos"],
            ["service", "Servicios"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setListingType(value);
                setParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (value === "all") next.delete("listingType");
                  else next.set("listingType", value);
                  return next;
                });
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                listingType === value
                  ? "bg-[var(--app-brand)] text-white shadow-[0_14px_28px_rgba(13,174,121,0.18)]"
                  : "border border-[var(--app-border)] bg-white text-[var(--app-text-muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 text-sm text-[var(--app-text-muted)]">
            <MapPin size={16} className="text-[var(--app-brand)]" />
            <span className="font-semibold text-[var(--app-text)]">{selectedLocation}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters((s) => !s)}
            icon={<SlidersHorizontal size={16} />}
          >
            Filtros
          </Button>
        </div>

        {showFilters ? (
          <SurfaceCard tone="muted" padding="sm" className="mt-4 space-y-3">
            <label className="flex items-center justify-between text-sm text-[var(--app-text)]">
              <span className="font-medium">Solo urgentes</span>
              <input
                type="checkbox"
                checked={onlyUrgent}
                onChange={(e) => setOnlyUrgent(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm text-[var(--app-text)]">
              <span className="font-medium">Ordenar por</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "distance" | "newest")}
                className="app-field min-h-11 rounded-[16px] bg-white px-3 py-2 text-sm"
              >
                {sortingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--app-text)]">Todas las categorías</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categoryFilters
                  .filter((item) => item !== "Todos")
                  .map((item) => (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={`rounded-[16px] border px-3 py-2 text-left text-sm font-semibold transition-all ${
                        category === item
                          ? "border-[var(--app-brand)] bg-[var(--app-brand-soft)] text-[var(--app-brand)]"
                          : "border-[var(--app-border)] bg-white text-[var(--app-text-muted)]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
              </div>
            </div>
          </SurfaceCard>
        ) : null}

        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide -mx-6 px-6">
          {primaryCategoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-[var(--app-brand)] text-white shadow-[0_14px_28px_rgba(13,174,121,0.18)]"
                  : "border border-[var(--app-border)] bg-white text-[var(--app-text-muted)]"
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setShowFilters(true)}
            className="rounded-full border border-[var(--app-border)] bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-[var(--app-text-muted)] transition-all"
          >
            Ver más
          </button>
        </div>
      </ScreenHeader>

      {isPreview ? (
        <div className="px-6 pt-4">
          <PreviewModeNotice description={getFallbackPreviewMessage("los resultados de búsqueda")} />
        </div>
      ) : null}

      <div className="px-6 py-5">
        <SectionHeader
          title={isLoading ? "Buscando changas..." : `${jobs.length} resultados`}
          subtitle="Mostramos primero lo que tiene mejor cercanía y contexto."
        />
      </div>

      {errorMessage ? (
        <SurfaceCard className="mx-6 mb-4 text-sm text-[var(--app-text-muted)]" padding="sm">
          {errorMessage}
        </SurfaceCard>
      ) : null}

      <div className="px-6 space-y-3 pb-4">
        {shouldShowLoadingCards
          ? Array.from({ length: 4 }).map((_, index) => (
              <JobCardSkeleton key={`search-skeleton-${index}`} />
            ))
          : jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                listingType={job.listingType}
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

      {jobs.length === 0 && !isLoading && (
        <div className="mx-6">
          <EmptyStateCard
            icon={<SearchX size={28} />}
            eyebrow="Sin coincidencias por ahora"
            title="No encontramos publicaciones con esos filtros"
            description={
              isPreview
                ? "Probá con otra categoría o limpiá la búsqueda para seguir recorriendo la vista previa local."
                : "Probá con otra categoría, cambiá entre pedidos y servicios o publicá lo que necesitás/ofrecés."
            }
            note={
              isPreview
                ? "Esta vista previa usa datos de muestra pensados para recorrer filtros, cards y detalle."
                : "Los resultados cambian rápido cuando entran nuevas publicaciones y respuestas cercanas."
            }
            actionLabel={isPreview ? "Volver al inicio" : "Publicar"}
            onAction={() => navigate(isPreview ? "/home" : "/publish")}
            secondaryActionLabel="Limpiar búsqueda"
            onSecondaryAction={() => {
              setQuery("");
              setCategory("Todos");
              setListingType("all");
              setOnlyUrgent(false);
              setParams(new URLSearchParams());
            }}
          />
        </div>
      )}

      <BottomNav />
    </div>
  );
}
