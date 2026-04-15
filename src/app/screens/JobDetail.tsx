import { ArrowLeft, MapPin, Calendar, Star, Heart, Shield, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { useAppState } from "../hooks/useAppState";
import { formatDistance, formatUrgencyLabel } from "../utils/format";

export function JobDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { loadJobById, profiles } = useAppState();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      const data = await loadJobById(id);
      setJob(data);
      setIsLoading(false);
    }

    load();
  }, [id]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#F8FAFC] px-6 pt-20 max-w-md mx-auto font-['Inter'] text-gray-500">Cargando trabajo...</div>;
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-6 pt-20 max-w-md mx-auto font-['Inter']">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-[#111827]" />
        </button>
        <div className="bg-white rounded-3xl border border-gray-100 p-8 mt-8 text-center">
          <h1 className="text-xl font-bold text-[#111827] mb-2">Trabajo no encontrado</h1>
          <p className="text-sm text-gray-500 mb-6">Esta changa no existe o fue eliminada.</p>
          <Button onClick={() => navigate("/search")} fullWidth>Ver otras changas</Button>
        </div>
      </div>
    );
  }

  const publisher = profiles.find((user) => user.id === job.postedByUserId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 max-w-md mx-auto font-['Inter']">
      <div className="relative">
        <img src={job.image} alt={job.title} className="w-full h-[320px] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>

        <button onClick={() => navigate(-1)} className="absolute top-14 left-6 bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:bg-white transition-colors">
          <ArrowLeft size={20} className="text-[#111827]" />
        </button>

        <button className="absolute top-14 right-6 bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:bg-white transition-colors">
          <Heart size={20} className="text-[#111827]" />
        </button>

        <div className="absolute bottom-6 left-6 flex gap-2">
          <Badge variant="default">{job.category}</Badge>
          {job.urgency === "urgente" && <Badge variant="error">{formatUrgencyLabel(job.urgency)}</Badge>}
        </div>
      </div>

      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-3 leading-tight">{job.title}</h1>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1"><MapPin size={16} className="text-[#0DAE79]" /><span className="text-xs font-medium">Ubicación</span></div>
            <p className="font-semibold text-[#111827] text-sm">{job.location}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatDistance(job.distanceKm)} de distancia</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1"><Calendar size={16} className="text-[#0DAE79]" /><span className="text-xs font-medium">Disponibilidad</span></div>
            <p className="font-semibold text-[#111827] text-sm">{job.availability}</p>
            <p className="text-xs text-gray-500 mt-0.5">Horario flexible</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0DAE79] to-[#0B9A6B] rounded-3xl p-6 mb-6 shadow-xl shadow-[#0DAE79]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Presupuesto</p>
              <p className="text-3xl font-bold text-white">{job.priceLabel}</p>
              <p className="text-white/70 text-xs mt-1">Pago al finalizar</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3"><Shield size={32} className="text-white" /></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 mb-6 border border-gray-100">
          <h2 className="font-bold text-[#111827] mb-3 flex items-center gap-2"><div className="w-1 h-5 bg-[#0DAE79] rounded-full"></div>Descripción</h2>
          <p className="text-gray-600 leading-relaxed">{job.description}</p>
        </div>

        {publisher && (
          <div className="bg-white rounded-3xl p-5 border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-4 font-semibold">Publicado por</p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0DAE79] to-[#0B9A6B] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">{publisher.avatarLetter}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-[#111827]">{publisher.name}</h3>
                  {publisher.verified && <Badge variant="success" icon={<Shield size={10} />}>Verificado</Badge>}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1"><Star size={14} className="text-[#FBBF24] fill-[#FBBF24]" /><span className="font-semibold text-gray-700">{publisher.rating}</span><span className="text-gray-500">({publisher.totalReviews})</span></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-600">{publisher.completedJobs} trabajos</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-blue-50 rounded-2xl p-3 text-center border border-blue-100"><Shield size={20} className="text-blue-600 mx-auto mb-1" /><p className="text-xs font-semibold text-blue-700">Pago seguro</p></div>
          <div className="bg-green-50 rounded-2xl p-3 text-center border border-green-100"><Clock size={20} className="text-green-600 mx-auto mb-1" /><p className="text-xs font-semibold text-green-700">Garantía</p></div>
          <div className="bg-purple-50 rounded-2xl p-3 text-center border border-purple-100"><Star size={20} className="text-purple-600 mx-auto mb-1" /><p className="text-xs font-semibold text-purple-700">Confianza</p></div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-6 py-5 max-w-md mx-auto shadow-2xl">
        <div className="flex items-center gap-3">
          <button className="p-3 bg-[#F8FAFC] rounded-full border border-gray-200 hover:bg-gray-100 transition-colors flex-shrink-0"><Heart size={20} className="text-gray-600" /></button>
          <Button variant="primary" size="lg" fullWidth>Me postulo</Button>
        </div>
      </div>
    </div>
  );
}
