import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);

const scheduleServiceWorkerRegistration = () => {
  const registerServiceWorker = () => {
    registerSW({
      immediate: false,
      onRegistered(registration: ServiceWorkerRegistration | undefined) {
        if (import.meta.env.DEV) {
          console.info("[PWA] Service worker registrado", registration);
        }
      },
      onRegisterError(error: Error) {
        console.error("[PWA] No se pudo registrar el service worker", error);
      },
    });
  };

  const scheduleIdle =
    window.requestIdleCallback ??
    ((callback: IdleRequestCallback) =>
      window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 1));

  scheduleIdle(registerServiceWorker, { timeout: 2_000 });
};

if (document.readyState === "complete") {
  scheduleServiceWorkerRegistration();
} else {
  window.addEventListener("load", scheduleServiceWorkerRegistration, { once: true });
}
