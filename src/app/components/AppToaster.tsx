/**
 * WHY: Provide consistent success and error feedback across key marketplace actions without adding a custom notification system.
 * CHANGED: YYYY-MM-DD
 */
import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      expand={false}
      closeButton
      toastOptions={{
        duration: 2600,
        style: {
          background: "#FFFFFF",
          color: "#111827",
          border: "1px solid #E5E7EB",
          boxShadow: "0 18px 40px rgba(17, 24, 39, 0.12)",
        },
      }}
    />
  );
}
