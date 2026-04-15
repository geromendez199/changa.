import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuth } from "../../../context/AuthContext";

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

    const redirectTo = new URLSearchParams(location.search).get("redirect") || "/home";
    navigate(redirectTo);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-6 pt-16 pb-10 max-w-md mx-auto font-['Inter']">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-1">Iniciar sesión</h1>
        <p className="text-sm text-gray-500 mb-6">Entrá para publicar changas, chatear y gestionar tu perfil.</p>

        <div className="space-y-3">
          <Input placeholder="Email" value={email} onChange={setEmail} type="email" />
          <Input placeholder="Contraseña" value={password} onChange={setPassword} type="password" />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl p-3 mt-4">{error}</p>}

        <div className="mt-5 space-y-3">
          <Button fullWidth onClick={onSubmit} disabled={loading}>{loading ? "Ingresando..." : "Iniciar sesión"}</Button>
          <button disabled className="w-full bg-[#F8FAFC] text-gray-400 border border-gray-200 rounded-full py-3 text-sm font-semibold cursor-not-allowed">Google (Próximamente)</button>
        </div>

        <p className="text-sm text-gray-600 text-center mt-5">
          ¿No tenés cuenta? <Link to="/signup" className="text-[#10B981] font-semibold">Crear cuenta</Link>
        </p>
      </div>
    </div>
  );
}
