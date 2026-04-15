import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  applications as initialApplications,
  currentUserId,
  jobs as initialJobs,
  messages as initialMessages,
  notifications as initialNotifications,
  users,
} from "../data/mockData";
import { Application, Conversation, Job, Message, Notification, PaymentMethod, Profile, Review, Transaction } from "../types/domain";
import { getConversationList, getConversationMessages, sendChatMessage } from "../../services/chat.service";
import { getPaymentMethods, getTransactions } from "../../services/payments.service";
import { getProfileBundle, getPublicProfiles } from "../../services/profiles.service";
import { getFeaturedJobs, getJobById, searchJobs, SearchJobsParams } from "../../services/jobs.service";

interface NewJobInput {
  title: string;
  description: string;
  category: Job["category"];
  location: string;
  priceValue: number;
  availability: string;
  urgency: Job["urgency"];
  image?: string;
}

interface AppStateValue {
  currentUserId: string;
  jobs: Job[];
  applications: Application[];
  conversations: Conversation[];
  messages: Message[];
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  profiles: Profile[];
  reviews: Review[];
  notifications: Notification[];
  dataSource: "supabase" | "fallback";
  isLoading: boolean;
  errorMessage: string | null;
  addPublishedJob: (input: NewJobInput) => Job;
  updateApplicationStatus: (applicationId: string, status: Application["status"]) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, "id" | "colorClass">) => void;
  refreshJobs: (params?: SearchJobsParams) => Promise<void>;
  loadJobById: (id: string) => Promise<Job | null>;
  refreshProfile: (userId: string) => Promise<void>;
  refreshChatDetail: (conversationId: string) => Promise<void>;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>(users);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications] = useState<Notification[]>(initialNotifications);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"supabase" | "fallback">("fallback");

  const refreshJobs = async (params: SearchJobsParams = {}) => {
    const result = Object.keys(params).length > 0 ? await searchJobs(params) : await getFeaturedJobs();
    setJobs(result.data);
    setDataSource(result.source);
    if (result.error) setErrorMessage(result.error);
  };

  const loadJobById = async (id: string) => {
    const result = await getJobById(id);
    if (result.error) setErrorMessage(result.error);
    return result.data;
  };

  const refreshProfile = async (userId: string) => {
    const profileResult = await getProfileBundle(userId);
    if (profileResult.error) setErrorMessage(profileResult.error);

    if (profileResult.data) {
      setProfiles((prev) => {
        const rest = prev.filter((profile) => profile.id !== profileResult.data!.profile.id);
        return [profileResult.data!.profile, ...rest];
      });
      setReviews(profileResult.data.reviews);
      setDataSource(profileResult.source);
    }
  };

  const refreshChatDetail = async (conversationId: string) => {
    const result = await getConversationMessages(conversationId);
    setMessages((prev) => {
      const withoutConversation = prev.filter((message) => message.conversationId !== conversationId);
      return [...withoutConversation, ...result.data];
    });
    if (result.error) setErrorMessage(result.error);
  };

  useEffect(() => {
    async function bootstrap() {
      setIsLoading(true);
      setErrorMessage(null);

      const [jobsResult, conversationsResult, methodsResult, txResult, profilesResult, currentProfileResult] = await Promise.all([
        getFeaturedJobs(),
        getConversationList(currentUserId),
        getPaymentMethods(currentUserId),
        getTransactions(currentUserId),
        getPublicProfiles(),
        getProfileBundle(currentUserId),
      ]);

      setJobs(jobsResult.data);
      setConversations(conversationsResult.data);
      setPaymentMethods(methodsResult.data);
      setTransactions(txResult.data);
      setProfiles(profilesResult.data);
      setReviews(currentProfileResult.data?.reviews ?? []);

      const firstError = [jobsResult, conversationsResult, methodsResult, txResult, profilesResult, currentProfileResult].find((result) => result.error)?.error;
      if (firstError) setErrorMessage(firstError);

      const sources = [jobsResult.source, conversationsResult.source, methodsResult.source, txResult.source, profilesResult.source, currentProfileResult.source];
      setDataSource(sources.every((source) => source === "supabase") ? "supabase" : "fallback");

      setIsLoading(false);
    }

    bootstrap();
  }, []);

  const addPublishedJob = (input: NewJobInput) => {
    const createdJob: Job = {
      id: `job-${Date.now()}`,
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      priceValue: input.priceValue,
      priceLabel: `$${input.priceValue.toLocaleString("es-AR")}`,
      availability: input.availability,
      urgency: input.urgency,
      image: input.image || "https://images.unsplash.com/photo-1556911220-bff31c812dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      rating: 5,
      distanceKm: 0.6,
      postedByUserId: currentUserId,
      postedAt: new Date().toISOString(),
      status: "publicado",
    };

    setJobs((prev) => [createdJob, ...prev]);
    return createdJob;
  };

  const updateApplicationStatus = (applicationId: string, status: Application["status"]) => {
    setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status } : app)));
  };

  const sendMessage = async (conversationId: string, content: string) => {
    const result = await sendChatMessage({ conversationId, senderUserId: currentUserId, content });
    if (!result.data) return;

    setMessages((prev) => [...prev, result.data!]);
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, lastMessageAt: result.data!.createdAt } : conversation,
      ),
    );

    if (result.error) setErrorMessage(result.error);
  };

  const addPaymentMethod = (method: Omit<PaymentMethod, "id" | "colorClass">) => {
    const colors = ["from-indigo-500 to-indigo-600", "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600"];
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm-${Date.now()}`,
      colorClass: colors[paymentMethods.length % colors.length],
    };

    setPaymentMethods((prev) => [newMethod, ...prev.map((item) => ({ ...item, isDefault: method.isDefault ? false : item.isDefault }))]);
  };

  const value = useMemo(
    () => ({
      currentUserId,
      jobs,
      applications,
      conversations,
      messages,
      paymentMethods,
      transactions,
      profiles,
      reviews,
      notifications,
      dataSource,
      isLoading,
      errorMessage,
      addPublishedJob,
      updateApplicationStatus,
      sendMessage,
      addPaymentMethod,
      refreshJobs,
      loadJobById,
      refreshProfile,
      refreshChatDetail,
    }),
    [applications, conversations, dataSource, errorMessage, isLoading, jobs, messages, notifications, paymentMethods, profiles, reviews, transactions],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState debe usarse dentro de AppStateProvider");
  }

  return context;
}

export const useCurrentUser = () => users.find((user) => user.id === currentUserId)!;
