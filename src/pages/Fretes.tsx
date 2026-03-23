import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DriverFretes from "@/components/app/DriverFretes";
import AdminFretes from "@/components/app/AdminFretes";

const Fretes = () => {
  const { role } = useAuth();

  if (role === "DRIVER") {
    return <DriverFretes />;
  }

  return <AdminFretes />;
};

export default Fretes;
