/**
 * WHY: Keep login focused on the essential action with minimal copy and no extra onboarding decisions.
 * CHANGED: YYYY-MM-DD
 */
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuth } from "../../../context/AuthContext";
import { BrandLogo } from "../../components/BrandLogo";
import { SurfaceCard } from "../../components/SurfaceCard";
import { sanitizeRedirectPath } from "../../utils/navigation";

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.includes("@")) return "Ingresá un email válido.";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    return null;
  };

  const onSubmit = async () => {
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    setError(null);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (!result.ok) return setError(result.message || "No se pudo iniciar sesión.");

    const redirectTo = sanitizeRedirectPath(new URLSearchParams(location.search).get("redirect"));
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="app-screen flex items-center px-[var(--app-shell-padding)] pt-12 pb-10">
      <SurfaceCard className="mx-auto w-full max-w-md" padding="lg">
        <div className="mb-6 flex justify-center">
          <BrandLogo
            imageClassName="h-14 w-auto object-contain"
            fallbackClassName="text-3xl font-bold tracking-tight text-[var(--app-text)]"
            alt="Changa"
          />
        </div>

        <h1 className="mb-6 text-2xl font-bold tracking-normal text-[var(--app-text)]">
          Iniciar sesión
        </h1>

        <div className="space-y-3">
          <Input
            placeholder="Email"
            value={email}
            onChange={setEmail}
            type="email"
            size="lg"
            data-testid="login-email-input"
          />
          <Input
            placeholder="Contraseña"
            value={password}
            onChange={setPassword}
            type="password"
            size="lg"
            data-testid="login-password-input"
          />
        </div>

        {error ? (
          <p
            data-testid="login-error-message"
            className="mt-4 rounded-[18px] border border-red-100 bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6">
          <Button fullWidth onClick={onSubmit} disabled={loading} data-testid="login-submit-button">
            {loading ? "Ingresando..." : "Entrar"}
          </Button>
        </div>

        <p className="mt-5 text-center text-sm text-[var(--app-text-muted)]">
          ¿No tenés cuenta?{" "}
          <Link to="/signup" className="inline-flex min-h-9 items-center rounded-full px-1 font-semibold text-[var(--app-brand)]">
            Crear cuenta
          </Link>
        </p>
      </SurfaceCard>
    </div>
  );
}
