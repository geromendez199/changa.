import { ArrowLeft, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { jobCategories } from "../constants/catalog";
import { useAppState } from "../hooks/useAppState";

const totalSteps = 5;

export function PublishJob() {
  const navigate = useNavigate();
  const { addPublishedJob } = useAppState();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: "" as (typeof jobCategories)[number] | "",
    title: "",
    description: "",
    location: "",
    price: "",
    urgency: "normal" as "normal" | "urgente",
    availability: "",
    image: "",
  });

  const progressPct = Math.round((step / totalSteps) * 100);

  const validateCurrentStep = () => {
    const nextErrors: string[] = [];
    if (step === 1 && !form.category) nextErrors.push("Seleccioná una categoría.");
    if (step === 2) {
      if (form.title.trim().length < 8) nextErrors.push("El título debe tener al menos 8 caracteres.");
      if (form.description.trim().length < 20) nextErrors.push("La descripción debe tener al menos 20 caracteres.");
    }
    if (step === 3) {
      if (!form.location.trim()) nextErrors.push("Indicá una ubicación.");
      if (!form.price.trim() || Number(form.price) <= 0) nextErrors.push("Ingresá un precio válido.");
      if (!form.availability.trim()) nextErrors.push("Indicá disponibilidad.");
    }

    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return !!form.category;
      case 2:
        return form.title.trim().length >= 8 && form.description.trim().length >= 20;
      case 3:
        return !!form.location && Number(form.price) > 0 && !!form.availability;
      default:
        return true;
    }
  }, [form, step]);

  const onContinue = async () => {
    if (step < 4) {
      if (!validateCurrentStep()) return;
      setStep((prev) => prev + 1);
      return;
    }

    if (step === 4) {
      setPublishing(true);
      setSubmitError(null);
      const created = await addPublishedJob({
        category: form.category || "Otros",
        title: form.title,
        description: form.description,
        location: form.location,
        priceValue: Number(form.price),
        availability: form.availability,
        urgency: form.urgency,
        image: form.image,
      });
      setPublishing(false);
      if (!created) {
        setSubmitError("No pudimos publicar tu changa. Revisá tu sesión e intentá de nuevo.");
        return;
      }
      navigate(`/publish/confirm/${created.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 max-w-md mx-auto font-['Inter']">
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => (step === 1 ? navigate(-1) : setStep((prev) => prev - 1))} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-[#111827]" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#111827]">Publicá tu servicio</h1>
            <p className="text-sm text-gray-500 mt-0.5">Completá los datos en {totalSteps} pasos</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#10B981] transition-all" style={{ width: `${progressPct}%` }}></div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#10B981] font-semibold">Paso {step} de {totalSteps}</span>
            <span className="text-gray-500">{progressPct}% completado</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-6">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-[#111827] mb-2">¿Qué tipo de servicio ofrecés?</h2>
            <p className="text-gray-600 mb-4">Elegí la categoría que mejor describa tu changa</p>
            <div className="grid grid-cols-2 gap-3">
              {jobCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setForm((prev) => ({ ...prev, category }))}
                  className={`rounded-3xl p-5 border text-left transition-all ${form.category === category ? "border-[#10B981] shadow-lg" : "bg-white border-gray-100"}`}
                >
                  <p className="font-bold text-[#111827]">{category}</p>
                  {form.category === category && <p className="text-sm text-[#10B981] mt-1">Seleccionado</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#111827]">Contanos de tu trabajo</h2>
            <Input placeholder="Título del servicio" value={form.title} onChange={(value) => setForm((prev) => ({ ...prev, title: value }))} />
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción detallada"
              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-2xl py-3.5 px-4 min-h-36 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#111827]">Detalles y disponibilidad</h2>
            <Input placeholder="Ubicación (ej: Palermo, CABA)" value={form.location} onChange={(value) => setForm((prev) => ({ ...prev, location: value }))} />
            <Input placeholder="Precio estimado en ARS" type="number" value={form.price} onChange={(value) => setForm((prev) => ({ ...prev, price: value }))} />
            <Input placeholder="Disponibilidad (ej: Lunes a viernes 9-18)" value={form.availability} onChange={(value) => setForm((prev) => ({ ...prev, availability: value }))} />
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-sm font-semibold text-[#111827] mb-2">Urgencia</p>
              <div className="flex gap-2">
                {[
                  { label: "Normal", value: "normal" },
                  { label: "Urgente", value: "urgente" },
                ].map((item) => (
                  <button key={item.value} onClick={() => setForm((prev) => ({ ...prev, urgency: item.value as "normal" | "urgente" }))} className={`px-4 py-2 rounded-full text-sm ${form.urgency === item.value ? "bg-[#10B981] text-white" : "bg-[#F8FAFC] border border-gray-200"}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#111827]">Imagen (opcional)</h2>
            <Input placeholder="URL de imagen del trabajo" value={form.image} onChange={(value) => setForm((prev) => ({ ...prev, image: value }))} />
            <div className="bg-white rounded-3xl p-5 border border-gray-100">
              <h3 className="font-bold text-[#111827] mb-3">Confirmá tu publicación</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><strong>Categoría:</strong> {form.category}</li>
                <li><strong>Título:</strong> {form.title}</li>
                <li><strong>Ubicación:</strong> {form.location}</li>
                <li><strong>Precio:</strong> ${Number(form.price || 0).toLocaleString("es-AR")}</li>
                <li><strong>Disponibilidad:</strong> {form.availability}</li>
              </ul>
            </div>
          </div>
        )}

        {submitError && <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700">{submitError}</div>}

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            {errors.map((error) => (
              <p key={error} className="text-sm text-red-700">• {error}</p>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-6 py-5 max-w-md mx-auto shadow-2xl">
        <Button variant="primary" size="lg" fullWidth disabled={!canProceed || publishing} onClick={() => void onContinue()} icon={step === 4 ? <Check size={18} /> : undefined}>
          {step === 4 ? (publishing ? "Publicando..." : "Publicar changa") : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
