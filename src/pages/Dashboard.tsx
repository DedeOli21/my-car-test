import { useAuth } from "@/context/AuthContext";
import DriverDashboard from "@/components/app/DriverDashboard";
import AdminDashboard from "@/components/app/AdminDashboard";

const Dashboard = () => {
  const { role } = useAuth();

  if (role === "ADMIN") {
    return <AdminDashboard />;
  }

  return <DriverDashboard />;
};

export default Dashboard;
