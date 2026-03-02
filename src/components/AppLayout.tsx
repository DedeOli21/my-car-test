import { NavLink, Outlet } from "react-router-dom";
import { Home, Fuel, Truck, Landmark } from "lucide-react";

const tabs = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/abastecimento", icon: Fuel, label: "Abastecimento" },
  { to: "/fretes", icon: Truck, label: "Fretes" },
  { to: "/financeiro", icon: Landmark, label: "Financeiro" },
];

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[480px] mx-auto relative">
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Tab Navigation */}
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
              <tab.icon className="w-6 h-6" strokeWidth={2} />
              <span className="text-[11px] font-semibold">{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
