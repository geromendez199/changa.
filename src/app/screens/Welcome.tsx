import { Search } from "lucide-react";
import { useNavigate } from "react-router";
import { BrandLogo } from "../components/BrandLogo";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0DAE79] via-[#0B9A6B] to-[#087A55] flex flex-col items-center justify-between px-6 py-12 max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center min-w-52 min-h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 shadow-xl px-6">
            <BrandLogo
              imageClassName="h-10 w-auto object-contain"
              fallbackClassName="text-4xl font-bold tracking-tight text-white"
              alt="Changa"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <p className="text-white/90 font-medium">Tu marketplace local</p>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
          </div>
        </div>

        <div className="text-center max-w-sm space-y-3 mb-12">
          <h2 className="text-2xl font-bold text-white leading-tight">Encontrá trabajos cerca tuyo</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Conectá con personas de confianza en tu zona para cualquier tipo de servicio
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
          {["Rápido", "Seguro", "Fácil"].map((feature) => (
            <div
              key={feature}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20"
            >
              <p className="text-white font-semibold text-sm">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full space-y-4 relative z-10">
        <button
          onClick={() => navigate("/home")}
          className="w-full bg-white text-[#0DAE79] py-4 px-6 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <Search size={24} strokeWidth={2.5} />
          Explorar changas
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full bg-white/10 backdrop-blur-sm border-2 border-white text-white py-4 px-6 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-200 active:scale-[0.98]"
        >
          Iniciar sesión
        </button>

        <button
          onClick={() => navigate("/signup")}
          className="w-full bg-white/5 backdrop-blur-sm border border-white/60 text-white py-3.5 px-6 rounded-full font-semibold text-base hover:bg-white/15 transition-all duration-200 active:scale-[0.98]"
        >
          Crear cuenta
        </button>

        <p className="text-center text-white/60 text-sm mt-6">Unite y conseguí changas reales cerca tuyo</p>
      </div>
    </div>
  );
}
