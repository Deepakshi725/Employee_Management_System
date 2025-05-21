export type UserRole = "master" | "admin" | "manager" | "tl" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  managerId?: string;
  tlId?: string;
  avatar?: string;
  department?: string;
  position?: string;
  status?: 'active' | 'inactive';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type: "info" | "warning" | "success" | "error";
}

export interface DashboardStat {
  title: string;
  value: number;
  change: number;
  icon: string;
}
