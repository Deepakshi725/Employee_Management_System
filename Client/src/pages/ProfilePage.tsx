
import React, { useEffect } from "react";
import ProfileForm from "@/components/profile/ProfileForm";
import { motion } from "framer-motion";

const ProfilePage: React.FC = () => {
  useEffect(() => {
    document.title = "Profile | Employee Management System";
  }, []);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
          My Profile
        </h2>
        <p className="text-muted-foreground">
          View and update your profile information
        </p>
      </div>

      <ProfileForm />
    </motion.div>
  );
};

export default ProfilePage;
