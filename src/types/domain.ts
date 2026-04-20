/**
 * WHY: Keep a single canonical source of shared domain types after removing duplicate app-level shims.
 * CHANGED: YYYY-MM-DD
 */
// Canonical domain model definitions for the SPA and service layer.
export type UUID = string;

export type JobCategory =
  | "Hogar"
  | "Oficios"
  | "Delivery"
  | "Eventos"
  | "Tecnología"
  | "Construcción y Mantenimiento"
  | "Mecánica y Transporte"
  | "Servicios Personales y Estética"
  | "Alimentación y Tradición"
  | "Oficios Modernos y Digitales"
  | "Control de Plagas"
  | "Personal Trainer"
  | "Otros";

export type JobUrgency = "normal" | "urgente";
export type ListingType = "request" | "service";

export type JobStatus =
  | "publicado"
  | "postulado"
  | "en_progreso"
  | "programado"
  | "pendiente"
  | "completado"
  | "cancelado";

export interface Profile {
  id: UUID;
  name: string;
  fullName?: string;
  avatarLetter: string;
  avatarUrl?: string;
  location: string;
  memberSince: string;
  verified: boolean;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  successRate: number;
  bio?: string;
  trustIndicators: string[];
  createdAt: string;
}

export interface Job {
  id: UUID;
  listingType: ListingType;
  title: string;
  description: string;
  category: JobCategory;
  priceLabel: string;
  priceValue: number;
  rating: number;
  distanceKm: number;
  location: string;
  availability: string;
  urgency: JobUrgency;
  image: string;
  postedByUserId: UUID;
  postedAt: string;
  status: JobStatus;
}

export interface Application {
  id: UUID;
  jobId: UUID;
  applicantUserId: UUID;
  coverMessage: string;
  proposedAmount: number;
  createdAt: string;
  status: "enviada" | "aceptada" | "rechazada";
}

export interface Conversation {
  id: UUID;
  participantIds: [UUID, UUID];
  jobId: UUID;
  lastMessageAt: string;
}

export interface Message {
  id: UUID;
  conversationId: UUID;
  senderUserId: UUID;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Review {
  id: UUID;
  reviewerUserId: UUID;
  reviewedUserId: UUID;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: UUID;
  userId: UUID;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  type: "mensaje" | "trabajo" | "pago";
}

export type PaymentType = "Visa" | "Mastercard" | "Mercado Pago";

export interface PaymentMethod {
  id: UUID;
  userId?: UUID;
  type: PaymentType;
  last4: string;
  expiry: string;
  holderName: string;
  isDefault: boolean;
  colorClass: string;
  createdAt?: string;
}

export interface Transaction {
  id: UUID;
  userId?: UUID;
  jobId: UUID;
  amount: number;
  amountLabel: string;
  createdAt: string;
  status: "pagado" | "pendiente" | "reintegrado";
}

export type User = Profile;
export type AppNotification = Notification;
