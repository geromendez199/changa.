/**
 * WHY: Centralize user-input validation so client-side service calls fail fast with consistent messages.
 * CHANGED: YYYY-MM-DD
 */
import { z } from "zod";
import { ValidationError } from "./errors";

const jobCategories = [
  "Hogar",
  "Oficios",
  "Delivery",
  "Eventos",
  "Tecnología",
  "Construcción y Mantenimiento",
  "Mecánica y Transporte",
  "Servicios Personales y Estética",
  "Alimentación y Tradición",
  "Oficios Modernos y Digitales",
  "Control de Plagas",
  "Personal Trainer",
  "Otros",
] as const;
const jobUrgencies = ["normal", "urgente"] as const;
const jobSortValues = ["distance", "newest"] as const;
const listingTypes = ["request", "service"] as const;

const trimmedRequiredString = (message: string) =>
  z.string().trim().min(1, message);

export const authCredentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Ingresá un email válido."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export const profileUpdateSchema = z.object({
  fullName: trimmedRequiredString("Ingresá un nombre válido."),
  location: trimmedRequiredString("Ingresá una ubicación válida."),
  bio: z.string().trim().max(500, "La biografía es demasiado larga.").optional(),
  avatarUrl: z
    .union([z.string().trim().url("Ingresá una URL válida para la foto de perfil."), z.literal(""), z.null()])
    .optional(),
});

export const jobCreateSchema = z.object({
  postedByUserId: trimmedRequiredString("Necesitás iniciar sesión para publicar."),
  listingType: z.enum(listingTypes),
  title: z.string().trim().min(8, "El título debe tener al menos 8 caracteres."),
  description: z.string().trim().min(20, "La descripción debe tener al menos 20 caracteres."),
  category: z.enum(jobCategories),
  location: trimmedRequiredString("Ingresá una ubicación válida."),
  priceValue: z.number().finite().positive("Ingresá un precio válido."),
  availability: trimmedRequiredString("Ingresá una disponibilidad válida."),
  urgency: z.enum(jobUrgencies),
  image: z
    .union([z.string().trim().url("Ingresá una URL válida para la imagen."), z.literal("")])
    .optional(),
});

export const chatMessageSchema = z.object({
  conversationId: trimmedRequiredString("No pudimos enviar el mensaje. Intentá nuevamente."),
  senderUserId: trimmedRequiredString("No pudimos enviar el mensaje. Intentá nuevamente."),
  content: z
    .string()
    .trim()
    .min(1, "El mensaje no puede estar vacío.")
    .max(2000, "El mensaje es demasiado largo."),
});

export const applicationCreateSchema = z.object({
  jobId: trimmedRequiredString("No pudimos identificar la changa."),
  applicantUserId: trimmedRequiredString("Necesitás iniciar sesión para postularte."),
  coverMessage: z
    .string()
    .trim()
    .min(12, "Contá brevemente por qué sos una buena opción.")
    .max(1000, "El mensaje es demasiado largo."),
  proposedAmount: z.number().finite().positive("Ingresá un monto válido."),
});

export const applicationStatusSchema = z.object({
  applicationId: trimmedRequiredString("No pudimos identificar la postulación."),
  jobId: trimmedRequiredString("No pudimos identificar la changa."),
  ownerUserId: trimmedRequiredString("Necesitás iniciar sesión para gestionar postulantes."),
  applicantUserId: trimmedRequiredString("No pudimos identificar a la persona postulada."),
  status: z.enum(["aceptada", "rechazada"]),
});

export const jobSearchParamsSchema = z.object({
  query: z.string().trim().max(120, "La búsqueda es demasiado larga.").optional(),
  category: z.union([z.enum(jobCategories), z.literal("Todos")]).optional(),
  listingType: z.enum(listingTypes).optional(),
  onlyUrgent: z.boolean().optional(),
  sortBy: z.enum(jobSortValues).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export function parseWithValidation<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.issues[0]?.message || "Datos inválidos.");
  }

  return result.data;
}
