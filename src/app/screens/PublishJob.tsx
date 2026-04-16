/**
 * WHY: Reframe publishing as posting a local task request, with clearer Spanish copy, correct step count, and polished confirmations.
 * CHANGED: YYYY-MM-DD
 */
import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { PreviewModeNotice } from "../components/PreviewModeNotice";
import { ScreenHeader } from "../components/ScreenHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { Textarea } from "../components/Textarea";
import { jobCategories } from "../constants/catalog";
import { useAppState } from "../hooks/useAppState";
import { getFallbackPreviewMessage } from "../../services/service.utils";

const totalSteps = 4;

export function PublishJob() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addPublishedJob, updatePublishedJob, myJobs, dataSource } = useAppState();
  const isPreview = dataSource === "fallback";
  const editingJobId = searchParams.get("edit");
  const jobToEdit = editingJobId ? myJobs.find((job) => job.id === editingJobId) ?? null : null;
  const isEditing = Boolean(jobToEdit);

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

  useEffect(() => {
    if (!jobToEdit) return;

    setForm({
      category: jobToEdit.category,
      title: jobToEdit.title,
      description: jobToEdit.description,
      location: jobToEdit.location,
      price: String(jobToEdit.priceValue),
      urgency: jobToEdit.urgency,
      availability: jobToEdit.availability,
      image: jobToEdit.image,
    });
  }, [jobToEdit]);

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
    if (step < totalSteps) {
      if (!validateCurrentStep()) return;
      setStep((prev) => prev + 1);
      return;
    }

    if (step === totalSteps) {
      setPublishing(true);
      setSubmitError(null);
      const payload = {
        category: form.category || "Otros",
        title: form.title,
        description: form.description,
        location: form.location,
        priceValue: Number(form.price),
        availability: form.availability,
        urgency: form.urgency,
        image: form.image,
      };

      if (isEditing && jobToEdit) {
        const result = await updatePublishedJob(jobToEdit.id, payload);
        setPublishing(false);

        if (!result.ok || !result.job) {
          const message = result.message || "No pudimos guardar los cambios de tu changa.";
          setSubmitError(message);
          toast.error("No pudimos guardar los cambios", {
            description: message,
          });
          return;
        }

        toast.success("Cambios guardados", {
          description: "Tu publicación ya quedó actualizada.",
        });
        navigate("/my-jobs");
        return;
      }

      const created = await addPublishedJob(payload);
      setPublishing(false);
      if (!created) {
        const message = "No pudimos publicar tu changa. Revisá tu sesión e intentá de nuevo.";
        setSubmitError(message);
        toast.error("No pudimos publicar tu changa", {
          description: "Revisá los datos y probá nuevamente.",
        });
        return;
      }
      toast.success("Tu changa ya está publicada", {
        description: "Ahora las personas de tu zona la pueden ver y responder.",
      });
      navigate(`/publish/confirm/${created.id}`);
    }
  };

  return (
    <div className="app-screen pb-32">
      <ScreenHeader
        title={isEditing ? "Editar changa" : "Publicá una changa"}
        subtitle={
          isEditing
            ? "Ajustá los datos para que siga clara y fácil de responder."
            : "Contá qué necesitás resolver y dejalo visible en minutos."
        }
        onBack={() => (step === 1 ? navigate(-1) : setStep((prev) => prev - 1))}
      >
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-[#dce6e0]">
            <div
              className="h-full rounded-full bg-[var(--app-brand)] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--app-brand)]">
              Paso {step} de {totalSteps}
            </span>
            <span className="text-[var(--app-text-muted)]">{progressPct}% completado</span>
          </div>
        </div>
      </ScreenHeader>

      <div className="space-y-6 px-6 py-8">
        {isPreview ? (
          <PreviewModeNotice
            description={`${getFallbackPreviewMessage("este formulario de publicación")} Podés recorrer los pasos, pero la publicación real necesita Supabase.`}
          />
        ) : null}

        {step === 1 && (
          <SurfaceCard padding="lg">
            <h2 className="mb-2 text-2xl font-bold tracking-[-0.02em] text-[var(--app-text)]">
              ¿Qué tipo de ayuda necesitás?
            </h2>
            <p className="mb-4 text-[var(--app-text-muted)]">
              Elegí la categoría que mejor describa la tarea que querés resolver.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {jobCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setForm((prev) => ({ ...prev, category }))}
                  className={`rounded-[24px] border p-5 text-left transition-all ${
                    form.category === category
                      ? "border-[var(--app-brand)] bg-[var(--app-brand-soft)] shadow-[0_12px_28px_rgba(13,174,121,0.12)]"
                      : "border-[var(--app-border)] bg-[var(--app-surface-muted)]"
                  }`}
                >
                  <p className="font-bold text-[var(--app-text)]">{category}</p>
                  {form.category === category ? (
                    <p className="mt-1 text-sm text-[var(--app-brand)]">Seleccionado</p>
                  ) : null}
                </button>
              ))}
            </div>
          </SurfaceCard>
        )}

        {step === 2 && (
          <SurfaceCard padding="lg" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-[var(--app-text)]">
              Contanos qué necesitás
            </h2>
            <p className="text-[var(--app-text-muted)]">
              Un buen título y una descripción clara te ayudan a recibir respuestas más útiles.
            </p>
            <Input
              placeholder="Ej: Arreglar una pérdida en la cocina"
              value={form.title}
              onChange={(value) => setForm((prev) => ({ ...prev, title: value }))}
              size="lg"
            />
            <Textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Explicá qué necesitás, si hay urgencia, materiales o algún detalle importante."
            />
          </SurfaceCard>
        )}

        {step === 3 && (
          <SurfaceCard padding="lg" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-[var(--app-text)]">
              Ubicación, presupuesto y tiempos
            </h2>
            <p className="text-[var(--app-text-muted)]">
              Mientras más claro seas con la zona, el presupuesto y el momento ideal, mejores respuestas vas a recibir.
            </p>
            <Input placeholder="Ubicación (ej: Rafaela, Santa Fe)" value={form.location} onChange={(value) => setForm((prev) => ({ ...prev, location: value }))} size="lg" />
            <Input placeholder="Presupuesto estimado en ARS" type="number" value={form.price} onChange={(value) => setForm((prev) => ({ ...prev, price: value }))} size="lg" />
            <Input placeholder="¿Cuándo lo necesitás? (ej: mañana por la tarde)" value={form.availability} onChange={(value) => setForm((prev) => ({ ...prev, availability: value }))} size="lg" />
            <SurfaceCard tone="muted" padding="sm">
              <p className="mb-2 text-sm font-semibold text-[var(--app-text)]">Urgencia</p>
              <div className="flex gap-2">
                {[
                  { label: "Normal", value: "normal" },
                  { label: "Urgente", value: "urgente" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        urgency: item.value as "normal" | "urgente",
                      }))
                    }
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      form.urgency === item.value
                        ? "bg-[var(--app-brand)] text-white"
                        : "border border-[var(--app-border)] bg-white text-[var(--app-text-muted)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </SurfaceCard>
          </SurfaceCard>
        )}

        {step === 4 && (
          <SurfaceCard padding="lg" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-[var(--app-text)]">
              Confirmá tu publicación
            </h2>
            <p className="text-[var(--app-text-muted)]">
              Podés sumar una foto para dar más contexto. Si no tenés una, igual podés publicar.
            </p>
            <Input placeholder="URL de imagen opcional" value={form.image} onChange={(value) => setForm((prev) => ({ ...prev, image: value }))} size="lg" />
            <SurfaceCard tone="muted" padding="md">
              <h3 className="mb-3 font-bold text-[var(--app-text)]">Así se va a ver tu changa</h3>
              <ul className="space-y-2 text-sm text-[var(--app-text-muted)]">
                <li><strong>Categoría:</strong> {form.category}</li>
                <li><strong>Título:</strong> {form.title}</li>
                <li><strong>Ubicación:</strong> {form.location}</li>
                <li><strong>Presupuesto:</strong> ${Number(form.price || 0).toLocaleString("es-AR")}</li>
                <li><strong>Cuándo lo necesitás:</strong> {form.availability}</li>
              </ul>
              <div className="mt-4 rounded-[18px] border border-[var(--app-border)] bg-white p-3 text-sm text-[var(--app-text-muted)]">
                Las personas van a ver tu descripción, la zona general y el presupuesto para responderte con más claridad.
              </div>
            </SurfaceCard>
          </SurfaceCard>
        )}

        {submitError ? (
          <div className="rounded-[20px] border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        {errors.length > 0 && (
          <div className="rounded-[20px] border border-red-100 bg-red-50 p-4">
            {errors.map((error) => (
              <p key={error} className="text-sm text-red-700">• {error}</p>
            ))}
          </div>
        )}
      </div>

      <div className="app-floating-bar fixed bottom-0 left-0 right-0">
        <div className="app-content-shell px-6 py-5 lg:px-10">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canProceed || publishing || (isPreview && step === totalSteps)}
            onClick={() => void onContinue()}
            icon={step === totalSteps ? <Check size={18} /> : undefined}
          >
            {step === totalSteps
              ? isPreview
                ? isEditing
                  ? "Guardar cambios con Supabase"
                  : "Publicación real con Supabase"
                : publishing
                  ? isEditing
                    ? "Guardando..."
                    : "Publicando..."
                  : isEditing
                    ? "Guardar cambios"
                    : "Publicar changa"
              : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
