
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";
import { Briefcase } from "lucide-react";

const LoginPage: React.FC = () => {
  const { state } = useAuth();

  useEffect(() => {
    // Update document title
    document.title = "Login | Employee Management System";
  }, []);

  // Redirect if user is already authenticated
  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center mb-6">
          <Briefcase className="text-primary mr-2" size={40} />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            EMS
          </h1>
        </div>
        <h1 className="text-2xl font-medium">Employee Management System</h1>
        <p className="text-muted-foreground mt-2">
          Sign in to access your dashboard
        </p>
      </div>

      <LoginForm />

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p className="mb-2">
          Demo access: 
        </p>
        <p>Email: master@example.com (or admin/manager/tl/user@example.com)</p>
        <p>Password: password</p>
      </div>
    </div>
  );
};

export default LoginPage;
