/**
 * WHY: Make the first screen immediate and easy to understand with just the core brand and auth actions.
 * CHANGED: YYYY-MM-DD
 */
import { useNavigate } from "react-router";
import { BrandLogo } from "../components/BrandLogo";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="app-screen bg-white px-6 pt-12 pb-8">
      <div className="flex min-h-screen flex-col items-center">
        <div className="w-full pt-6 text-center sm:pt-8">
          <div className="inline-flex min-h-28 min-w-[17.5rem] items-center justify-center rounded-[2rem] bg-white px-6 py-4">
            <BrandLogo
              imageClassName="h-20 w-auto object-contain"
              fallbackClassName="text-4xl font-bold tracking-tight text-[#0DAE79]"
              alt="Changa"
            />
          </div>
        </div>

        <div className="mt-12 flex w-full flex-1 flex-col justify-start">
          <div className="w-full max-w-sm space-y-3 self-center">
            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-full bg-[var(--app-brand)] px-6 py-4 text-base font-bold text-white shadow-[0_16px_32px_rgba(13,174,121,0.22)] transition-all duration-200 active:scale-[0.98]"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="w-full rounded-full border-2 border-[var(--app-brand)] bg-white px-6 py-4 text-base font-semibold text-[var(--app-brand)] transition-all duration-200 active:scale-[0.98]"
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
