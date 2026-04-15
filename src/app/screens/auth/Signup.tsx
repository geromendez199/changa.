import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuth } from "../../../context/AuthContext";
import { BrandLogo } from "../../components/BrandLogo";

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

    setSuccess("Cuenta creada con éxito. Ya podés iniciar sesión.");
    setTimeout(() => navigate("/login"), 900);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-6 pt-16 pb-10 max-w-md mx-auto font-['Inter']">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="mb-5 flex justify-center">
          <BrandLogo
            imageClassName="h-14 w-auto object-contain"
            fallbackClassName="text-3xl font-bold tracking-tight text-[#111827]"
            alt="Changa"
          />
        </div>

        <h1 className="text-2xl font-bold text-[#111827] mb-1">Crear cuenta</h1>
        <p className="text-sm text-gray-500 mb-6">Empezá a usar Changa con tu email y contraseña.</p>

        <div className="space-y-3">
          <Input placeholder="Email" value={email} onChange={setEmail} type="email" />
          <Input placeholder="Contraseña" value={password} onChange={setPassword} type="password" />
          <Input placeholder="Confirmar contraseña" value={confirmPassword} onChange={setConfirmPassword} type="password" />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl p-3 mt-4">{error}</p>}
        {success && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-2xl p-3 mt-4">{success}</p>}

        <div className="mt-5">
          <Button fullWidth onClick={onSubmit} disabled={loading}>{loading ? "Creando cuenta..." : "Crear cuenta"}</Button>
        </div>

        <p className="text-sm text-gray-600 text-center mt-5">
          ¿Ya tenés cuenta? <Link to="/login" className="text-[#0DAE79] font-semibold">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
