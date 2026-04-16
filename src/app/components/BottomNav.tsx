/**
 * WHY: Tighten bottom navigation hierarchy so primary navigation feels calmer, clearer, and more premium on mobile.
 * CHANGED: YYYY-MM-DD
 */
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
    <nav className="app-floating-bar fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="app-content-shell flex h-[var(--app-bottom-nav-height)] items-center justify-around px-4 sm:px-6 lg:px-10">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigateItem(item.path, item.requiresAuth)}
                className="flex -mt-8 flex-col items-center justify-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0DAE79_0%,#0B9A6B_100%)] shadow-[0_16px_32px_rgba(13,174,121,0.28)] transition-all duration-200 active:scale-95">
                  <item.icon size={24} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="mt-2 text-[var(--app-bottom-nav-label-size)] font-semibold text-[var(--app-text-muted)]">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigateItem(item.path, item.requiresAuth)}
              aria-current={isActive(item.path) ? "page" : undefined}
              className={`flex min-w-[68px] flex-col items-center justify-center gap-1 rounded-[20px] px-3 py-2 transition-all duration-200 ${
                isActive(item.path) ? "bg-[var(--app-brand-soft)]" : "bg-transparent"
              }`}
            >
              <item.icon
                size={22}
                className={`transition-colors ${
                  isActive(item.path) ? "text-[var(--app-brand)]" : "text-[#96a39d]"
                }`}
                strokeWidth={isActive(item.path) ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  isActive(item.path) ? "text-[var(--app-brand)]" : "text-[var(--app-text-muted)]"
                }`}
                style={{ fontSize: "var(--app-bottom-nav-label-size)" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
