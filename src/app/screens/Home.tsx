import { Search, MapPin, Bell, LocateFixed, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { JobCard } from "../components/JobCard";
import { Input } from "../components/Input";
import { useAppState } from "../hooks/useAppState";
import { formatDistance, formatUrgencyLabel } from "../utils/format";
import { categoryFilters } from "../constants/catalog";
import { EmptyStateCard } from "../components/EmptyStateCard";

export function Home() {
  const navigate = useNavigate();
  const {
    jobs,
    isLoading,
    errorMessage,
    refreshJobs,
    selectedLocation,
    locationStatus,
    locationError,
    requestDeviceLocation,
    setManualLocation,
    currentUserId,
  } = useAppState();
  const [manualLocation, setManualLocationText] = useState("");

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
            <p className="text-sm text-gray-500 mb-1">Bienvenido</p>
            <h1 className="text-2xl font-bold text-[#111827]">Hola{currentUserId ? " 👋" : ""}</h1>
          </div>
          <button onClick={() => navigate(currentUserId ? "/notifications" : "/login")} className="relative p-3 bg-[#F8FAFC] rounded-full hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-600" />
          </button>
        </div>

        <Input placeholder="Buscar servicios..." icon={<Search size={20} />} onChange={(value) => navigate(`/search?q=${encodeURIComponent(value)}`)} />

        <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
          <MapPin size={16} className="text-[#0DAE79]" />
          <span className="font-medium">{selectedLocation || "Ubicación pendiente"}</span>
        </div>
      </div>

      {(locationStatus !== "granted" || !selectedLocation || selectedLocation === "Ubicación pendiente") && (
        <div className="px-6 pt-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-4">
            <p className="text-sm font-semibold text-[#111827] mb-1">Ubicación actual</p>
            <p className="text-sm text-gray-500 mb-3">Activá ubicación para mejorar resultados cercanos o cargá una zona manualmente.</p>
            <div className="flex gap-2 mb-2">
              <button onClick={requestDeviceLocation} className="flex-1 bg-[#0DAE79] text-white rounded-full py-2 text-sm font-semibold flex items-center justify-center gap-2">
                <LocateFixed size={14} /> Activar ubicación
              </button>
              <button onClick={() => navigate("/search")} className="px-4 bg-[#F8FAFC] border border-gray-200 rounded-full text-sm font-semibold text-[#111827]">Explorar</button>
            </div>
            <div className="flex gap-2">
              <input value={manualLocation} onChange={(e) => setManualLocationText(e.target.value)} placeholder="Ej: Palermo, CABA" className="flex-1 bg-[#F8FAFC] border border-gray-200 rounded-2xl px-3 py-2 text-sm" />
              <button onClick={() => manualLocation.trim() && setManualLocation(manualLocation.trim())} className="px-4 bg-white border border-gray-200 rounded-2xl text-sm">Guardar</button>
            </div>
            {(locationError || locationStatus === "denied") && <p className="text-xs text-amber-600 mt-2">{locationError || "Permiso denegado. Podés usar ubicación manual."}</p>}
          </div>
        </div>
      )}

      <div className="px-6 py-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {categoryFilters.map((cat, idx) => (
            <button key={cat} onClick={() => navigate(`/search?category=${encodeURIComponent(cat)}`)} className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all duration-200 ${idx === 0 ? "bg-[#0DAE79] text-white shadow-lg shadow-[#0DAE79]/25" : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"}`}>
              <span className="font-semibold text-sm">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {errorMessage && <div className="mx-6 mb-4 bg-white rounded-3xl border border-gray-100 p-4 text-sm text-gray-500">{errorMessage}</div>}

      {featuredJobs.length > 0 && (
        <div className="mb-8">
          <div className="px-6 mb-5 flex items-center justify-between">
            <div><h2 className="font-bold text-[#111827] text-lg mb-1">Destacados</h2><p className="text-sm text-gray-500">Los mejores cerca tuyo</p></div>
            <button onClick={() => navigate("/search")} className="text-[#0DAE79] text-sm font-semibold hover:underline">Ver todos</button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-6 scrollbar-hide -mx-6"><div className="w-4 flex-shrink-0"></div>{featuredJobs.map((job) => <JobCard key={job.id} id={job.id} image={job.image} title={job.title} category={job.category} price={job.priceLabel} rating={job.rating} distance={formatDistance(job.distanceKm)} urgency={formatUrgencyLabel(job.urgency)} featured />)}<div className="w-4 flex-shrink-0"></div></div>
        </div>
      )}

      <div className="px-6">
        <div className="mb-5">
          <h2 className="font-bold text-[#111827] text-lg mb-1">Cerca de vos</h2>
          <p className="text-sm text-gray-500">{isLoading ? "Cargando..." : `${jobs.length} trabajos disponibles`}</p>
        </div>

        {nearbyJobs.length > 0 ? (
          <div className="space-y-3">{nearbyJobs.map((job) => <JobCard key={job.id} id={job.id} image={job.image} title={job.title} description={job.description} category={job.category} price={job.priceLabel} rating={job.rating} distance={formatDistance(job.distanceKm)} urgency={formatUrgencyLabel(job.urgency)} />)}</div>
        ) : (
          !isLoading && (
            <EmptyStateCard
              icon={<Compass size={28} />}
              title="No hay trabajos cerca por ahora"
              description="Publicá una changa o activá ubicación para recibir resultados en tu zona."
              actionLabel="Publicar changa"
              onAction={() => navigate(currentUserId ? "/publish" : "/login?redirect=%2Fpublish")}
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
