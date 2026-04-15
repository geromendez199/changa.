import { Application, Conversation, Job, Message, Notification, PaymentMethod, Profile, Review, Transaction } from "./domain";
import { isNonEmptyString, toSafeArray, toSafeNumber } from "../services/service.utils";

export interface ProfilesRow {
  id: string;
  full_name: string;
  avatar_letter: string;
  location: string;
  member_since: string;
  verified: boolean;
  rating: number;
  total_reviews: number;
  completed_jobs: number;
  success_rate: number;
  bio: string | null;
  trust_indicators: string[];
  created_at: string;
}

export interface JobsRow {
  id: string;
  posted_by_user_id: string;
  title: string;
  description: string;
  category: Job["category"];
  price_value: number;
  rating: number;
  distance_km: number;
  location: string;
  availability: string;
  urgency: Job["urgency"];
  image: string;
  posted_at: string;
  status: Job["status"];
  created_at: string;
}

export interface ApplicationsRow {
  id: string;
  job_id: string;
  applicant_user_id: string;
  cover_message: string;
  proposed_amount: number;
  status: Application["status"];
  created_at: string;
}

export interface ConversationsRow {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  job_id: string;
  last_message_at: string;
  created_at: string;
}

export interface MessagesRow {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ReviewsRow {
  id: string;
  reviewer_user_id: string;
  reviewed_user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface NotificationsRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_read: boolean;
  type: Notification["type"];
  created_at: string;
}

export interface PaymentMethodsRow {
  id: string;
  user_id: string;
  type: PaymentMethod["type"];
  last4: string;
  expiry: string;
  holder_name: string;
  is_default: boolean;
  color_class: string;
  created_at: string;
}

export interface TransactionsRow {
  id: string;
  user_id: string;
  job_id: string;
  amount: number;
  status: Transaction["status"];
  created_at: string;
}

const safeDate = (value: unknown) => (isNonEmptyString(value) ? value : new Date().toISOString());

export const mapProfileRow = (row: Partial<ProfilesRow>): Profile => {
  const fullName = isNonEmptyString(row.full_name) ? row.full_name : "Usuario";
  const avatarLetter = isNonEmptyString(row.avatar_letter)
    ? row.avatar_letter
    : fullName.charAt(0).toUpperCase() || "U";

  return {
    id: isNonEmptyString(row.id) ? row.id : "",
    name: fullName,
    fullName,
    avatarLetter,
    location: isNonEmptyString(row.location) ? row.location : "Ubicación pendiente",
    memberSince: isNonEmptyString(row.member_since) ? row.member_since : "Reciente",
    verified: Boolean(row.verified),
    rating: Number(toSafeNumber(row.rating, 0).toFixed(1)),
    totalReviews: Math.max(0, Math.round(toSafeNumber(row.total_reviews, 0))),
    completedJobs: Math.max(0, Math.round(toSafeNumber(row.completed_jobs, 0))),
    successRate: Math.min(100, Math.max(0, Math.round(toSafeNumber(row.success_rate, 0)))),
    bio: isNonEmptyString(row.bio) ? row.bio : undefined,
    trustIndicators: toSafeArray<string>(row.trust_indicators).filter(isNonEmptyString),
    createdAt: safeDate(row.created_at),
  };
};

export const mapJobRow = (row: Partial<JobsRow>): Job => {
  const priceValue = Math.max(0, Math.round(toSafeNumber(row.price_value, 0)));
  const distanceKm = Math.max(0, toSafeNumber(row.distance_km, 0));

  return {
    id: isNonEmptyString(row.id) ? row.id : "",
    postedByUserId: isNonEmptyString(row.posted_by_user_id) ? row.posted_by_user_id : "",
    title: isNonEmptyString(row.title) ? row.title : "Trabajo sin título",
    description: isNonEmptyString(row.description) ? row.description : "Sin descripción disponible.",
    category: row.category ?? "Otros",
    priceValue,
    priceLabel: `$${priceValue.toLocaleString("es-AR")}`,
    rating: Number(toSafeNumber(row.rating, 0).toFixed(1)),
    distanceKm,
    location: isNonEmptyString(row.location) ? row.location : "Ubicación sin definir",
    availability: isNonEmptyString(row.availability) ? row.availability : "A coordinar",
    urgency: row.urgency === "urgente" ? "urgente" : "normal",
    image:
      isNonEmptyString(row.image)
        ? row.image
        : "https://images.unsplash.com/photo-1556911220-bff31c812dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    postedAt: safeDate(row.posted_at),
    status: row.status ?? "publicado",
  };
};

export const mapApplicationRow = (row: Partial<ApplicationsRow>): Application => ({
  id: isNonEmptyString(row.id) ? row.id : "",
  jobId: isNonEmptyString(row.job_id) ? row.job_id : "",
  applicantUserId: isNonEmptyString(row.applicant_user_id) ? row.applicant_user_id : "",
  coverMessage: isNonEmptyString(row.cover_message) ? row.cover_message : "",
  proposedAmount: Math.max(0, Math.round(toSafeNumber(row.proposed_amount, 0))),
  status: row.status ?? "enviada",
  createdAt: safeDate(row.created_at),
});

export const mapConversationRow = (row: Partial<ConversationsRow>): Conversation => ({
  id: isNonEmptyString(row.id) ? row.id : "",
  participantIds: [isNonEmptyString(row.participant_1_id) ? row.participant_1_id : "", isNonEmptyString(row.participant_2_id) ? row.participant_2_id : ""],
  jobId: isNonEmptyString(row.job_id) ? row.job_id : "",
  lastMessageAt: safeDate(row.last_message_at),
});

export const mapMessageRow = (row: Partial<MessagesRow>): Message => ({
  id: isNonEmptyString(row.id) ? row.id : "",
  conversationId: isNonEmptyString(row.conversation_id) ? row.conversation_id : "",
  senderUserId: isNonEmptyString(row.sender_user_id) ? row.sender_user_id : "",
  content: isNonEmptyString(row.content) ? row.content : "",
  read: Boolean(row.is_read),
  createdAt: safeDate(row.created_at),
});

export const mapReviewRow = (row: Partial<ReviewsRow>): Review => ({
  id: isNonEmptyString(row.id) ? row.id : "",
  reviewerUserId: isNonEmptyString(row.reviewer_user_id) ? row.reviewer_user_id : "",
  reviewedUserId: isNonEmptyString(row.reviewed_user_id) ? row.reviewed_user_id : "",
  rating: Math.max(0, Math.min(5, Math.round(toSafeNumber(row.rating, 0)))),
  comment: isNonEmptyString(row.comment) ? row.comment : "",
  createdAt: safeDate(row.created_at),
});

export const mapNotificationRow = (row: Partial<NotificationsRow>): Notification => ({
  id: isNonEmptyString(row.id) ? row.id : "",
  userId: isNonEmptyString(row.user_id) ? row.user_id : "",
  title: isNonEmptyString(row.title) ? row.title : "Notificación",
  description: isNonEmptyString(row.description) ? row.description : "",
  createdAt: safeDate(row.created_at),
  read: Boolean(row.is_read),
  type: row.type ?? "trabajo",
});

export const mapPaymentMethodRow = (row: Partial<PaymentMethodsRow>): PaymentMethod => ({
  id: isNonEmptyString(row.id) ? row.id : `pm-${Date.now()}`,
  userId: isNonEmptyString(row.user_id) ? row.user_id : undefined,
  type: row.type ?? "Visa",
  last4: isNonEmptyString(row.last4) ? row.last4 : "0000",
  expiry: isNonEmptyString(row.expiry) ? row.expiry : "--/--",
  holderName: isNonEmptyString(row.holder_name) ? row.holder_name : "Titular",
  isDefault: Boolean(row.is_default),
  colorClass: isNonEmptyString(row.color_class) ? row.color_class : "from-indigo-500 to-indigo-600",
  createdAt: safeDate(row.created_at),
});

export const mapTransactionRow = (row: Partial<TransactionsRow>): Transaction => {
  const amount = Math.max(0, Math.round(toSafeNumber(row.amount, 0)));

  return {
    id: isNonEmptyString(row.id) ? row.id : `tx-${Date.now()}`,
    userId: isNonEmptyString(row.user_id) ? row.user_id : undefined,
    jobId: isNonEmptyString(row.job_id) ? row.job_id : "",
    amount,
    amountLabel: `$${amount.toLocaleString("es-AR")}`,
    status: row.status ?? "pagado",
    createdAt: safeDate(row.created_at),
  };
};
