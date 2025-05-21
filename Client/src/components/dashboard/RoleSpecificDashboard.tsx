import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole, User } from "@/lib/types";
import DashboardStats from "./DashboardStats";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface RoleSpecificDashboardProps {
  role: UserRole;
}

const API_BASE_URL = "https://employee-management-system-3xbw.onrender.com/api"; // Updated API base URL with /api prefix

const RoleSpecificDashboard: React.FC<RoleSpecificDashboardProps> = ({ role }) => {
  const { state } = useAuth();
  const { toast } = useToast();
  // We no longer need the 'users' state here as stats are fetched separately
  // const [users, setUsers] = useState<User[]>([]); 
  const [isLoadingStats, setIsLoadingStats] = useState(true); // Loading state for stats
  const [statsError, setStatsError] = useState<string | null>(null); // Error state for stats
  const [dashboardStats, setDashboardStats] = useState<Record<string, number>>({}); // State to hold fetched stats

  // We no longer need to fetch all users here for stats
  // useEffect(() => {
  //   const fetchUsersForDashboard = async () => {
  //     setIsLoadingUsers(true);
  //     setUsersError(null);
  //     // ... existing fetch logic ...
  //   };
  //   if (state.isAuthenticated) { 
  //      fetchUsersForDashboard();
  //   }
  // }, [state.isAuthenticated]);

  // New useEffect to fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoadingStats(true);
      setStatsError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoadingStats(false);
          setStatsError("Authentication token not found.");
          return; // Exit if not authenticated
        }

        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch dashboard statistics');
        }

        const data = await response.json();
        setDashboardStats(data.stats); // Set the fetched stats

      } catch (err: any) {
        setStatsError(err.message || 'An error occurred while fetching statistics.');
        console.error("Fetch dashboard stats error:", err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (state.isAuthenticated) { // Fetch stats only if authenticated
       fetchDashboardStats();
    }

  }, [state.isAuthenticated]); // Refetch when authentication state changes

  // Derive stats array for DashboardStats component
  const statsArray = React.useMemo(() => {
    // Use fetched stats if available, fallback to mock data structure but with fetched values
    const baseStats = [
       { title: "Total Employees", value: dashboardStats.totalEmployees, change: 0, icon: "user" },
       { title: "Admins", value: dashboardStats.admins, change: 0, icon: "management" },
       { title: "Managers", value: dashboardStats.managers, change: 0, icon: "management" },
       { title: "Team Leaders", value: dashboardStats.teamLeaders, change: 0, icon: "management" },
       { title: "Users", value: dashboardStats.users, change: 0, icon: "user" },
       // Add other relevant stats from backend response here
    ].filter(stat => stat.value !== undefined); // Filter out stats not returned by backend

    switch (role) {
      case "master":
         // Master might see all employee counts
         return baseStats;
      case "admin":
         // Admin might see managers, TLs, users
         return baseStats.filter(stat => stat.title !== 'Total Employees' && stat.title !== 'Admins');
      case "manager":
         // Manager sees their direct reports (TLs and Users)
        return [
          { title: "Team Leaders", value: dashboardStats.managerTeamLeaders, change: 0, icon: "management" },
          { title: "Team Members", value: dashboardStats.managerTeamMembers, change: 0, icon: "user" },
           // Add other manager-specific stats here
        ].filter(stat => stat.value !== undefined);
      case "tl":
         // TL sees their direct reports (Users)
        return [
          { title: "Team Members", value: dashboardStats.tlTeamMembers, change: 0, icon: "user" },
           // Add other TL-specific stats here
        ].filter(stat => stat.value !== undefined);
      case "user":
      default:
         // Basic user might see personal stats - not covered by current backend endpoint
        return [
           { title: "My Tasks", value: undefined, change: 0, icon: "activity" }, // Mock/Placeholder
           { title: "Completed", value: undefined, change: 0, icon: "activity" }, // Mock/Placeholder
           { title: "Team Members", value: undefined, change: 0, icon: "user" }, // Mock/Placeholder
           { title: "Notifications", value: undefined, change: 0, icon: "notification" }, // Mock/Placeholder
        ];
    }
  }, [role, dashboardStats]); // Recalculate when role or fetched stats change


  const renderRoleSpecificContent = () => {
    switch (role) {
      case "master":
        return (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Organizational Structure</CardTitle>
              </CardHeader>
              <CardContent>
                 {isLoadingStats ? (
                    <div className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading structure...</div>
                  ) : statsError ? (
                    <div className="text-red-500">Error loading structure: {statsError}</div>
                  ) : (
                    <div className="space-y-2">
                       {/* Use data from statsArray */}
                      {statsArray.filter(stat => stat.icon === 'management' || stat.icon === 'user').map(stat => (
                         <div key={stat.title} className="flex justify-between items-center">
                            <span>{stat.title}</span>
                            <span className="font-bold">{stat.value}</span>
                          </div>
                      ))}
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                 {/* This content still uses mock data. Needs backend integration. */}
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between">
                    <span>John Doe promoted to Manager</span>
                    <span className="text-xs text-muted-foreground">Today</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>New Admin account created</span>
                    <span className="text-xs text-muted-foreground">Yesterday</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>5 new employees onboarded</span>
                    <span className="text-xs text-muted-foreground">3 days ago</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>System update completed</span>
                    <span className="text-xs text-muted-foreground">1 week ago</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );

      case "admin":
        return (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Department Overview</CardTitle>
              </CardHeader>
              <CardContent>
                 {/* This content still uses mock data. Needs backend integration. */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Engineering</span>
                    <span className="font-bold">86</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Marketing</span>
                    <span className="font-bold">34</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sales</span>
                    <span className="font-bold">52</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>HR</span>
                    <span className="font-bold">12</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                 {/* This content still uses mock data. Needs backend integration. */}
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between">
                    <span>New manager assigned to Engineering</span>
                    <span className="text-xs text-muted-foreground">Today</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Team Leader promotion request</span>
                    <span className="text-xs text-muted-foreground">Yesterday</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>3 new employees in Marketing</span>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Updated department structure</span>
                    <span className="text-xs text-muted-foreground">1 week ago</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );

      case "manager":
        return (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Team Leaders</CardTitle>
              </CardHeader>
              <CardContent>
                 {isLoadingStats ? (
                    <div className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading team leaders...</div>
                  ) : statsError ? (
                    <div className="text-red-500">Error loading team leaders: {statsError}</div>
                  ) : (
                    <div className="space-y-2">
                       {/* Use data from statsArray */}
                      {statsArray.filter(stat => stat.title === 'Team Leaders').map(stat => (
                         <div key={stat.title} className="flex justify-between items-center">
                            <span>{stat.title}</span>
                            <span className="font-bold">{stat.value}</span>
                          </div>
                      ))}
                      {/* Display actual team leaders if available - This requires fetching the TLs themselves, not just the count */}
                       {/* This part still needs a backend endpoint to get the list of TLs */}
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                 {isLoadingStats ? (
                    <div className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading team members...</div>
                  ) : statsError ? (
                    <div className="text-red-500">Error loading team members: {statsError}</div>
                  ) : (
                    <div className="space-y-2">
                       {/* Use data from statsArray */}
                       {statsArray.filter(stat => stat.title === 'Team Members' && role === 'manager').map(stat => (
                         <div key={stat.title} className="flex justify-between items-center">
                            <span>{stat.title}</span>
                            <span className="font-bold">{stat.value}</span>
                          </div>
                       ))}
                       {/* Display actual team members if available - This requires fetching the users themselves, not just the count */}
                       {/* This part still needs a backend endpoint to get the list of users under this manager */}
                    </div>
                   
                  )}
              </CardContent>
            </Card>
          </div>
        );

      case "tl":
        return (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                    <div className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading team members...</div>
                  ) : statsError ? (
                    <div className="text-red-500">Error loading team members: {statsError}</div>
                  ) : (
                    <div className="space-y-2">
                      {/* Use data from statsArray */}
                       {statsArray.filter(stat => stat.title === 'Team Members' && role === 'tl').map(stat => (
                         <div key={stat.title} className="flex justify-between items-center">
                            <span>{stat.title}</span>
                            <span className="font-bold">{stat.value}</span>
                          </div>
                       ))}
                       {/* Display actual team members if available - This requires fetching the users themselves, not just the count */}
                       {/* This part still needs a backend endpoint to get the list of users under this TL */}
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Tasks Overview</CardTitle>
              </CardHeader>
              <CardContent>
                 {/* This content still uses mock data. Needs backend integration. */}
                 <div className="space-y-2">
                   <div className="flex justify-between items-center">
                    <span>Assigned Tasks</span>
                    <span className="font-bold">35</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completed This Week</span>
                    <span className="font-bold">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Due This Week</span>
                    <span className="font-bold">5</span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span>Pending Review</span>
                    <span className="font-bold">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "user":
      default:
        return (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                 {/* This content still uses mock data. Needs backend integration. */}
                 <div className="space-y-2">
                   <div className="flex justify-between items-center">
                    <span>Assigned Tasks</span>
                    <span className="font-bold">12</span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span>Completed This Week</span>
                    <span className="font-bold">3</span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span>Due This Week</span>
                    <span className="font-bold">2</span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span>Overdue</span>
                    <span className="font-bold">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                 {/* This content still uses mock data. Needs backend integration. */}
                 <ul className="space-y-2 text-sm">
                   <li className="flex items-center justify-between">
                    <span>Performance review scheduled</span>
                    <span className="text-xs text-muted-foreground">Today</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>New task assigned</span>
                    <span className="text-xs text-muted-foreground">Yesterday</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Team meeting reminder</span>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </li>
                   <li className="flex items-center justify-between">
                    <span>Holiday policy update</span>
                    <span className="text-xs text-muted-foreground">1 week ago</span>
                  </li>
                 </ul>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Render loading or error for stats fetch */}
       {isLoadingStats || statsError ? (
        <div className="p-4 text-center text-red-500">
           {isLoadingStats ? <div className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading dashboard stats...</div> : null}
           {statsError ? `Error loading stats: ${statsError}` : null}
        </div>
       ) : (
         <DashboardStats stats={statsArray} />
       )}
      {renderRoleSpecificContent()}
    </div>
  );
};

export default RoleSpecificDashboard;
