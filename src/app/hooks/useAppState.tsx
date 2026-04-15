import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGeolocation } from "../../hooks/useGeolocation";
import { getConversationList, getConversationMessages, sendChatMessage } from "../../services/chat.service";
import { getPaymentMethods, getTransactions } from "../../services/payments.service";
import { getProfileBundle, getPublicProfiles, updateProfileLocation } from "../../services/profiles.service";
import { createJob, getFeaturedJobs, getJobById, getMyJobs, searchJobs, SearchJobsParams } from "../../services/jobs.service";
import { getMyApplications } from "../../services/applications.service";
import { Application, Conversation, Job, Message, Notification, PaymentMethod, Profile, Review, Transaction } from "../types/domain";

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
  currentUserId: string | null;
  jobs: Job[];
  myJobs: Job[];
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
  selectedLocation: string;
  locationCoords: { latitude: number; longitude: number } | null;
  locationStatus: "idle" | "loading" | "granted" | "denied" | "error";
  locationError: string | null;
  requestDeviceLocation: () => void;
  setManualLocation: (location: string) => Promise<void>;
  addPublishedJob: (input: NewJobInput) => Promise<Job | null>;
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
  const { userId } = useAuth();
  const { coords, status, errorMessage: locationError, requestLocation } = useGeolocation();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"supabase" | "fallback">("supabase");
  const [selectedLocation, setSelectedLocation] = useState("Ubicación pendiente");

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

  const refreshProfile = async (profileUserId: string) => {
    const profileResult = await getProfileBundle(profileUserId);
    if (profileResult.error) setErrorMessage(profileResult.error);

    if (profileResult.data) {
      setProfiles((prev) => {
        const rest = prev.filter((profile) => profile.id !== profileResult.data!.profile.id);
        return [profileResult.data!.profile, ...rest];
      });
      setReviews(profileResult.data.reviews);
      setSelectedLocation(profileResult.data.profile.location);
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

      const jobsResult = await getFeaturedJobs();
      setJobs(jobsResult.data);
      if (jobsResult.error) setErrorMessage(jobsResult.error);

      const profilesResult = await getPublicProfiles();
      setProfiles(profilesResult.data);

      if (userId) {
        const [conversationsResult, methodsResult, txResult, currentProfileResult, myJobsResult, applicationsResult] = await Promise.all([
          getConversationList(userId),
          getPaymentMethods(userId),
          getTransactions(userId),
          getProfileBundle(userId),
          getMyJobs(userId),
          getMyApplications(userId),
        ]);

        setConversations(conversationsResult.data);
        setPaymentMethods(methodsResult.data);
        setTransactions(txResult.data);
        setReviews(currentProfileResult.data?.reviews ?? []);
        setMyJobs(myJobsResult.data);
        setApplications(applicationsResult.data);

        if (currentProfileResult.data?.profile.location) {
          setSelectedLocation(currentProfileResult.data.profile.location);
        }

        const firstError = [jobsResult, conversationsResult, methodsResult, txResult, profilesResult, currentProfileResult, myJobsResult, applicationsResult].find((result) => result.error)?.error;
        if (firstError) setErrorMessage(firstError);
      } else {
        setConversations([]);
        setPaymentMethods([]);
        setTransactions([]);
        setReviews([]);
        setMyJobs([]);
        setApplications([]);
      }

      setDataSource(jobsResult.source);
      setIsLoading(false);
    }

    bootstrap();
  }, [userId]);

  const addPublishedJob = async (input: NewJobInput) => {
    if (!userId) {
      setErrorMessage("Necesitás iniciar sesión para publicar.");
      return null;
    }

    const createdResult = await createJob({ ...input, postedByUserId: userId });
    if (!createdResult.data) {
      if (createdResult.error) setErrorMessage(createdResult.error);
      return null;
    }

    setJobs((prev) => [createdResult.data!, ...prev]);
    setMyJobs((prev) => [createdResult.data!, ...prev]);
    return createdResult.data;
  };

  const updateApplicationStatus = (applicationId: string, status: Application["status"]) => {
    setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status } : app)));
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!userId) return;

    const result = await sendChatMessage({ conversationId, senderUserId: userId, content });
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

  const setManualLocation = async (location: string) => {
    setSelectedLocation(location);
    if (userId) {
      const result = await updateProfileLocation(userId, location);
      if (result.error) setErrorMessage(result.error);
      if (result.data) {
        setProfiles((prev) => [result.data!, ...prev.filter((profile) => profile.id !== result.data!.id)]);
      }
    }
  };

  const value = useMemo(
    () => ({
      currentUserId: userId,
      jobs,
      myJobs,
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
      selectedLocation,
      locationCoords: coords,
      locationStatus: status,
      locationError,
      requestDeviceLocation: requestLocation,
      setManualLocation,
      addPublishedJob,
      updateApplicationStatus,
      sendMessage,
      addPaymentMethod,
      refreshJobs,
      loadJobById,
      refreshProfile,
      refreshChatDetail,
    }),
    [applications, conversations, coords, dataSource, errorMessage, isLoading, jobs, locationError, messages, myJobs, notifications, paymentMethods, profiles, requestLocation, reviews, selectedLocation, status, transactions, userId],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState debe usarse dentro de AppStateProvider");
  return context;
}

export const useCurrentUser = () => {
  const { currentUserId, profiles } = useAppState();
  return currentUserId ? profiles.find((user) => user.id === currentUserId) ?? null : null;
};
