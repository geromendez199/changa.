/**
 * WHY: Keep the public app-state API stable while delegating domain logic to focused hooks.
 * CHANGED: YYYY-MM-DD
 */
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { currentUserId as previewUserId } from "../../data/mockData";
import { useChatState } from "../../hooks/useChatState";
import { useJobsState, type NewJobInput } from "../../hooks/useJobsState";
import { DEFAULT_LOCATION, useLocationState } from "../../hooks/useLocationState";
import { useNotificationsState } from "../../hooks/useNotificationsState";
import { usePaymentsState } from "../../hooks/usePaymentsState";
import { useProfileState, type SaveUserProfileInput } from "../../hooks/useProfileState";
import { SearchJobsParams } from "../../services/jobs.service";
import { IS_DEVELOPMENT_FALLBACK } from "../../services/service.utils";
import {
  Application,
  Conversation,
  Job,
  Message,
  Notification,
  PaymentMethod,
  Profile,
  Review,
  Transaction,
} from "../../types/domain";

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
  saveUserProfile: (input: SaveUserProfileInput) => Promise<{ ok: boolean; message: string }>;
  addPublishedJob: (input: NewJobInput) => Promise<Job | null>;
  updatePublishedJob: (
    jobId: string,
    input: NewJobInput,
  ) => Promise<{ ok: boolean; message: string; job: Job | null }>;
  removePublishedJob: (jobId: string) => Promise<{ ok: boolean; message: string }>;
  withdrawMyApplication: (applicationId: string) => Promise<{ ok: boolean; message: string }>;
  sendMessage: (conversationId: string, content: string) => Promise<{ ok: boolean; message?: string }>;
  refreshJobs: (params?: SearchJobsParams) => Promise<void>;
  loadJobById: (id: string) => Promise<Job | null>;
  refreshProfile: (userId: string) => Promise<void>;
  refreshChatDetail: (conversationId: string) => Promise<void>;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const effectiveUserId = userId ?? (IS_DEVELOPMENT_FALLBACK ? previewUserId : null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"supabase" | "fallback">("supabase");

  const pushError = useCallback((message?: string) => {
    if (message) setErrorMessage(message);
  }, []);

  const {
    jobs,
    myJobs,
    applications,
    refreshJobs: refreshJobsState,
    loadJobById,
    loadAuthenticatedJobData,
    addPublishedJob,
    updatePublishedJob,
    removePublishedJob,
    withdrawMyApplication,
    resetUserJobState,
  } = useJobsState({ userId: effectiveUserId, pushError });
  const {
    profiles,
    reviews,
    loadPublicProfiles,
    refreshProfile: refreshProfileState,
    saveUserProfile: saveUserProfileState,
    updateProfileInState,
    resetAuthenticatedProfileState,
  } = useProfileState({ userId: effectiveUserId, pushError });
  const {
    conversations,
    messages,
    loadConversationList,
    refreshChatDetail,
    sendMessage,
    resetChatState,
  } = useChatState({ userId: effectiveUserId, pushError });
  const {
    paymentMethods,
    transactions,
    loadPaymentsData,
    resetPaymentsState,
  } = usePaymentsState({ userId: effectiveUserId, pushError });
  const { notifications, loadNotifications, resetNotificationsState } = useNotificationsState({
    userId: effectiveUserId,
    pushError,
  });
  const {
    selectedLocation,
    locationCoords,
    locationStatus,
    locationError,
    requestDeviceLocation,
    setManualLocation: setManualLocationState,
    syncSelectedLocation,
    resetSelectedLocation,
  } = useLocationState({ userId: effectiveUserId, pushError });

  const loadBaseData = useCallback(
    async (currentUserId: string | null) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const jobsResult = await refreshJobsState();
        const profilesResult = await loadPublicProfiles();
        const baseSource =
          jobsResult.source === "fallback" || profilesResult.source === "fallback"
            ? "fallback"
            : "supabase";

        setDataSource(baseSource);

        const firstBaseError = jobsResult.error ?? profilesResult.error;
        if (firstBaseError) {
          setErrorMessage(firstBaseError);
        }

        if (!currentUserId) {
          resetChatState();
          resetPaymentsState();
          resetAuthenticatedProfileState();
          resetUserJobState();
          resetNotificationsState();
          resetSelectedLocation();
          return;
        }

        const [
          conversationsResult,
          paymentsResult,
          profileResult,
          jobsAuthResult,
          notificationsResult,
        ] = await Promise.all([
          loadConversationList(),
          loadPaymentsData(),
          refreshProfileState(currentUserId),
          loadAuthenticatedJobData(),
          loadNotifications(),
        ]);

        if (profileResult.data?.profile.location) {
          syncSelectedLocation(profileResult.data.profile.location);
        }

        const combinedSource =
          [
            baseSource,
            conversationsResult.source,
            paymentsResult.methodsResult.source,
            paymentsResult.transactionsResult.source,
            profileResult.source,
            jobsAuthResult.myJobsResult.source,
            jobsAuthResult.applicationsResult.source,
            notificationsResult.source,
          ].includes("fallback")
            ? "fallback"
            : "supabase";

        setDataSource(combinedSource);

        const firstAuthError =
          conversationsResult.error ??
          paymentsResult.methodsResult.error ??
          paymentsResult.transactionsResult.error ??
          profileResult.error ??
          jobsAuthResult.myJobsResult.error ??
          jobsAuthResult.applicationsResult.error ??
          notificationsResult.error;

        if (firstAuthError) {
          setErrorMessage(firstAuthError);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      loadAuthenticatedJobData,
      loadConversationList,
      loadNotifications,
      loadPaymentsData,
      loadPublicProfiles,
      refreshJobsState,
      refreshProfileState,
      resetAuthenticatedProfileState,
      resetChatState,
      resetNotificationsState,
      resetPaymentsState,
      resetSelectedLocation,
      resetUserJobState,
      syncSelectedLocation,
    ],
  );

  useEffect(() => {
    void loadBaseData(effectiveUserId);
  }, [effectiveUserId, loadBaseData]);

  const setManualLocation = useCallback(
    async (location: string) => {
      const result = await setManualLocationState(location);
      if (result.data) {
        updateProfileInState(result.data);
      }
    },
    [setManualLocationState, updateProfileInState],
  );

  const saveUserProfile = useCallback(
    async (input: SaveUserProfileInput) => {
      const result = await saveUserProfileState(input);
      if (result.profile?.location) {
        syncSelectedLocation(result.profile.location);
      }
      return { ok: result.ok, message: result.message };
    },
    [saveUserProfileState, syncSelectedLocation],
  );

  const refreshJobs = useCallback(
    async (params: SearchJobsParams = {}) => {
      const result = await refreshJobsState(params);
      setDataSource(result.source);
    },
    [refreshJobsState],
  );

  const refreshProfile = useCallback(
    async (profileUserId: string) => {
      const result = await refreshProfileState(profileUserId);
      if (result.data?.profile.location) {
        syncSelectedLocation(result.data.profile.location);
      } else if (!profileUserId) {
        syncSelectedLocation(DEFAULT_LOCATION);
      }
      setDataSource(result.source);
    },
    [refreshProfileState, syncSelectedLocation],
  );

  const value = useMemo(
    () => ({
      currentUserId: effectiveUserId,
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
      locationCoords,
      locationStatus,
      locationError,
      requestDeviceLocation,
      setManualLocation,
      saveUserProfile,
      addPublishedJob,
      updatePublishedJob,
      removePublishedJob,
      withdrawMyApplication,
      sendMessage,
      refreshJobs,
      loadJobById,
      refreshProfile,
      refreshChatDetail,
    }),
    [
      effectiveUserId,
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
      locationCoords,
      locationStatus,
      locationError,
      requestDeviceLocation,
      setManualLocation,
      saveUserProfile,
      addPublishedJob,
      updatePublishedJob,
      removePublishedJob,
      withdrawMyApplication,
      sendMessage,
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

export function useCurrentUser() {
  const { currentUserId, profiles } = useAppState();
  return currentUserId ? profiles.find((user) => user.id === currentUserId) ?? null : null;
}
