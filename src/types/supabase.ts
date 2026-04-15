import { Application, Conversation, Job, Message, PaymentMethod, Profile, Review, Transaction } from "./domain";

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

export const mapProfileRow = (row: ProfilesRow): Profile => ({
  id: row.id,
  name: row.full_name,
  fullName: row.full_name,
  avatarLetter: row.avatar_letter,
  location: row.location,
  memberSince: row.member_since,
  verified: row.verified,
  rating: row.rating,
  totalReviews: row.total_reviews,
  completedJobs: row.completed_jobs,
  successRate: row.success_rate,
  bio: row.bio ?? undefined,
  trustIndicators: row.trust_indicators,
  createdAt: row.created_at,
});

export const mapJobRow = (row: JobsRow): Job => ({
  id: row.id,
  postedByUserId: row.posted_by_user_id,
  title: row.title,
  description: row.description,
  category: row.category,
  priceValue: row.price_value,
  priceLabel: `$${row.price_value.toLocaleString("es-AR")}`,
  rating: row.rating,
  distanceKm: row.distance_km,
  location: row.location,
  availability: row.availability,
  urgency: row.urgency,
  image: row.image,
  postedAt: row.posted_at,
  status: row.status,
});

export const mapApplicationRow = (row: ApplicationsRow): Application => ({
  id: row.id,
  jobId: row.job_id,
  applicantUserId: row.applicant_user_id,
  coverMessage: row.cover_message,
  proposedAmount: row.proposed_amount,
  status: row.status,
  createdAt: row.created_at,
});

export const mapConversationRow = (row: ConversationsRow): Conversation => ({
  id: row.id,
  participantIds: [row.participant_1_id, row.participant_2_id],
  jobId: row.job_id,
  lastMessageAt: row.last_message_at,
});

export const mapMessageRow = (row: MessagesRow): Message => ({
  id: row.id,
  conversationId: row.conversation_id,
  senderUserId: row.sender_user_id,
  content: row.content,
  read: row.is_read,
  createdAt: row.created_at,
});

export const mapReviewRow = (row: ReviewsRow): Review => ({
  id: row.id,
  reviewerUserId: row.reviewer_user_id,
  reviewedUserId: row.reviewed_user_id,
  rating: row.rating,
  comment: row.comment,
  createdAt: row.created_at,
});

export const mapPaymentMethodRow = (row: PaymentMethodsRow): PaymentMethod => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  last4: row.last4,
  expiry: row.expiry,
  holderName: row.holder_name,
  isDefault: row.is_default,
  colorClass: row.color_class,
  createdAt: row.created_at,
});

export const mapTransactionRow = (row: TransactionsRow): Transaction => ({
  id: row.id,
  userId: row.user_id,
  jobId: row.job_id,
  amount: row.amount,
  amountLabel: `$${row.amount.toLocaleString("es-AR")}`,
  status: row.status,
  createdAt: row.created_at,
});
