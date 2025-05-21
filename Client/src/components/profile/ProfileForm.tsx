import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ProfileForm: React.FC = () => {
  const { state, updateUser } = useAuth();
  const { toast } = useToast();
  // Use local state for form fields, initialized with user data
  const [firstName, setFirstName] = useState(state.user?.firstName || "");
  const [lastName, setLastName] = useState(state.user?.lastName || "");
  const [email] = useState(state.user?.email || ""); // Email is read-only
  const [phoneNum, setPhoneNum] = useState(state.user?.phoneNum || "");
  const [department, setDepartment] = useState(state.user?.department || "");
  const [position, setPosition] = useState(state.user?.position || "");


  // Update local state when user data in context changes (e.g., after a successful update)
  useEffect(() => {
    if (state.user) {
      setFirstName(state.user.firstName || "");
      setLastName(state.user.lastName || "");
      setPhoneNum(state.user.phoneNum || "");
      setDepartment(state.user.department || "");
      setPosition(state.user.position || "");
    }
  }, [state.user]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Use isLoading from context instead of local isSubmitting

    // Prepare data to send to backend
    const updatedData: Partial<User> = {
       // Assuming your backend expects these fields
      firstName,
      lastName,
      phoneNum,
      department,
      position,
      // Do not include email, role, etc. as they are not user-updatable in this form
    };

    await updateUser(updatedData); // Call the context's updateUser function

     // The toast and loading state are now handled by the AuthContext updateUser function
  };

  const getInitials = (name: string) => {
    if (!name) return "?"; // Handle empty name case
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "master":
        return "bg-purple-600";
      case "admin":
        return "bg-blue-600";
      case "manager":
        return "bg-green-600";
      case "tl":
        return "bg-amber-600";
      default:
        return "bg-gray-600";
    }
  };

  if (!state.user) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-sm border border-white/10 shadow-xl">
      <CardHeader className="text-center pb-4">
        <div className="flex flex-col items-center mb-4">
          <Avatar className="h-24 w-24 ring-2 ring-primary/30 shadow-lg">
            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
              {/* Use firstName and lastName to derive initials */}
              {getInitials(`${state.user.firstName || ''} ${state.user.lastName || ''}`.trim())}
            </AvatarFallback>
          </Avatar>
          <div className="mt-4">
            {/* Display combined name */}
            <CardTitle className="text-2xl bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">{`${state.user.firstName || ''} ${state.user.lastName || ''}`.trim()}</CardTitle>
            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getRoleBadgeClass(
                  state.user.role
                )} text-white shadow-glow`}
              >
                {state.user.role.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-black/30 border-white/10 focus:border-primary/50"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-black/30 border-white/10 focus:border-primary/50"
                />
              </div>
            </div>

             <div className="space-y-2">
              <Label htmlFor="phoneNum">Phone Number</Label>
              <Input
                id="phoneNum"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                className="bg-black/30 border-white/10 focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-black/20 border-white/5 text-white/70"
              />
              <p className="text-sm text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                 <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="bg-black/30 border-white/10 focus:border-primary/50"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                 <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="bg-black/30 border-white/10 focus:border-primary/50"
                />
              </div>
            </div>

            {/* Role and Manager/TL fields - display only as they are not updatable by the user on this page */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={state.user.role.charAt(0).toUpperCase() + state.user.role.slice(1)}
                  disabled
                  className="bg-black/20 border-white/5 text-white/70"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={state.user.managerId ? state.user.managerId : 'N/A'} // Display Manager ID, ideally resolve to name
                  disabled
                  className="bg-black/20 border-white/5 text-white/70"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tl">Team Leader</Label>
                <Input
                  id="tl"
                  value={state.user.tlId ? state.user.tlId : 'N/A'} // Display TL ID, ideally resolve to name
                  disabled
                  className="bg-black/20 border-white/5 text-white/70"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  value={state.user.status ? state.user.status.charAt(0).toUpperCase() + state.user.status.slice(1) : 'N/A'}
                  disabled
                  className="bg-black/20 border-white/5 text-white/70"
                />
              </div>
            </div>

          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-all duration-300 shadow-glow-sm"
              disabled={state.isLoading} // Use isLoading from context
            >
              {state.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
