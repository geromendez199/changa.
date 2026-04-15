import { useNavigate } from "react-router";
import { Button } from "../components/Button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-6 pt-20 max-w-md mx-auto font-['Inter']">
      <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
        <p className="text-sm font-semibold text-[#0DAE79] mb-2">404</p>
        <h1 className="text-2xl font-bold text-[#111827] mb-2">Ruta inválida</h1>
        <p className="text-sm text-gray-500 mb-6">La pantalla que buscás no existe o fue movida.</p>
        <Button fullWidth onClick={() => navigate("/home")}>Ir al inicio</Button>
      </div>
    </div>
  );
}
