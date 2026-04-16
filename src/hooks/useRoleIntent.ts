/**
 * WHY: Persist a lightweight role intent so onboarding, auth, and home copy can adapt to people who need help or want work.
 * CHANGED: YYYY-MM-DD
 */
import { useCallback, useEffect, useState } from "react";

export type RoleIntent = "help" | "work";

const ROLE_INTENT_STORAGE_KEY = "changa-role-intent";

export const ROLE_INTENT_DETAILS = {
  help: {
    id: "help" as const,
    label: "Necesito ayuda",
    shortLabel: "Pedir ayuda",
    heroTitle: "Publicá lo que necesitás y resolvelo con gente de tu zona.",
    heroDescription:
      "Encontrá personas confiables para tareas del hogar, arreglos, entregas u oficios sin perder tiempo.",
    authDescription:
      "Entrá para publicar tareas, revisar propuestas y coordinar cada paso con claridad.",
    homeTitle: "Resolvé tareas cotidianas con personas confiables cerca tuyo",
    homeDescription:
      "Publicá una changa en minutos, recibí respuestas y elegí con más contexto y confianza.",
    primaryActionLabel: "Publicar una changa",
    secondaryActionLabel: "Explorar perfiles y oportunidades",
  },
  work: {
    id: "work" as const,
    label: "Quiero trabajar",
    shortLabel: "Encontrar changas",
    heroTitle: "Encontrá changas reales y hacé crecer tu reputación local.",
    heroDescription:
      "Descubrí oportunidades cerca tuyo, respondé rápido y construí confianza con cada trabajo completado.",
    authDescription:
      "Entrá para postularte a changas, responder mensajes y mostrar un perfil que genere confianza.",
    homeTitle: "Encontrá oportunidades cerca tuyo y armá una reputación sólida",
    homeDescription:
      "Explorá changas activas, respondé con claridad y destacate con un perfil prolijo y confiable.",
    primaryActionLabel: "Explorar changas",
    secondaryActionLabel: "Completar mi perfil",
  },
} as const;

function isRoleIntent(value: unknown): value is RoleIntent {
  return value === "help" || value === "work";
}

function readStoredRoleIntent(): RoleIntent | null {
  if (typeof window === "undefined") return null;

  const storedValue = window.localStorage.getItem(ROLE_INTENT_STORAGE_KEY);
  return isRoleIntent(storedValue) ? storedValue : null;
}

export function useRoleIntent() {
  const [roleIntent, setRoleIntentState] = useState<RoleIntent | null>(() => readStoredRoleIntent());

  useEffect(() => {
    setRoleIntentState(readStoredRoleIntent());
  }, []);

  const setRoleIntent = useCallback((nextRoleIntent: RoleIntent) => {
    setRoleIntentState(nextRoleIntent);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(ROLE_INTENT_STORAGE_KEY, nextRoleIntent);
    }
  }, []);

  return {
    roleIntent,
    setRoleIntent,
    roleIntentDetails: ROLE_INTENT_DETAILS[roleIntent ?? "help"],
  };
}
