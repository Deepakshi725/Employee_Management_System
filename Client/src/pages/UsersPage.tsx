import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UserTable from "@/components/users/UserTable";
import UserFilters from "@/components/users/UserFilters";
import { useAuth } from "@/context/AuthContext";
import { User, UserRole } from "@/lib/types";

const API_BASE_URL = "https://employee-management-system-3xbw.onrender.com/api"; // Updated backend API base URL

const UsersPage: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");

  useEffect(() => {
    document.title = "User Management | Employee Management System";
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        setError("Authentication token not found.");
        // Redirect to login or handle unauthorized state
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      const fetchedUsers: User[] = data.users.map((user: any) => ({
        id: user._id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: user.role,
        managerId: user.managerId,
        tlId: user.tlId,
        avatar: user.avatar, // Assuming avatar is returned by backend
        department: user.department,
        position: user.position,
        status: user.status,
        createdAt: user.createdAt,
      }));
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching users.');
      console.error("Fetch users error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []); // fetchUsers has no external dependencies, so useCallback is fine

  useEffect(() => {
    if (state.isAuthenticated) { // Fetch users only if authenticated
       fetchUsers();
    }
  }, [state.isAuthenticated, fetchUsers]); // Refetch when authentication state or fetchUsers changes

  // Handler for when a user is successfully deleted
  const handleUserDeleted = () => {
    fetchUsers(); // Re-fetch the user list
  };

  // Filter users based on role and search term (frontend filtering for now)
  const filteredUsers = users.filter((user) => {
    const matchesSearchTerm =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    
    return matchesSearchTerm && matchesRole;
  });

  if (!state.isAuthenticated) {
    // Optionally show a message or redirect to login if not authenticated
    return <div className="p-4 text-center text-red-500">Please log in to view users.</div>;
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading users...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage your employees and their roles
          </p>
        </div>
         {/* Only allow master and admin to add users */}
        {state.user?.role && (state.user.role === 'master' || state.user.role === 'admin') && (
           <Button onClick={() => navigate("/users/add")}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        )}
      </div>

      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
      />

      <UserTable users={filteredUsers} onUserDeleted={handleUserDeleted} />
    </div>
  );
};

export default UsersPage;
