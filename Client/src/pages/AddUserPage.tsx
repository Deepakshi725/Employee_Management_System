import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserForm from "@/components/users/UserForm";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api"; // Updated backend API base URL

const AddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managers, setManagers] = useState<User[]>([]); // State for managers
  const [teamLeaders, setTeamLeaders] = useState<User[]>([]); // State for team leaders
  const [isLoadingUsers, setIsLoadingUsers] = useState(true); // Loading state for managers/TLs
  const [usersError, setUsersError] = useState<string | null>(null); // Error state for managers/TLs

  useEffect(() => {
    document.title = "Add User | Employee Management System";
  }, []);

  // Fetch managers and team leaders on component mount
  useEffect(() => {
    const fetchUsersByRole = async () => {
      setIsLoadingUsers(true);
      setUsersError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUsersError("Authentication token not found.");
          setIsLoadingUsers(false);
          return; 
        }

        // Fetch all users and filter by role on frontend for simplicity
        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch users for form');
        }

        const data = await response.json();
        const allUsers: User[] = data.users.map((user: any) => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          role: user.role,
          managerId: user.managerId,
          tlId: user.tlId,
          // Include other necessary fields from backend
        }));

        setManagers(allUsers.filter(user => user.role === 'manager'));
        setTeamLeaders(allUsers.filter(user => user.role === 'tl'));

      } catch (err: any) {
        setUsersError(err.message || 'An error occurred while fetching users for form.');
        console.error("Fetch users for form error:", err);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsersByRole();
  }, []); // Empty dependency array means this runs once on mount

  const handleSubmit = async (userData: Partial<User>) => {
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found. Please log in.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email,
        password: userData.password, // Assuming password field exists in form for new user
        phoneNum: userData.phoneNum, // Assuming phoneNum field exists in form
        role: userData.role,
        department: userData.department,
        position: userData.position,
        tlId: (userData.tlId && userData.tlId !== 'none') ? userData.tlId : null, // Send null if 'none' or empty
        managerId: (userData.managerId && userData.managerId !== 'none') ? userData.managerId : null, // Send null if 'none' or empty
      };

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }
      
      // Success toast
      toast({
        title: "User Created",
        description: `${userData.firstName || userData.email} has been added successfully.`,
      });
      
      // Navigate back to users page
      navigate("/users");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
      console.error("Create user error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/users")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New User</h2>
          <p className="text-muted-foreground">
            Create a new user account in the system
          </p>
        </div>
      </div>

      {isLoadingUsers ? (
        <div className="text-center"><Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" /> Loading form data...</div>
      ) : usersError ? (
        <div className="text-center text-red-500">Error loading form data: {usersError}</div>
      ) : (
        <UserForm 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          availableManagers={managers}
          availableTeamLeaders={teamLeaders}
        />
      )}
    </div>
  );
};

export default AddUserPage;
