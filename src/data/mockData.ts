import {
  AppNotification,
  Application,
  Conversation,
  Job,
  JobCategory,
  Message,
  PaymentMethod,
  Review,
  Transaction,
  User,
} from "../types/domain";

export const currentUserId = "user-gero";

export const jobCategories: JobCategory[] = [
  "Hogar",
  "Oficios",
  "Delivery",
  "Eventos",
  "Tecnología",
  "Otros",
];

export const users: User[] = [
  {
    id: currentUserId,
    name: "Gero M.",
    avatarLetter: "G",
    location: "Palermo, CABA",
    memberSince: "Marzo 2024",
    verified: true,
    rating: 4.8,
    totalReviews: 46,
    completedJobs: 24,
    successRate: 98,
    bio: "Trabajo prolijo, puntual y con buena comunicación.",
    trustIndicators: ["Identidad validada", "Teléfono verificado", "Pagos protegidos"],
  },
  {
    id: "user-mariana",
    name: "Mariana G.",
    avatarLetter: "M",
    location: "Palermo, CABA",
    memberSince: "Julio 2023",
    verified: true,
    rating: 4.8,
    totalReviews: 23,
    completedJobs: 12,
    successRate: 96,
    trustIndicators: ["Cuenta verificada"],
  },
  {
    id: "user-carlos",
    name: "Carlos R.",
    avatarLetter: "C",
    location: "Belgrano, CABA",
    memberSince: "Enero 2025",
    verified: true,
    rating: 4.6,
    totalReviews: 12,
    completedJobs: 8,
    successRate: 92,
    trustIndicators: ["Teléfono verificado"],
  },
  {
    id: "user-laura",
    name: "Laura P.",
    avatarLetter: "L",
    location: "Recoleta, CABA",
    memberSince: "Mayo 2024",
    verified: false,
    rating: 4.7,
    totalReviews: 9,
    completedJobs: 5,
    successRate: 90,
    trustIndicators: ["Email validado"],
  },
];

export const jobs: Job[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1611021061218-761c355ed331?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: "Reparación de puerta de madera",
    description: "Se necesita reparar y barnizar puerta de entrada de madera maciza.",
    category: "Oficios",
    priceLabel: "$18.000",
    priceValue: 18000,
    rating: 4.8,
    distanceKm: 1.2,
    location: "Palermo, CABA",
    availability: "Esta semana",
    urgency: "urgente",
    postedByUserId: "user-mariana",
    postedAt: "2026-04-14T10:30:00.000Z",
    status: "publicado",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: "Limpieza profunda completa",
    description: "Limpieza completa de departamento 2 ambientes con cocina y baño.",
    category: "Hogar",
    priceLabel: "$15.000",
    priceValue: 15000,
    rating: 4.9,
    distanceKm: 2.1,
    location: "Recoleta, CABA",
    availability: "Mañana por la mañana",
    urgency: "normal",
    postedByUserId: "user-laura",
    postedAt: "2026-04-15T12:00:00.000Z",
    status: "publicado",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1676210133055-eab6ef033ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: "Arreglo de cañerías urgente",
    description: "Pérdida importante en cañería del baño, se necesita reparar hoy.",
    category: "Oficios",
    priceLabel: "$12.000",
    priceValue: 12000,
    rating: 4.7,
    distanceKm: 0.8,
    location: "Palermo, CABA",
    availability: "Hoy",
    urgency: "urgente",
    postedByUserId: "user-carlos",
    postedAt: "2026-04-15T08:15:00.000Z",
    status: "publicado",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1629941633816-a1d688cb2d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: "Pintura de habitaciones",
    description: "Pintar 2 habitaciones de 3x3m cada una con material incluido.",
    category: "Hogar",
    priceLabel: "$20.000",
    priceValue: 20000,
    rating: 4.6,
    distanceKm: 1.5,
    location: "Belgrano, CABA",
    availability: "Fin de semana",
    urgency: "normal",
    postedByUserId: "user-mariana",
    postedAt: "2026-04-13T15:20:00.000Z",
    status: "publicado",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1660330589693-99889d60181e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: "Instalación eléctrica completa",
    description: "Cambio de enchufes e instalación de luces LED en living y cocina.",
    category: "Oficios",
    priceLabel: "$14.000",
    priceValue: 14000,
    rating: 4.8,
    distanceKm: 2.5,
    location: "Caballito, CABA",
    availability: "Esta semana",
    urgency: "normal",
    postedByUserId: "user-laura",
    postedAt: "2026-04-12T18:05:00.000Z",
    status: "publicado",
  },
];

export const applications: Application[] = [
  {
    id: "ap-1",
    jobId: "1",
    applicantUserId: currentUserId,
    coverMessage: "Tengo experiencia con puertas macizas y trabajo prolijo.",
    proposedAmount: 18000,
    createdAt: "2026-04-14T18:30:00.000Z",
    status: "aceptada",
  },
  {
    id: "ap-2",
    jobId: "4",
    applicantUserId: currentUserId,
    coverMessage: "Puedo empezar el sábado y terminar en el día.",
    proposedAmount: 20000,
    createdAt: "2026-04-13T19:00:00.000Z",
    status: "enviada",
  },
];

export const conversations: Conversation[] = [
  { id: "cv-1", participantIds: [currentUserId, "user-mariana"], jobId: "1", lastMessageAt: "2026-04-15T16:20:00.000Z" },
  { id: "cv-2", participantIds: [currentUserId, "user-carlos"], jobId: "4", lastMessageAt: "2026-04-15T12:30:00.000Z" },
  { id: "cv-3", participantIds: [currentUserId, "user-laura"], jobId: "2", lastMessageAt: "2026-04-14T16:10:00.000Z" },
];

export const messages: Message[] = [
  { id: "m-1", conversationId: "cv-1", senderUserId: "user-mariana", content: "Hola Gero, ¿podés venir mañana a las 10?", createdAt: "2026-04-15T15:50:00.000Z", read: true },
  { id: "m-2", conversationId: "cv-1", senderUserId: currentUserId, content: "Sí, perfecto. Llevo todo para barnizar.", createdAt: "2026-04-15T16:02:00.000Z", read: true },
  { id: "m-3", conversationId: "cv-1", senderUserId: "user-mariana", content: "Genial, te espero. Gracias!", createdAt: "2026-04-15T16:20:00.000Z", read: false },
  { id: "m-4", conversationId: "cv-2", senderUserId: "user-carlos", content: "¿El precio incluye materiales?", createdAt: "2026-04-15T12:30:00.000Z", read: false },
  { id: "m-5", conversationId: "cv-3", senderUserId: "user-laura", content: "Muchas gracias por el excelente trabajo!", createdAt: "2026-04-14T16:10:00.000Z", read: true },
];

export const paymentMethods: PaymentMethod[] = [
  { id: "pm-1", type: "Visa", last4: "4242", expiry: "12/26", holderName: "GERONIMO MENDEZ", isDefault: true, colorClass: "from-blue-500 to-blue-600" },
  { id: "pm-2", type: "Mastercard", last4: "8888", expiry: "08/27", holderName: "GERONIMO MENDEZ", isDefault: false, colorClass: "from-orange-500 to-orange-600" },
];

export const transactions: Transaction[] = [
  { id: "tx-1", jobId: "2", amount: 15000, amountLabel: "$15.000", createdAt: "2026-04-15T14:30:00.000Z", status: "pagado" },
  { id: "tx-2", jobId: "3", amount: 12000, amountLabel: "$12.000", createdAt: "2026-04-10T09:15:00.000Z", status: "pagado" },
];

export const reviews: Review[] = [
  { id: "rev-1", reviewerUserId: "user-mariana", reviewedUserId: currentUserId, rating: 5, comment: "Excelente trabajo, prolijo y cumplidor. Lo recomiendo totalmente.", createdAt: "2026-04-13T11:00:00.000Z" },
  { id: "rev-2", reviewerUserId: "user-carlos", reviewedUserId: currentUserId, rating: 4, comment: "Muy buen servicio, llegó puntual y dejó todo impecable.", createdAt: "2026-04-08T11:00:00.000Z" },
];

export const notifications: AppNotification[] = [
  { id: "n-1", userId: currentUserId, title: "Tenés una propuesta aceptada", description: "Mariana aceptó tu postulación para Reparación de puerta de madera", createdAt: "2026-04-15T16:30:00.000Z", read: false, type: "trabajo" },
];

export const categoryFilters = ["Todos", ...jobCategories] as const;
