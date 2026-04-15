import type { ReactElement } from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router";
import { Welcome } from "./screens/Welcome";
import { Home } from "./screens/Home";
import { SearchResults } from "./screens/SearchResults";
import { JobDetail } from "./screens/JobDetail";
import { PublishJob } from "./screens/PublishJob";
import { MyJobs } from "./screens/MyJobs";
import { Chat } from "./screens/Chat";
import { Profile } from "./screens/Profile";
import { Payments } from "./screens/Payments";
import { ChatDetail } from "./screens/chat/ChatDetail";
import { EditProfile } from "./screens/profile/EditProfile";
import { PublishConfirmation } from "./screens/publish/PublishConfirmation";
import { NotFound } from "./screens/NotFound";
import { Login } from "./screens/auth/Login";
import { Signup } from "./screens/auth/Signup";
import { useAuth } from "../context/AuthContext";
import { Notifications } from "./screens/Notifications";

function RequireAuth({ children }: { children: ReactElement }) {
  const { userId, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-[#F8FAFC] px-6 pt-20 max-w-md mx-auto font-['Inter'] text-gray-500">Cargando sesión...</div>;
  }

  if (!userId) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}

export const router = createBrowserRouter([
  { path: "/", element: <Welcome /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/home", element: <Home /> },
  { path: "/search", element: <SearchResults /> },
  { path: "/job/:id", element: <JobDetail /> },
  { path: "/publish", element: <RequireAuth><PublishJob /></RequireAuth> },
  { path: "/publish/confirm/:id", element: <RequireAuth><PublishConfirmation /></RequireAuth> },
  { path: "/my-jobs", element: <RequireAuth><MyJobs /></RequireAuth> },
  { path: "/chat", element: <RequireAuth><Chat /></RequireAuth> },
  { path: "/chat/:id", element: <RequireAuth><ChatDetail /></RequireAuth> },
  { path: "/profile", element: <RequireAuth><Profile /></RequireAuth> },
  { path: "/profile/edit", element: <RequireAuth><EditProfile /></RequireAuth> },
  { path: "/payments", element: <RequireAuth><Payments /></RequireAuth> },
  { path: "/notifications", element: <RequireAuth><Notifications /></RequireAuth> },
  { path: "*", element: <NotFound /> },
]);
