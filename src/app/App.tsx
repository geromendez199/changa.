import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppStateProvider } from "./hooks/useAppState";
import { AuthProvider } from "../context/AuthContext";
import { AppToaster } from "./components/AppToaster";

export default function App() {
  return (
    <AuthProvider>
      <AppStateProvider>
        <RouterProvider router={router} />
        <AppToaster />
      </AppStateProvider>
    </AuthProvider>
  );
}
