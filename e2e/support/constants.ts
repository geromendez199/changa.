export const DEFAULT_BASE_URL = "https://changa-three.vercel.app";

export const ROUTES = {
  home: ["/home"],
  orders: ["/my-jobs"],
  provider: ["/my-jobs", "/publish"],
  profile: ["/profile"],
  profileEdit: ["/profile/edit"],
  login: ["/login"],
  register: ["/signup"],
} as const;

export const REQUESTED_SERVICE_CATEGORIES = [
  "Plomería",
  "Electricidad",
  "Pintura",
  "Carpintería",
  "Limpieza",
  "Jardinería",
  "Gasista",
  "Albañilería",
  "Otros",
] as const;

export const FALLBACK_CATEGORY_LABELS = [
  "Todos",
  "Hogar",
  "Construcción y Mantenimiento",
  "Oficios",
  "Delivery",
  "Tecnología",
  "Servicios Personales y Estética",
  "Otros",
] as const;

export const ORDER_STATUS_LABELS = ["Pendiente", "Confirmado", "Rechazado", "Enviada", "Aceptada"] as const;
