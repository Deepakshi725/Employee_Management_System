import React, { createContext, useContext, useReducer, useEffect } from "react";
import { AuthState, User, UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const API_BASE_URL = "http://localhost:5000/api"; // Updated backend API base URL

const AuthReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      localStorage.removeItem("token"); // Remove token on logout
      return {
        ...initialState,
      };
    case "UPDATE_USER":
      // Note: UPDATE_USER currently only updates frontend state. 
      // For persistence, a backend API call would be needed here.
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

interface AuthContextProps {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  canManageRole: (role: UserRole) => boolean;
}

export const AuthContext = createContext<AuthContextProps>({
  state: initialState,
  login: async () => {},
  logout: () => {},
  updateUser: async () => {},
  canManageRole: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);
  const { toast } = useToast();

  // Check for stored auth on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          
          const data = await response.json();
          // Transform backend user data to frontend User type
          const user: User = {
            id: data.user._id,
            name: `${data.user.firstName} ${data.user.lastName}`.trim(),
            email: data.user.email,
            role: data.user.role,
            managerId: data.user.managerId,
            tlId: data.user.tlId,
            avatar: data.user.avatar, // Assuming avatar is returned by backend
            department: data.user.department,
            position: data.user.position,
            status: data.user.status,
            createdAt: data.user.createdAt,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            phoneNum: data.user.phoneNum,
          };
          dispatch({ type: "LOGIN_SUCCESS", payload: user });
        } catch (error: any) {
          console.error("Error loading user:", error);
          localStorage.removeItem("token"); // Clear invalid token
          dispatch({ type: "LOGOUT" }); // Go to logged out state
        }
      } else {
         dispatch({ type: "LOGOUT" }); // Ensure logged out state if no token
      }
    };

    loadUser();
  }, []); // Empty dependency array means this runs once on mount

  // Login function using backend API
  const login = async (email: string, password: string) => {
    dispatch({ type: "LOGIN_START" });

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        dispatch({ type: "LOGIN_FAILURE", payload: data.message || "Login failed" });
        toast({
          title: "Login Failed",
          description: data.message || "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Store token and user data (important for persistence)
      localStorage.setItem("token", data.token);
       // Transform backend user data to frontend User type
       const user: User = {
        id: data.user._id,
        name: `${data.user.firstName} ${data.user.lastName}`.trim(),
        email: data.user.email,
        role: data.user.role,
        managerId: data.user.managerId,
        tlId: data.user.tlId,
        avatar: data.user.avatar, // Assuming avatar is returned by backend
        department: data.user.department,
        position: data.user.position,
        status: data.user.status,
        createdAt: data.user.createdAt,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phoneNum: data.user.phoneNum,
      };

      dispatch({ type: "LOGIN_SUCCESS", payload: user });
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`, // Use user.name derived from firstName/lastName
      });
    } catch (error: any) {
      console.error("Login error:", error);
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.message || "An error occurred. Please try again.",
      });
      toast({
        title: "Login Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    // Optionally call backend logout endpoint if needed (e.g., for token invalidation)
    // fetch(`${API_BASE_URL}/logout`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    dispatch({ type: "LOGOUT" });
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  // Function to update user using backend API
  const updateUser = async (userData: Partial<User>) => {
    if (!state.user) {
       toast({
         title: "Error",
         description: "User not logged in.",
         variant: "destructive",
       });
       return; // Cannot update if no user is logged in
    }

    // Add a check to ensure user ID is available
    if (!state.user.id) {
       toast({
         title: "Error",
         description: "User ID is missing. Cannot update profile.",
         variant: "destructive",
       });
       console.error("User ID is missing in auth state.", state.user);
       return;
    }

    dispatch({ type: "LOGIN_START" }); // Use LOGIN_START to indicate loading

    try {
      const token = localStorage.getItem("token");
      if (!token) {
         dispatch({ type: "LOGIN_FAILURE", payload: "Authentication token not found." });
         toast({
           title: "Error",
           description: "Authentication token not found. Please log in.",
           variant: "destructive",
         });
        return; // Exit if no token
      }
      
      // Prepare payload - assuming backend expects firstName, lastName, etc.
      // Need to derive firstName/lastName if only 'name' is provided in userData
      let payload: any = { ...userData };
      if (userData.name && (!userData.firstName && !userData.lastName)) {
         const [firstName, ...lastNameParts] = userData.name.split(' ');
         payload.firstName = firstName || '';
         payload.lastName = lastNameParts.join(' ') || '';
         delete payload.name; // Remove 'name' as backend expects first/lastName
      }

      const response = await fetch(`${API_BASE_URL}/users/${state.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user');
      }
      
      // Update frontend state with the response data (backend should return the updated user)
       const updatedUser: User = { // Transform backend user data
        id: data.user._id,
        name: `${data.user.firstName} ${data.user.lastName}`.trim(),
        email: data.user.email,
        role: data.user.role,
        managerId: data.user.managerId,
        tlId: data.user.tlId,
        avatar: data.user.avatar,
        department: data.user.department,
        position: data.user.position,
        status: data.user.status,
        createdAt: data.user.createdAt,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phoneNum: data.user.phoneNum,
      };

      dispatch({ type: "UPDATE_USER", payload: updatedUser }); // Use UPDATE_USER action

       toast({
         title: "Profile Updated",
         description: "Your profile has been updated successfully.",
       });

    } catch (error: any) {
      console.error("Update user error:", error);
      dispatch({ type: "LOGIN_FAILURE", payload: error.message || "An error occurred during update." }); // Use LOGIN_FAILURE for update errors
       toast({
         title: "Update Failed",
         description: error.message || "Failed to update profile. Please try again.",
         variant: "destructive",
       });
    }
     // Note: No 'finally' here to keep isLoading true on success until a subsequent action changes it,
     // or you can add a success action type to set isLoading to false.
  };

  // Helper to check if current user can manage a specific role
  const canManageRole = (role: UserRole): boolean => {
    if (!state.user) return false;

    const roleHierarchy: Record<UserRole, number> = {
      master: 4,
      admin: 3,
      manager: 2,
      tl: 1,
      user: 0,
    };

    const userRoleLevel = roleHierarchy[state.user.role];
    const targetRoleLevel = roleHierarchy[role];

    // Master can manage any role except potentially another master (handled by UI logic)
    if (state.user.role === 'master') {
      return true; // Master can manage any role below them
    }

    // For other roles, use the strict hierarchy check
    return userRoleLevel > targetRoleLevel;
  };

  return (
    <AuthContext.Provider
      value={{ state, login, logout, updateUser, canManageRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
