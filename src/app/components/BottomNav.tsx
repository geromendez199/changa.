import { Home, Search, Plus, Briefcase, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/home", icon: Home, label: "Inicio" },
    { path: "/search", icon: Search, label: "Buscar" },
    { path: "/publish", icon: Plus, label: "Publicar", isCenter: true, requiresAuth: true },
    { path: "/my-jobs", icon: Briefcase, label: "Trabajos", requiresAuth: true },
    { path: userId ? "/profile" : "/login", icon: User, label: userId ? "Perfil" : "Ingresar" },
  ];

  const navigateItem = (path: string, requiresAuth?: boolean) => {
    if (requiresAuth && !userId) {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pb-safe max-w-md mx-auto z-50">
      <div className="flex justify-around items-center h-20">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <button key={item.path} onClick={() => navigateItem(item.path, item.requiresAuth)} className="flex flex-col items-center justify-center -mt-8">
                <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full p-4 shadow-lg shadow-[#10B981]/30 hover:shadow-xl hover:shadow-[#10B981]/40 transition-all duration-200 active:scale-95">
                  <item.icon size={24} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-medium text-gray-500 mt-2">{item.label}</span>
              </button>
            );
          }

          return (
            <button key={item.path} onClick={() => navigateItem(item.path, item.requiresAuth)} className="flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-2xl transition-all duration-200 min-w-[64px]">
              <item.icon size={24} className={`transition-colors ${isActive(item.path) ? "text-[#10B981]" : "text-gray-400"}`} strokeWidth={isActive(item.path) ? 2.5 : 2} />
              <span className={`text-[10px] font-medium transition-colors ${isActive(item.path) ? "text-[#10B981]" : "text-gray-500"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
