import { useAuth } from "@/context/AuthContext";
import AdminAbastecimento from "@/components/app/AdminAbastecimento";
import DriverAbastecimento from "@/components/app/DriverAbastecimento";

const Abastecimento = () => {
  const { role } = useAuth();

  if (role === "ADMIN") {
    return <AdminAbastecimento />;
  }

  return <DriverAbastecimento />;
};

export default Abastecimento;
