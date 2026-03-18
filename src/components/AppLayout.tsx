import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, Fuel, Truck, Landmark, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const tabs = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/abastecimento", icon: Fuel, label: "Abastecimento" },
  { to: "/fretes", icon: Truck, label: "Fretes" },
  { to: "/financeiro", icon: Landmark, label: "Financeiro" },
];

const AppLayout = () => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[480px] mx-auto relative">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Logado como</p>
            <p className="font-semibold text-foreground">{user?.name || user?.email || "Usuário"}</p>
            <p className="text-xs text-muted-foreground">Perfil: {role || "N/A"}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card border-t border-border px-2 py-1 z-50">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors min-w-[64px] ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <tab.icon className="w-5 h-5" strokeWidth={2} />
              <span className="text-[11px] font-semibold">{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
