
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import RoleSpecificDashboard from "@/components/dashboard/RoleSpecificDashboard";
import { motion } from "framer-motion";

const DashboardPage: React.FC = () => {
  const { state } = useAuth();

  useEffect(() => {
    document.title = "Dashboard | Employee Management System";
  }, []);

  if (!state.user) return null;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-muted-foreground mt-2">
          Welcome back, <span className="text-primary font-medium">{state.user.name}</span>!
        </p>
      </div>

      <RoleSpecificDashboard role={state.user.role} />
    </motion.div>
  );
};

export default DashboardPage;
