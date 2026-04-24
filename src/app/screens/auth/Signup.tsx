/**
 * WHY: Keep sign-up simple and direct so the account creation flow feels lightweight and easy to understand.
 * CHANGED: YYYY-MM-DD
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuth } from "../../../context/AuthContext";
import { BrandLogo } from "../../components/BrandLogo";
import { SurfaceCard } from "../../components/SurfaceCard";

export function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.includes("@")) return "Ingresá un email válido.";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    if (password !== confirmPassword) return "Las contraseñas no coinciden.";
    return null;
  };

  const onSubmit = async () => {
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await signUp(email.trim(), password);
    setLoading(false);

    if (!result.ok) return setError(result.message || "No se pudo crear la cuenta.");

    setSuccess("Cuenta creada con éxito.");
    toast.success("Cuenta creada", {
      description: "Ya podés iniciar sesión.",
    });
    setTimeout(() => navigate("/login"), 900);
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
          Crear cuenta
        </h1>

        <div className="space-y-3">
          <Input placeholder="Email" value={email} onChange={setEmail} type="email" size="lg" />
          <Input
            placeholder="Contraseña"
            value={password}
            onChange={setPassword}
            type="password"
            size="lg"
          />
          <Input
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={setConfirmPassword}
            type="password"
            size="lg"
          />
        </div>

        {error ? (
          <p className="mt-4 rounded-[18px] border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="mt-4 rounded-[18px] border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}

        <div className="mt-6">
          <Button fullWidth onClick={onSubmit} disabled={loading}>
            {loading ? "Creando..." : "Crear cuenta"}
          </Button>
        </div>

        <p className="mt-5 text-center text-sm text-[var(--app-text-muted)]">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="inline-flex min-h-9 items-center rounded-full px-1 font-semibold text-[var(--app-brand)]">
            Iniciar sesión
          </Link>
        </p>
      </SurfaceCard>
    </div>
  );
}
