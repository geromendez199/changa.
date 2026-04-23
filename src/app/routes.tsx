import {
  Suspense,
  lazy,
  type ComponentType,
  type LazyExoticComponent,
  type ReactElement,
} from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { IS_DEVELOPMENT_FALLBACK } from "../services/service.utils";
import { BrandLogo } from "./components/BrandLogo";
import { NotFound } from "./screens/NotFound";

type RouteComponent = LazyExoticComponent<ComponentType<Record<string, never>>>;

const WelcomeScreen = lazy(() => import("./screens/Welcome").then((module) => ({ default: module.Welcome })));
const LoginScreen = lazy(() => import("./screens/auth/Login").then((module) => ({ default: module.Login })));
const SignupScreen = lazy(() => import("./screens/auth/Signup").then((module) => ({ default: module.Signup })));
const HomeScreen = lazy(() => import("./screens/Home").then((module) => ({ default: module.Home })));
const SearchResultsScreen = lazy(() =>
  import("./screens/SearchResults").then((module) => ({ default: module.SearchResults })),
);
const JobDetailScreen = lazy(() =>
  import("./screens/JobDetail").then((module) => ({ default: module.JobDetail })),
);
const PublishJobScreen = lazy(() =>
  import("./screens/PublishJob").then((module) => ({ default: module.PublishJob })),
);
const PublishConfirmationScreen = lazy(() =>
  import("./screens/publish/PublishConfirmation").then((module) => ({
    default: module.PublishConfirmation,
  })),
);
const MyJobsScreen = lazy(() => import("./screens/MyJobs").then((module) => ({ default: module.MyJobs })));
const ChatScreen = lazy(() => import("./screens/Chat").then((module) => ({ default: module.Chat })));
const ChatDetailScreen = lazy(() =>
  import("./screens/chat/ChatDetail").then((module) => ({ default: module.ChatDetail })),
);
const ProfileScreen = lazy(() => import("./screens/Profile").then((module) => ({ default: module.Profile })));
const EditProfileScreen = lazy(() =>
  import("./screens/profile/EditProfile").then((module) => ({ default: module.EditProfile })),
);
const PaymentsScreen = lazy(() =>
  import("./screens/Payments").then((module) => ({ default: module.Payments })),
);
const NotificationsScreen = lazy(() =>
  import("./screens/Notifications").then((module) => ({ default: module.Notifications })),
);

function LoadingState({ message }: { message: string }) {
  return (
    <div className="app-screen bg-[#F8FAFC] px-6 pt-20 font-['Inter'] text-gray-500 lg:px-10">
      <div className="app-content-shell">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 text-center">
          <BrandLogo className="flex justify-center" imageClassName="h-12 w-auto object-contain" />
          <p className="mt-3">{message}</p>
        </div>
      </div>
    </div>
  );
}

function RouteView({ Component }: { Component: RouteComponent }) {
  return (
    <Suspense fallback={<LoadingState message="Cargando pantalla..." />}>
      <Component />
    </Suspense>
  );
}

function RequireAuth({ children }: { children: ReactElement }) {
  const { userId, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Cargando sesión..." />;
  }

  if (!userId) {
    if (IS_DEVELOPMENT_FALLBACK) {
      return children;
    }

    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}

function ProtectedRoute({ Component }: { Component: RouteComponent }) {
  return (
    <RequireAuth>
      <RouteView Component={Component} />
    </RequireAuth>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <RouteView Component={WelcomeScreen} /> },
  { path: "/login", element: <RouteView Component={LoginScreen} /> },
  { path: "/signup", element: <RouteView Component={SignupScreen} /> },
  { path: "/home", element: <RouteView Component={HomeScreen} /> },
  { path: "/search", element: <RouteView Component={SearchResultsScreen} /> },
  { path: "/job/:id", element: <RouteView Component={JobDetailScreen} /> },
  { path: "/publish", element: <ProtectedRoute Component={PublishJobScreen} /> },
  {
    path: "/publish/confirm/:id",
    element: <ProtectedRoute Component={PublishConfirmationScreen} />,
  },
  { path: "/jobs", element: <Navigate to="/my-jobs" replace /> },
  { path: "/my-jobs", element: <ProtectedRoute Component={MyJobsScreen} /> },
  { path: "/chat", element: <ProtectedRoute Component={ChatScreen} /> },
  { path: "/chat/:id", element: <ProtectedRoute Component={ChatDetailScreen} /> },
  { path: "/profile", element: <ProtectedRoute Component={ProfileScreen} /> },
  { path: "/profile/edit", element: <ProtectedRoute Component={EditProfileScreen} /> },
  { path: "/payments", element: <ProtectedRoute Component={PaymentsScreen} /> },
  { path: "/notifications", element: <ProtectedRoute Component={NotificationsScreen} /> },
  { path: "*", element: <NotFound /> },
]);
