/**
 * WHY: Provide grounded local preview data so development mode feels intentional and realistic instead of empty or over-curated.
 * CHANGED: YYYY-MM-DD
 */
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

type SampleSearchParams = {
  query?: string;
  category?: string;
  onlyUrgent?: boolean;
  sortBy?: "distance" | "newest";
};

export const previewLocation = "Rafaela, Santa Fe";
export const currentUserId = "sample-user-lucas";

export const jobCategories: JobCategory[] = [
  "Hogar",
  "Construcción y Mantenimiento",
  "Oficios",
  "Control de Plagas",
  "Mecánica y Transporte",
  "Delivery",
  "Servicios Personales y Estética",
  "Alimentación y Tradición",
  "Tecnología",
  "Oficios Modernos y Digitales",
  "Personal Trainer",
  "Eventos",
  "Otros",
];

export const users: User[] = [
  {
    id: currentUserId,
    name: "Lucas Ferreyra",
    avatarLetter: "L",
    location: "Rafaela, Santa Fe",
    memberSince: "Agosto 2024",
    verified: true,
    rating: 4.6,
    totalReviews: 11,
    completedJobs: 9,
    successRate: 91,
    bio: "Hago mantenimiento liviano, armado de muebles y traslados cortos. Suelo confirmar horarios antes de salir.",
    trustIndicators: ["Pagos protegidos"],
    createdAt: "2024-08-10T12:00:00.000Z",
  },
  {
    id: "sample-user-maria-ines",
    name: "María Inés Galarza",
    avatarLetter: "M",
    location: "Sunchales, Santa Fe",
    memberSince: "Noviembre 2023",
    verified: true,
    rating: 4.8,
    totalReviews: 18,
    completedJobs: 14,
    successRate: 95,
    bio: "Publico tareas para mi casa y el local. Valoro mucho la puntualidad y la buena comunicación.",
    trustIndicators: ["Identidad validada", "Teléfono verificado"],
    createdAt: "2023-11-18T09:30:00.000Z",
  },
  {
    id: "sample-user-diego",
    name: "Diego Peralta",
    avatarLetter: "D",
    location: "Rafaela, Santa Fe",
    memberSince: "Febrero 2025",
    verified: false,
    rating: 4.4,
    totalReviews: 7,
    completedJobs: 5,
    successRate: 86,
    bio: "Estoy arrancando con changas de flete corto y tareas rápidas dentro de Rafaela.",
    trustIndicators: [],
    createdAt: "2025-02-07T14:15:00.000Z",
  },
  {
    id: "sample-user-sofia",
    name: "Sofía Roldán",
    avatarLetter: "S",
    location: "Esperanza, Santa Fe",
    memberSince: "Junio 2023",
    verified: true,
    rating: 4.9,
    totalReviews: 26,
    completedJobs: 20,
    successRate: 97,
    bio: "Trabajo con fotografía de producto y cobertura simple para comercios y eventos chicos.",
    trustIndicators: ["Identidad validada", "Pagos protegidos"],
    createdAt: "2023-06-02T11:40:00.000Z",
  },
  {
    id: "sample-user-martin",
    name: "Martín Albornoz",
    avatarLetter: "M",
    location: "Santa Fe capital, Santa Fe",
    memberSince: "Enero 2024",
    verified: true,
    rating: 4.7,
    totalReviews: 13,
    completedJobs: 10,
    successRate: 93,
    bio: "Hago soporte técnico, redes chicas y puesta a punto de equipos para oficinas y comercios.",
    trustIndicators: ["Teléfono verificado"],
    createdAt: "2024-01-22T08:50:00.000Z",
  },
  {
    id: "sample-user-celeste",
    name: "Celeste Benítez",
    avatarLetter: "C",
    location: "Lehmann, Santa Fe",
    memberSince: "Diciembre 2024",
    verified: false,
    rating: 4.5,
    totalReviews: 4,
    completedJobs: 3,
    successRate: 88,
    bio: "Me muevo para limpieza, orden y apoyo en eventos chicos. Coordino rápido por mensaje.",
    trustIndicators: [],
    createdAt: "2024-12-04T17:00:00.000Z",
  },
];

export const jobs: Job[] = [
  {
    id: "sample-job-1",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: "Instalar un termotanque eléctrico",
    description:
      "Necesito colocarlo en lavadero, revisar conexión y dejarlo funcionando hoy si se puede. Ya está comprado.",
    category: "Oficios",
    priceLabel: "$42.000",
    priceValue: 42000,
    rating: 4.8,
    distanceKm: 1.1,
    location: "Barrio 9 de Julio, Rafaela",
    availability: "Hoy después de las 18",
    urgency: "urgente",
    postedByUserId: "sample-user-maria-ines",
    postedAt: "2026-04-16T11:20:00.000Z",
    status: "publicado",
  },
  {
    id: "sample-job-2",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: "Limpieza después de una mudanza",
    description:
      "Departamento de dos ambientes. Hay que limpiar piso, cocina y baño para entregarlo mañana por la tarde.",
    category: "Hogar",
    priceLabel: "$28.000",
    priceValue: 28000,
    rating: 4.5,
    distanceKm: 2.3,
    location: "Centro, Rafaela",
    availability: "Mañana por la mañana",
    urgency: "normal",
    postedByUserId: "sample-user-celeste",
    postedAt: "2026-04-16T08:10:00.000Z",
    status: "publicado",
  },
  {
    id: "sample-job-3",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: "Traslado de heladera y lavarropas",
    description:
      "Necesito moverlos entre dos domicilios dentro de Rafaela. Son 8 cuadras y puedo ayudar a cargar.",
    category: "Delivery",
    priceLabel: "$18.000",
    priceValue: 18000,
    rating: 4.4,
    distanceKm: 3.6,
    location: "Barrio Pizzurno, Rafaela",
    availability: "Viernes por la tarde",
    urgency: "normal",
    postedByUserId: "sample-user-diego",
    postedAt: "2026-04-15T19:35:00.000Z",
    status: "publicado",
  },
  {
    id: "sample-job-4",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: "Fotos simples para menú y redes",
    description:
      "Busco alguien que saque fotos claras de platos y del local para actualizar Instagram y un menú digital.",
    category: "Eventos",
    priceLabel: "$35.000",
    priceValue: 35000,
    rating: 4.9,
    distanceKm: 4.2,
    location: "Sunchales, Santa Fe",
    availability: "Esta semana",
    urgency: "normal",
    postedByUserId: "sample-user-sofia",
    postedAt: "2026-04-15T16:00:00.000Z",
    status: "publicado",
  },
  {
    id: "sample-job-5",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: "Configurar impresora fiscal y Wi-Fi",
    description:
      "En un comercio chico. La impresora imprime, pero pierde conexión y necesitamos dejar todo estable antes del sábado.",
    category: "Tecnología",
    priceLabel: "$22.000",
    priceValue: 22000,
    rating: 4.7,
    distanceKm: 6.8,
    location: "Esperanza, Santa Fe",
    availability: "Jueves o viernes",
    urgency: "urgente",
    postedByUserId: "sample-user-martin",
    postedAt: "2026-04-15T13:15:00.000Z",
    status: "publicado",
  },
  {
    id: "sample-job-6",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: "Cortar el pasto y ordenar patio",
    description:
      "Patio chico con algo de yuyos altos. Ideal hacerlo antes del fin de semana si el clima acompaña.",
    category: "Hogar",
    priceLabel: "$19.000",
    priceValue: 19000,
    rating: 4.5,
    distanceKm: 8.9,
    location: "Lehmann, Santa Fe",
    availability: "Antes del sábado",
    urgency: "normal",
    postedByUserId: "sample-user-celeste",
    postedAt: "2026-04-14T17:45:00.000Z",
    status: "publicado",
  },
  {
    id: "sample-job-7",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: "Armado de placard con puertas corredizas",
    description:
      "Publiqué esta tarea para mi hermana. Ya está comprado y necesitamos alguien prolijo que lo deje nivelado.",
    category: "Hogar",
    priceLabel: "$31.000",
    priceValue: 31000,
    rating: 4.6,
    distanceKm: 1.9,
    location: "Barrio Italia, Rafaela",
    availability: "Sábado por la mañana",
    urgency: "normal",
    postedByUserId: currentUserId,
    postedAt: "2026-04-15T09:20:00.000Z",
    status: "publicado",
  },
  {
    id: "sample-job-8",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: "Pintar una cocina chica",
    description:
      "Trabajo ya coordinado y cerrado. Lo uso como ejemplo de historial para mostrar cómo se ven tareas completadas.",
    category: "Oficios",
    priceLabel: "$26.000",
    priceValue: 26000,
    rating: 4.7,
    distanceKm: 2.7,
    location: "Centro, Rafaela",
    availability: "Completado",
    urgency: "normal",
    postedByUserId: currentUserId,
    postedAt: "2026-04-07T14:30:00.000Z",
    status: "completado",
  },
];

export const applications: Application[] = [
  {
    id: "sample-application-1",
    jobId: "sample-job-1",
    applicantUserId: currentUserId,
    coverMessage: "Puedo pasar hoy a la tarde, revisar la conexión y confirmar si hace falta algún adaptador antes de instalar.",
    proposedAmount: 42000,
    createdAt: "2026-04-16T12:05:00.000Z",
    status: "enviada",
  },
  {
    id: "sample-application-2",
    jobId: "sample-job-3",
    applicantUserId: currentUserId,
    coverMessage: "Tengo utilitario chico y puedo coordinar el traslado completo mañana después de las 15.",
    proposedAmount: 18000,
    createdAt: "2026-04-15T20:10:00.000Z",
    status: "aceptada",
  },
];

export const conversations: Conversation[] = [
  {
    id: "sample-conversation-1",
    participantIds: [currentUserId, "sample-user-maria-ines"],
    jobId: "sample-job-1",
    lastMessageAt: "2026-04-16T12:18:00.000Z",
  },
  {
    id: "sample-conversation-2",
    participantIds: [currentUserId, "sample-user-martin"],
    jobId: "sample-job-5",
    lastMessageAt: "2026-04-15T17:02:00.000Z",
  },
  {
    id: "sample-conversation-3",
    participantIds: [currentUserId, "sample-user-celeste"],
    jobId: "sample-job-2",
    lastMessageAt: "2026-04-14T19:40:00.000Z",
  },
];

export const messages: Message[] = [
  {
    id: "sample-message-1",
    conversationId: "sample-conversation-1",
    senderUserId: "sample-user-maria-ines",
    content: "Buen día Lucas, ¿podés pasar hoy después de las 18? El termotanque ya está en casa.",
    createdAt: "2026-04-16T11:48:00.000Z",
    read: true,
  },
  {
    id: "sample-message-2",
    conversationId: "sample-conversation-1",
    senderUserId: currentUserId,
    content: "Sí, llego 18:30. Antes de arrancar reviso conexión y te confirmo si hace falta algo más.",
    createdAt: "2026-04-16T12:02:00.000Z",
    read: true,
  },
  {
    id: "sample-message-3",
    conversationId: "sample-conversation-1",
    senderUserId: "sample-user-maria-ines",
    content: "Perfecto, con eso me alcanza. Gracias.",
    createdAt: "2026-04-16T12:18:00.000Z",
    read: false,
  },
  {
    id: "sample-message-4",
    conversationId: "sample-conversation-2",
    senderUserId: "sample-user-martin",
    content: "Si mañana podés venir antes de las 10 mejor, así probamos la impresora con gente en el local.",
    createdAt: "2026-04-15T16:51:00.000Z",
    read: false,
  },
  {
    id: "sample-message-5",
    conversationId: "sample-conversation-3",
    senderUserId: currentUserId,
    content: "¿La limpieza incluye horno y heladera o solo cocina general?",
    createdAt: "2026-04-14T19:10:00.000Z",
    read: true,
  },
  {
    id: "sample-message-6",
    conversationId: "sample-conversation-3",
    senderUserId: "sample-user-celeste",
    content: "Solo cocina general y baño. El resto del depto ya está vacío.",
    createdAt: "2026-04-14T19:40:00.000Z",
    read: true,
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: "sample-payment-method-1",
    userId: currentUserId,
    type: "Visa",
    last4: "4812",
    expiry: "11/27",
    holderName: "LUCAS FERREYRA",
    isDefault: true,
    colorClass: "from-slate-700 to-slate-900",
    createdAt: "2026-02-10T15:40:00.000Z",
  },
];

export const transactions: Transaction[] = [
  {
    id: "sample-transaction-1",
    userId: currentUserId,
    jobId: "sample-job-3",
    amount: 18000,
    amountLabel: "$18.000",
    createdAt: "2026-04-12T18:25:00.000Z",
    status: "pagado",
  },
  {
    id: "sample-transaction-2",
    userId: currentUserId,
    jobId: "sample-job-5",
    amount: 22000,
    amountLabel: "$22.000",
    createdAt: "2026-04-15T17:35:00.000Z",
    status: "pendiente",
  },
];

export const reviews: Review[] = [
  {
    id: "sample-review-1",
    reviewerUserId: "sample-user-maria-ines",
    reviewedUserId: currentUserId,
    rating: 5,
    comment: "Llegó en horario, explicó lo que hacía y dejó todo funcionando sin vueltas.",
    createdAt: "2026-04-09T10:15:00.000Z",
  },
  {
    id: "sample-review-2",
    reviewerUserId: "sample-user-diego",
    reviewedUserId: currentUserId,
    rating: 4,
    comment: "Buena predisposición y comunicación. Tuvimos que mover el horario, pero avisó con tiempo.",
    createdAt: "2026-03-31T18:05:00.000Z",
  },
  {
    id: "sample-review-3",
    reviewerUserId: "sample-user-sofia",
    reviewedUserId: "sample-user-martin",
    rating: 5,
    comment: "Resolvió el problema en una visita y quedó atento por si volvía a fallar.",
    createdAt: "2026-04-01T13:20:00.000Z",
  },
];

export const notifications: AppNotification[] = [
  {
    id: "sample-notification-1",
    userId: currentUserId,
    title: "Te respondieron por el termotanque",
    description: "María Inés confirmó horario para hoy y dejó los detalles por chat.",
    createdAt: "2026-04-16T12:20:00.000Z",
    read: false,
    type: "mensaje",
  },
  {
    id: "sample-notification-2",
    userId: currentUserId,
    title: "Pago pendiente de confirmación",
    description: "Quedó registrado un cobro por Configurar impresora fiscal y Wi-Fi. Se acredita cuando se confirme el trabajo.",
    createdAt: "2026-04-15T17:36:00.000Z",
    read: true,
    type: "pago",
  },
  {
    id: "sample-notification-3",
    userId: currentUserId,
    title: "Nueva changa cerca tuyo",
    description: "Se publicó un pedido de limpieza post mudanza en el centro de Rafaela.",
    createdAt: "2026-04-16T08:12:00.000Z",
    read: true,
    type: "trabajo",
  },
];

export const categoryFilters = ["Todos", ...jobCategories] as const;

const normalizeValue = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export function getSampleJobs(params: SampleSearchParams = {}) {
  const normalizedQuery = normalizeValue(params.query ?? "");

  return [...jobs]
    .filter((job) => {
      if (job.status !== "publicado") {
        return false;
      }

      if (params.category && params.category !== "Todos" && job.category !== params.category) {
        return false;
      }

      if (params.onlyUrgent && job.urgency !== "urgente") {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = normalizeValue(
        [job.title, job.description, job.category, job.location, job.availability].join(" "),
      );

      return normalizedQuery
        .split(/\s+/)
        .filter(Boolean)
        .every((term) => haystack.includes(term));
    })
    .sort((left, right) => {
      if (params.sortBy === "newest") {
        return new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime();
      }

      if (left.distanceKm !== right.distanceKm) {
        return left.distanceKm - right.distanceKm;
      }

      return new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime();
    });
}

export function getSampleJobById(id: string) {
  return jobs.find((job) => job.id === id) ?? null;
}

export function getSampleMyJobs(userId: string) {
  return jobs
    .filter((job) => job.postedByUserId === userId)
    .sort((left, right) => new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime());
}

export function getSampleApplications(userId: string) {
  return applications
    .filter((application) => application.applicantUserId === userId)
    .sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

export function getSampleConversations(userId: string) {
  return conversations
    .filter((conversation) => conversation.participantIds.includes(userId))
    .sort(
      (left, right) =>
        new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime(),
    );
}

export function getSampleMessages(conversationId: string) {
  return messages
    .filter((message) => message.conversationId === conversationId)
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
}

export function getSamplePaymentMethods(userId: string) {
  return paymentMethods
    .filter((method) => method.userId === userId)
    .sort(
      (left, right) =>
        new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime(),
    );
}

export function getSampleTransactions(userId: string) {
  return transactions
    .filter((transaction) => transaction.userId === userId)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

export function getSampleNotifications(userId: string) {
  return notifications
    .filter((notification) => notification.userId === userId)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

export function getSampleProfiles() {
  return [...users].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function getSampleProfileBundle(userId: string) {
  const profile = users.find((item) => item.id === userId);

  if (!profile) {
    return null;
  }

  return {
    profile,
    reviews: reviews
      .filter((review) => review.reviewedUserId === userId)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
  };
}
