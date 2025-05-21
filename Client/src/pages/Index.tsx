
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index: React.FC = () => {
  const { state } = useAuth();
  
  useEffect(() => {
    document.title = "Employee Management System";
  }, []);

  // Redirect to dashboard if authenticated, otherwise to login
  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default Index;
