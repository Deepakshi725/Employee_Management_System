
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  User, Users, LogOut, Home, Briefcase,
  Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `sidebar-link ${isActive ? "active" : ""}`
      }
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { state, logout } = useAuth();
  const isMobile = useIsMobile();
  const [expandedSection, setExpandedSection] = useState<string | null>("dashboard");

  if (!state.user) return null;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  const handleNavItemClick = () => {
    if (isMobile) {
      onToggle();
    }
  };

  // Role-based menu items
  const getMenuItems = () => {
    const role = state.user?.role;
    const baseItems = [
      { to: "/dashboard", icon: <Home size={20} />, label: "Dashboard" },
      { to: "/profile", icon: <User size={20} />, label: "My Profile" },
    ];

    // User management permissions based on role
    if (role === "master" || role === "admin" || role === "manager" || role === "tl") {
      baseItems.push({ 
        to: "/users", 
        icon: <Users size={20} />, 
        label: "User Management" 
      });
    }

    return baseItems;
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-sidebar flex flex-col transition-all duration-300 ease-in-out shadow-lg",
        isOpen ? "w-64" : isMobile ? "w-0" : "w-16",
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", !isOpen && !isMobile && "w-0 overflow-hidden")}>
          <Briefcase className="text-primary" size={24} />
          <h1 className={cn("font-bold text-xl text-sidebar-foreground transition-opacity", 
            isOpen ? "opacity-100" : "opacity-0")}>
            EMS
          </h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-sidebar-foreground hover:bg-primary/10">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2 overflow-y-auto scrollbar-hide">
        {getMenuItems().map((item, index) => (
          <NavItem
            key={index}
            to={item.to}
            icon={item.icon}
            label={isOpen || isMobile ? item.label : ""}
            onClick={handleNavItemClick}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start sidebar-link hover:bg-primary/10"
          onClick={logout}
        >
          <LogOut size={20} />
          {(isOpen || isMobile) && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
