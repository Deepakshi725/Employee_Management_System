import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserForm from "@/components/users/UserForm";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const API_BASE_URL = "https://employee-management-system-3xbw.onrender.com/api"; // Updated backend API base URL

const EditUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for user data and managers/TLs
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managers, setManagers] = useState<User[]>([]); // State for managers
  const [teamLeaders, setTeamLeaders] = useState<User[]>([]); // State for team leaders
  const [error, setError] = useState<string | null>(null); // Error state for fetching data

  useEffect(() => {
    document.title = "Edit User | Employee Management System";
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast({
            title: "Error",
            description: "Authentication token not found. Please log in.",
            variant: "destructive",
          });
          navigate("/users"); // Redirect if not authenticated
          return;
        }

        // Fetch user data and managers/TLs concurrently
        const [userResponse, allUsersResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/users/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/users`, { // Fetch all users to filter managers/TLs
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
        ]);

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          throw new Error(errorData.message || 'Failed to fetch user data');
        }

         if (!allUsersResponse.ok) {
          const errorData = await allUsersResponse.json();
          throw new Error(errorData.message || 'Failed to fetch users for form');
        }
        
        const userData = await userResponse.json();
        const allUsersData = await allUsersResponse.json();

        // Transform backend user data to frontend User type
        const fetchedUser: User = {
          id: userData.user._id,
          name: `${userData.user.firstName} ${userData.user.lastName}`.trim(),
          email: userData.user.email,
          role: userData.user.role,
          managerId: userData.user.managerId ? userData.user.managerId.toString() : "", // Convert ObjectId to string, handle null/undefined
          tlId: userData.user.tlId ? userData.user.tlId.toString() : "", // Convert ObjectId to string, handle null/undefined
          avatar: userData.user.avatar, // Assuming avatar is returned by backend
          department: userData.user.department,
          position: userData.user.position,
          status: userData.user.status,
          createdAt: userData.user.createdAt,
          firstName: userData.user.firstName,
          lastName: userData.user.lastName,
          phoneNum: userData.user.phoneNum, // Include phoneNum in the mapping
        };
        
        setUser(fetchedUser);

        const allUsers: User[] = allUsersData.users.map((user: any) => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          role: user.role,
          managerId: user.managerId,
          tlId: user.tlId,
          // Include other necessary fields from backend
        }));

        // Convert managerId and tlId to strings in all users list for consistent comparison in form selects
        allUsers.forEach(u => {
           if (u.managerId) u.managerId = u.managerId.toString();
           if (u.tlId) u.tlId = u.tlId.toString();
        });

        setManagers(allUsers.filter(user => user.role === 'manager'));
        setTeamLeaders(allUsers.filter(user => user.role === 'tl'));

      } catch (error: any) {
        setError(error.message || "Failed to load data. Please try again.");
        toast({
          title: "Error",
          description: error.message || "Failed to load user data. Please try again.",
          variant: "destructive",
        });
        console.error("Fetch data error:", error);
        navigate("/users"); // Navigate back on error
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    } else {
       // Handle case where id is not provided in URL
       const idError = "User ID not provided.";
       setError(idError);
       toast({
          title: "Error",
          description: idError,
          variant: "destructive",
        });
       navigate("/users");
    }

  }, [id, navigate, toast]); // Depend on id, navigate, and toast

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

       // Assuming userData might contain a 'name' field from the form.
      // We need to split it into firstName and lastName for the backend if name changed
      // This logic is no longer needed in EditUserPage as UserForm provides firstName and lastName directly.
      // let firstName = userData.firstName;
      // let lastName = userData.lastName;

      // if (userData.name && (!userData.firstName || !userData.lastName)) { // If name is provided but first/last aren't separate
      //    const [fName, ...lNameParts] = userData.name?.split(' ') || [];
      //    firstName = fName || '';
      //    lastName = lNameParts.join(' ') || '';
      // } else if (user && (!userData.name && (userData.firstName || userData.lastName))) {
      //   // If name is not provided but first/last are, update name in frontend state (optional)
      //   userData.name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      // }
      
      const payload: Partial<User> = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNum: userData.phoneNum,
        role: userData.role,
        department: userData.department,
        position: userData.position,
        tlId: userData.tlId || null, // Send null if empty
        managerId: userData.managerId || null, // Send null if empty
        status: userData.status
      };

      // Remove undefined or null fields from payload so backend only updates provided fields
      Object.keys(payload).forEach(key => (payload as any)[key] === undefined || (payload as any)[key] === null && delete (payload as any)[key]);

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
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
      
      // Success toast
      toast({
        title: "User Updated",
        description: `${userData.name || userData.email} has been updated successfully.`,
      });
      
      // Navigate back to users page
      navigate("/users");

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      });
      console.error("Update user error:", error);
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
          <h2 className="text-3xl font-bold tracking-tight">Edit User</h2>
          <p className="text-muted-foreground">
            Update user information and role
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
         <div className="text-center text-red-500">Error loading data: {error}</div>
      ) : user ? (
        <UserForm 
          user={user} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          availableManagers={managers}
          availableTeamLeaders={teamLeaders}
        />
      ) : null} {/* Render nothing if not loading, no error, and no user */}
    </div>
  );
};

export default EditUserPage;
