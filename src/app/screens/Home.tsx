import { Search, MapPin, Bell } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { JobCard } from "../components/JobCard";
import { Input } from "../components/Input";
import { useAppState, useCurrentUser } from "../hooks/useAppState";
import { formatDistance, formatUrgencyLabel } from "../utils/format";
import { categoryFilters } from "../data/mockData";

export function Home() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { jobs, isLoading, errorMessage, refreshJobs } = useAppState();

  useEffect(() => {
    refreshJobs();
  }, []);

  const featuredJobs = jobs.slice(0, 3);
  const nearbyJobs = [...jobs].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto font-['Inter']">
      <div className="bg-white px-6 pt-14 pb-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">Bienvenido de nuevo</p>
            <h1 className="text-2xl font-bold text-[#111827]">Hola, {currentUser.name.split(" ")[0]} 👋</h1>
          </div>
          <button className="relative p-3 bg-[#F8FAFC] rounded-full hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-600" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-[#10B981] rounded-full border-2 border-white"></div>
          </button>
        </div>

        <Input
          placeholder="Buscar servicios..."
          icon={<Search size={20} />}
          onChange={(value) => navigate(`/search?q=${encodeURIComponent(value)}`)}
        />

        <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
          <MapPin size={16} className="text-[#10B981]" />
          <span className="font-medium">{currentUser.location}</span>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {categoryFilters.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => navigate(`/search?category=${encodeURIComponent(cat)}`)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all duration-200 ${
                idx === 0
                  ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/25"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="font-semibold text-sm">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="mx-6 mb-4 bg-white rounded-3xl border border-gray-100 p-4 text-sm text-gray-500">
          No pudimos conectar con Supabase. Mostramos datos de respaldo.
        </div>
      )}

      <div className="mb-8">
        <div className="px-6 mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#111827] text-lg mb-1">Destacados</h2>
            <p className="text-sm text-gray-500">Los mejores cerca tuyo</p>
          </div>
          <button onClick={() => navigate("/search")} className="text-[#10B981] text-sm font-semibold hover:underline">Ver todos</button>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 scrollbar-hide -mx-6">
          <div className="w-4 flex-shrink-0"></div>
          {featuredJobs.map((job) => (
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
          <div className="w-4 flex-shrink-0"></div>
        </div>
      </div>

      <div className="px-6">
        <div className="mb-5">
          <h2 className="font-bold text-[#111827] text-lg mb-1">Cerca de vos</h2>
          <p className="text-sm text-gray-500">{isLoading ? "Cargando..." : `${jobs.length} trabajos disponibles`}</p>
        </div>
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

        {!isLoading && nearbyJobs.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 text-center mt-4">
            <p className="font-semibold text-[#111827] mb-1">Todavía no hay changas publicadas</p>
            <p className="text-sm text-gray-500">Volvé en unos minutos o publicá la primera.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
