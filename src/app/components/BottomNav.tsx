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
      <div className="app-content-shell px-3 sm:px-4 lg:px-6">
        <div className="mx-auto flex h-[var(--app-bottom-nav-height)] w-full max-w-[720px] items-center justify-between gap-1 sm:gap-2">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigateItem(item.path, item.requiresAuth)}
                data-testid={`bottom-nav-${item.label.toLowerCase()}`}
                className="flex -mt-7 flex-col items-center justify-center sm:-mt-8"
              >
                <div className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full bg-[linear-gradient(135deg,#0DAE79_0%,#0B9A6B_100%)] shadow-[0_16px_32px_rgba(13,174,121,0.28)] transition-all duration-200 active:scale-95 sm:h-14 sm:w-14">
                  <item.icon size={22} className="text-white sm:h-6 sm:w-6" strokeWidth={2.5} />
                </div>
                <span className="mt-1.5 text-[var(--app-bottom-nav-label-size)] font-semibold text-[var(--app-text-muted)] sm:mt-2">
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
              data-testid={`bottom-nav-${item.label.toLowerCase()}`}
              aria-current={isActive(item.path) ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 transition-all duration-200 sm:max-w-[108px] sm:rounded-[20px] sm:px-3 ${
                isActive(item.path) ? "bg-[var(--app-brand-soft)]" : "bg-transparent"
              }`}
            >
              <item.icon
                size={20}
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
      </div>
    </nav>
  );
}
