/**
 * WHY: Give Changa a clearer first impression with role selection, stronger product positioning, and trust-building startup copy.
 * CHANGED: YYYY-MM-DD
 */
import {
  ArrowRight,
  BriefcaseBusiness,
  MessageSquareText,
  ShieldCheck,
  WalletCards,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router";
import { BrandLogo } from "../components/BrandLogo";
import { ROLE_INTENT_DETAILS, type RoleIntent, useRoleIntent } from "../../hooks/useRoleIntent";

const trustHighlights = [
  { label: "Perfiles con reputación", icon: ShieldCheck },
  { label: "Chat con contexto", icon: MessageSquareText },
  { label: "Pagos protegidos", icon: WalletCards },
] as const;

const roleCards = [
  {
    role: "help" as const,
    icon: Wrench,
    title: ROLE_INTENT_DETAILS.help.label,
    description: "Publicá una tarea, compará perfiles y elegí con más confianza.",
  },
  {
    role: "work" as const,
    icon: BriefcaseBusiness,
    title: ROLE_INTENT_DETAILS.work.label,
    description: "Encontrá changas cerca tuyo y hacé crecer tu reputación con cada trabajo.",
  },
] as const;

export function Welcome() {
  const navigate = useNavigate();
  const { roleIntent, setRoleIntent, roleIntentDetails } = useRoleIntent();

  const activeRole = roleIntent ?? "help";

  const handleRoleSelection = (nextRole: RoleIntent) => {
    setRoleIntent(nextRole);
  };

  return (
    <div className="relative mx-auto min-h-screen max-w-md overflow-hidden bg-gradient-to-br from-[#0DAE79] via-[#0B9A6B] to-[#087A55] px-6 py-8 font-['Inter']">
      <div className="absolute right-0 top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-28 left-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col">
        <div className="pt-4 text-center">
          <div className="inline-flex min-h-28 min-w-72 items-center justify-center rounded-[2rem] border border-white/80 bg-white px-8 py-5 shadow-[0_18px_40px_rgba(8,122,85,0.18)]">
            <BrandLogo
              imageClassName="h-20 w-auto object-contain"
              fallbackClassName="text-4xl font-bold tracking-tight text-[#0DAE79]"
              alt="Changa"
            />
          </div>

          <div className="mt-6">
            <span className="inline-flex rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
              Marketplace local para resolver tareas y encontrar changas reales
            </span>
            <h1 className="mt-4 text-4xl font-black leading-tight text-white">
              Encontrá ayuda confiable o conseguí trabajo en minutos.
            </h1>
            <p className="mt-3 text-base leading-relaxed text-white/82">
              Publicá lo que necesitás, descubrí oportunidades cerca tuyo y coordiná todo con
              contexto, confianza y una experiencia pensada para el día a día.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {roleCards.map((card) => {
            const isActive = activeRole === card.role;

            return (
              <button
                key={card.role}
                onClick={() => handleRoleSelection(card.role)}
                className={`w-full rounded-[28px] border p-4 text-left transition-all duration-200 ${
                  isActive
                    ? "border-white bg-white text-[#111827] shadow-[0_22px_48px_rgba(17,24,39,0.16)]"
                    : "border-white/25 bg-white/10 text-white backdrop-blur-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      isActive ? "bg-[#ECFDF5] text-[#0DAE79]" : "bg-white/10 text-white"
                    }`}
                  >
                    <card.icon size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-base font-bold">{card.title}</h2>
                      {isActive && (
                        <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#0DAE79]">
                          Recomendado
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 text-sm leading-relaxed ${
                        isActive ? "text-gray-500" : "text-white/78"
                      }`}
                    >
                      {card.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-[28px] border border-white/15 bg-white/10 p-5 text-white backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            Hoy querés usar Changa para
          </p>
          <h2 className="mt-2 text-xl font-bold">{roleIntentDetails.label}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/82">
            {roleIntentDetails.heroDescription}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {trustHighlights.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center text-white backdrop-blur-sm"
            >
              <item.icon size={18} className="mx-auto mb-2" />
              <p className="text-[11px] font-semibold leading-tight text-white/90">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] border border-white/15 bg-white/10 p-5 text-white backdrop-blur-sm">
          <p className="text-sm font-semibold">Empezá en segundos</p>
          <div className="mt-3 space-y-2 text-sm text-white/85">
            <p>1. Elegí cómo querés usar Changa hoy.</p>
            <p>2. Creá tu cuenta y completá lo básico.</p>
            <p>3. Publicá una changa o encontrá oportunidades cerca tuyo.</p>
          </div>
        </div>

        <div className="mt-auto space-y-3 pt-8">
          <button
            onClick={() => navigate(`/signup?role=${activeRole}`)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-base font-bold text-[#0B8A61] shadow-[0_18px_40px_rgba(17,24,39,0.16)] transition-all duration-200 active:scale-[0.98]"
          >
            {activeRole === "help"
              ? "Crear cuenta para pedir ayuda"
              : "Crear cuenta para encontrar changas"}
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => navigate(`/login?role=${activeRole}`)}
            className="w-full rounded-full border-2 border-white/80 bg-white/10 px-6 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 active:scale-[0.98]"
          >
            Ya tengo cuenta
          </button>

          <button
            onClick={() => navigate("/home")}
            className="w-full rounded-full px-4 py-2 text-sm font-semibold text-white/82 transition-colors hover:text-white"
          >
            Explorar primero
          </button>
        </div>
      </div>
    </div>
  );
}
