import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGeolocation } from "../../hooks/useGeolocation";
import { getConversationList, getConversationMessages, sendChatMessage } from "../../services/chat.service";
import { getPaymentMethods, getTransactions } from "../../services/payments.service";
import { getProfileBundle, getPublicProfiles, updateProfileLocation } from "../../services/profiles.service";
import { createJob, getFeaturedJobs, getJobById, getMyJobs, searchJobs, SearchJobsParams } from "../../services/jobs.service";
import { getMyApplications } from "../../services/applications.service";
import { getMyNotifications } from "../../services/notifications.service";
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

const DEFAULT_LOCATION = "Ubicación pendiente";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"supabase" | "fallback">("supabase");
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION);

  const pushError = useCallback((message?: string) => {
    if (message) setErrorMessage(message);
  }, []);

  const refreshJobs = useCallback(async (params: SearchJobsParams = {}) => {
    const result = Object.keys(params).length > 0 ? await searchJobs(params) : await getFeaturedJobs();
    setJobs(result.data);
    setDataSource(result.source);
    pushError(result.error);
  }, [pushError]);

  const loadJobById = useCallback(async (id: string) => {
    const result = await getJobById(id);
    pushError(result.error);
    return result.data;
  }, [pushError]);

  const refreshProfile = useCallback(async (profileUserId: string) => {
    const profileResult = await getProfileBundle(profileUserId);
    pushError(profileResult.error);

    if (!profileResult.data) return;

    setProfiles((prev) => {
      const rest = prev.filter((profile) => profile.id !== profileResult.data!.profile.id);
      return [profileResult.data!.profile, ...rest];
    });
    setReviews(profileResult.data.reviews);

    if (profileResult.data.profile.location) {
      setSelectedLocation(profileResult.data.profile.location);
    }

    setDataSource(profileResult.source);
  }, [pushError]);

  const refreshChatDetail = useCallback(async (conversationId: string) => {
    const result = await getConversationMessages(conversationId);
    setMessages((prev) => {
      const withoutConversation = prev.filter((message) => message.conversationId !== conversationId);
      return [...withoutConversation, ...result.data];
    });
    pushError(result.error);
  }, [pushError]);

  const loadBaseData = useCallback(async (currentUserId: string | null) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const jobsResult = await getFeaturedJobs();
      const profilesResult = await getPublicProfiles();

      setJobs(jobsResult.data);
      setProfiles(profilesResult.data);
      setDataSource(jobsResult.source);

      const firstBaseError = jobsResult.error ?? profilesResult.error;
      if (firstBaseError) setErrorMessage(firstBaseError);

      if (!currentUserId) {
        setConversations([]);
        setMessages([]);
        setPaymentMethods([]);
        setTransactions([]);
        setReviews([]);
        setMyJobs([]);
        setApplications([]);
        setNotifications([]);
        setSelectedLocation(DEFAULT_LOCATION);
        return;
      }

      const [
        conversationsResult,
        methodsResult,
        txResult,
        currentProfileResult,
        myJobsResult,
        applicationsResult,
        notificationsResult,
      ] = await Promise.all([
        getConversationList(currentUserId),
        getPaymentMethods(currentUserId),
        getTransactions(currentUserId),
        getProfileBundle(currentUserId),
        getMyJobs(currentUserId),
        getMyApplications(currentUserId),
        getMyNotifications(currentUserId),
      ]);

      setConversations(conversationsResult.data);
      setPaymentMethods(methodsResult.data);
      setTransactions(txResult.data);
      setReviews(currentProfileResult.data?.reviews ?? []);
      setMyJobs(myJobsResult.data);
      setApplications(applicationsResult.data);
      setNotifications(notificationsResult.data);

      if (currentProfileResult.data?.profile.location) {
        setSelectedLocation(currentProfileResult.data.profile.location);
      }

      const firstAuthError =
        conversationsResult.error ??
        methodsResult.error ??
        txResult.error ??
        currentProfileResult.error ??
        myJobsResult.error ??
        applicationsResult.error ??
        notificationsResult.error;

      if (firstAuthError) setErrorMessage(firstAuthError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBaseData(userId);
  }, [loadBaseData, userId]);

  const addPublishedJob = useCallback(async (input: NewJobInput) => {
    if (!userId) {
      setErrorMessage("Necesitás iniciar sesión para publicar.");
      return null;
    }

    const createdResult = await createJob({ ...input, postedByUserId: userId });
    if (!createdResult.data) {
      pushError(createdResult.error ?? "No pudimos publicar tu changa.");
      return null;
    }

    setJobs((prev) => {
      const next = [createdResult.data!, ...prev.filter((job) => job.id !== createdResult.data!.id)];
      return next;
    });
    setMyJobs((prev) => [createdResult.data!, ...prev.filter((job) => job.id !== createdResult.data!.id)]);
    return createdResult.data;
  }, [pushError, userId]);

  const updateApplicationStatus = useCallback((applicationId: string, status: Application["status"]) => {
    setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status } : app)));
  }, []);

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!userId) {
      setErrorMessage("Necesitás iniciar sesión para enviar mensajes.");
      return;
    }

    const result = await sendChatMessage({ conversationId, senderUserId: userId, content });
    if (!result.data) {
      pushError(result.error);
      return;
    }

    setMessages((prev) => [...prev, result.data!]);
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, lastMessageAt: result.data!.createdAt }
          : conversation,
      ),
    );
  }, [pushError, userId]);

  const addPaymentMethod = useCallback((method: Omit<PaymentMethod, "id" | "colorClass">) => {
    const colors = ["from-indigo-500 to-indigo-600", "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600"];
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm-${Date.now()}`,
      colorClass: colors[paymentMethods.length % colors.length],
    };

    setPaymentMethods((prev) => [
      newMethod,
      ...prev.map((item) => ({ ...item, isDefault: method.isDefault ? false : item.isDefault })),
    ]);
  }, [paymentMethods.length]);

  const setManualLocation = useCallback(async (location: string) => {
    const trimmedLocation = location.trim();
    if (!trimmedLocation) {
      setErrorMessage("Ingresá una ubicación válida.");
      return;
    }

    setSelectedLocation(trimmedLocation);

    if (!userId) return;

    const result = await updateProfileLocation(userId, trimmedLocation);
    pushError(result.error);

    if (result.data) {
      setProfiles((prev) => [result.data!, ...prev.filter((profile) => profile.id !== result.data!.id)]);
    }
  }, [pushError, userId]);

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
    [
      userId,
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
      coords,
      status,
      locationError,
      requestLocation,
      setManualLocation,
      addPublishedJob,
      updateApplicationStatus,
      sendMessage,
      addPaymentMethod,
      refreshJobs,
      loadJobById,
      refreshProfile,
      refreshChatDetail,
    ],
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
