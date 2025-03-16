"use client"

import { useAuth } from "@/lib/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, KeyRound } from "lucide-react"
import { useDashboardStats } from "@/hooks/admin/use-dashboard"
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"

interface Activity {
  type: 'user_registered' | 'role_updated' | 'permission_added';
  entity: 'user' | 'role' | 'permission';
  data: { name?: string; email?: string };
  timestamp: string;
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { data, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[500px] w-full flex-col items-center justify-center gap-2">
        <p className="text-xl font-semibold text-destructive">Error loading dashboard data</p>
        <p className="text-muted-foreground">Please try refreshing the page</p>
      </div>
    )
  }

  const { stats, recentActivities } = data || { 
    stats: { 
      users: { total: 0, newThisWeek: 0 }, 
      roles: { total: 0, types: [] },
      permissions: { total: 0, newThisMonth: 0 }
    },
    recentActivities: []
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.users.newThisWeek} from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.roles.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.roles.types.map((t: string) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <KeyRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.permissions.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.permissions.newThisMonth} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Overview of recent system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.slice(0, 5).map((activity: Activity, index: number) => (
                <div key={index} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    {activity.entity === 'user' && <Users className="h-4 w-4 text-primary" />}
                    {activity.entity === 'role' && <Shield className="h-4 w-4 text-primary" />}
                    {activity.entity === 'permission' && <KeyRound className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {activity.type === 'user_registered' && 'New user registered'}
                      {activity.type === 'role_updated' && 'Role updated'}
                      {activity.type === 'permission_added' && 'New permission added'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-muted-foreground">No recent activities</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

