import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppStateProvider } from "./hooks/useAppState";
import { AuthProvider } from "../context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <AppStateProvider>
        <RouterProvider router={router} />
      </AppStateProvider>
    </AuthProvider>
  );
}
