import { ArrowLeft, MapPin, SlidersHorizontal, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { JobCard } from "../components/JobCard";
import { Input } from "../components/Input";
import { categoryFilters } from "../constants/catalog";
import { useAppState } from "../hooks/useAppState";
import { formatDistance, formatUrgencyLabel } from "../utils/format";
import { EmptyStateCard } from "../components/EmptyStateCard";

const sortingOptions = [
  { label: "Distancia", value: "distance" },
  { label: "Más recientes", value: "newest" },
] as const;

export function SearchResults() {
  const navigate = useNavigate();
  const { jobs, refreshJobs, errorMessage, isLoading, selectedLocation } = useAppState();
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "Todos");
  const [sortBy, setSortBy] = useState<"distance" | "newest">("distance");
  const [showFilters, setShowFilters] = useState(false);
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  useEffect(() => {
    refreshJobs({ query, category, onlyUrgent, sortBy });
  }, [category, onlyUrgent, query, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto font-['Inter']">
      <div className="bg-white px-6 pt-14 pb-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/home")} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={24} className="text-[#111827]" /></button>
          <div className="flex-1">
            <Input placeholder="Buscar servicios..." value={query} onChange={(value) => { setQuery(value); setParams((prev) => { const next = new URLSearchParams(prev); next.set("q", value); return next; }); }} />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1 text-sm"><MapPin size={16} className="text-[#10B981]" /><span className="font-medium text-gray-700">{selectedLocation}</span></div>
          <button onClick={() => setShowFilters((s) => !s)} className="flex items-center gap-2 bg-[#F8FAFC] px-4 py-2.5 rounded-full text-sm font-semibold text-[#111827] border border-gray-200 hover:bg-gray-50 transition-colors"><SlidersHorizontal size={16} /> Filtros</button>
        </div>

        {showFilters && (
          <div className="bg-[#F8FAFC] border border-gray-200 rounded-2xl p-3 mb-4 space-y-2 text-sm">
            <label className="flex items-center justify-between"><span>Solo urgentes</span><input type="checkbox" checked={onlyUrgent} onChange={(e) => setOnlyUrgent(e.target.checked)} /></label>
            <label className="flex items-center justify-between gap-3"><span>Ordenar por</span><select value={sortBy} onChange={(e) => setSortBy(e.target.value as "distance" | "newest")} className="bg-white border border-gray-200 rounded-xl px-3 py-1.5">{sortingOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></label>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-6 px-6">
          {categoryFilters.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${category === cat ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/25" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5"><h2 className="font-bold text-[#111827] text-lg">{isLoading ? "Buscando..." : `${jobs.length} resultados`}</h2></div>

      {errorMessage && <div className="mx-6 bg-white rounded-3xl border border-gray-100 p-4 text-sm text-gray-500 mb-4">{errorMessage}</div>}

      <div className="px-6 space-y-3 pb-4">
        {jobs.map((job) => (
          <JobCard key={job.id} id={job.id} image={job.image} title={job.title} description={job.description} category={job.category} price={job.priceLabel} rating={job.rating} distance={formatDistance(job.distanceKm)} urgency={formatUrgencyLabel(job.urgency)} />
        ))}
      </div>

      {jobs.length === 0 && !isLoading && (
        <div className="mx-6">
          <EmptyStateCard
            icon={<SearchX size={28} />}
            title="No encontramos changas"
            description="Probá con otra categoría o publicá la primera changa en tu zona."
            actionLabel="Publicar changa"
            onAction={() => navigate("/publish")}
            secondaryActionLabel="Limpiar búsqueda"
            onSecondaryAction={() => {
              setQuery("");
              setCategory("Todos");
              setOnlyUrgent(false);
            }}
          />
        </div>
      )}

      <BottomNav />
    </div>
  );
}
