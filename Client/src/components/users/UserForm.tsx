import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole, User } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface UserFormProps {
  user?: User;
  onSubmit: (userData: Partial<User>) => void;
  isSubmitting?: boolean;
  availableManagers: User[];
  availableTeamLeaders: User[];
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  isSubmitting = false,
  availableManagers,
  availableTeamLeaders,
}) => {
  const { state, canManageRole } = useAuth();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState<UserRole>(user?.role || "user");
  const [managerId, setManagerId] = useState(user?.managerId || "");
  const [tlId, setTlId] = useState(user?.tlId || "");
  const [phoneNum, setPhoneNum] = useState(user?.phoneNum || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [position, setPosition] = useState(user?.position || "");
  const [password, setPassword] = useState("");

  // Only allow selecting roles the current user can manage
  const availableRoles = ["user", "tl", "manager", "admin", "master"].filter(
    (r) => canManageRole(r as UserRole)
  ) as UserRole[];

  // Update local state when user data changes (for edit form)
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setRole(user.role);
      setManagerId(user.managerId || "");
      setTlId(user.tlId || "");
      setPhoneNum(user.phoneNum || "");
      setDepartment(user.department || "");
      setPosition(user.position || "");
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (First Name, Last Name, and Email).",
        variant: "destructive",
      });
      return;
    }

    // Create user data object
    const userData: Partial<User> = {
      firstName,
      lastName,
      email,
      role,
      phoneNum,
      department,
      position,
    };

    // Include password only if adding a new user
    if (!user) {
       if (!password) {
         toast({
            title: "Validation Error",
            description: "Password is required for new users.",
            variant: "destructive",
          });
         return;
       }
       userData.password = password;
    }

    // Include managerId and tlId only if the role requires them and they are selected
    if ((role === "user" || role === "tl") && managerId) {
       userData.managerId = managerId;
    }
     if (role === "user" && tlId) {
       userData.tlId = tlId;
    }

    onSubmit(userData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-sm border border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle className="text-gradient">{user ? "Edit User" : "Add New User"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
                className="bg-black/30 border-white/10 focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
                className="bg-black/30 border-white/10 focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                // Email is read-only when editing an existing user
                disabled={!!user}
                className={`bg-black/30 border-white/10 focus:border-primary/50 ${user ? "bg-black/20 text-white/70" : ""}`}
              />
               {user && <p className="text-sm text-muted-foreground">Email cannot be changed</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger id="role" className="bg-black/30 border-white/10">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {availableRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(role === "user" || role === "tl") && (
              <div className="space-y-2">
                <Label htmlFor="managerId">Manager</Label>
                <Select
                  value={managerId}
                  onValueChange={setManagerId}
                >
                  <SelectTrigger id="managerId" className="bg-black/30 border-white/10">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10">
                    <SelectItem value="none">None</SelectItem>
                    {/* Use availableManagers prop */}
                    {availableManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {role === "user" && (
              <div className="space-y-2">
                <Label htmlFor="tlId">Team Leader</Label>
                <Select
                  value={tlId}
                  onValueChange={setTlId}
                >
                  <SelectTrigger id="tlId" className="bg-black/30 border-white/10">
                    <SelectValue placeholder="Select team leader" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10">
                    <SelectItem value="none">None</SelectItem>
                    {/* Use availableTeamLeaders prop */}
                    {availableTeamLeaders.map((tl) => (
                      <SelectItem key={tl.id} value={tl.id}>
                        {tl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phoneNum">Phone Number</Label>
              <Input
                id="phoneNum"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                placeholder="123-456-7890"
                className="bg-black/30 border-white/10 focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Engineering"
                className="bg-black/30 border-white/10 focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Software Engineer"
                className="bg-black/30 border-white/10 focus:border-primary/50"
              />
            </div>

             {/* Add password field only for new user creation */}
            {!user && (
               <div className="space-y-2 md:col-span-2">
                 <Label htmlFor="password">Password</Label>
                 <Input
                   id="password"
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="Password"
                   required
                   className="bg-black/30 border-white/10 focus:border-primary/50"
                 />
               </div>
            )}

          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" className="border-white/20 hover:bg-white/5">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary/80 hover:bg-primary">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {user ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{user ? "Update User" : "Create User"}</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm;
