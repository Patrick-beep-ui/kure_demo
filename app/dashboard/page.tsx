"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { clinicApi } from "@/lib/api-service"
import { Users, Calendar, Stethoscope, Package, TrendingUp, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
  total_students: number
  appointments_today: number
  consultations_today: number
  low_stock_items: number
  pending_appointments: number
  active_chronic_conditions: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const data = await clinicApi.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats?.total_students || 0,
      icon: Users,
      description: "Registered in system",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Appointments Today",
      value: stats?.appointments_today || 0,
      icon: Calendar,
      description: "Scheduled for today",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "Consultations Today",
      value: stats?.consultations_today || 0,
      icon: Stethoscope,
      description: "Completed today",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Low Stock Items",
      value: stats?.low_stock_items || 0,
      icon: Package,
      description: "Need reordering",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      title: "Pending Appointments",
      value: stats?.pending_appointments || 0,
      icon: AlertCircle,
      description: "Awaiting confirmation",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      title: "Chronic Conditions",
      value: stats?.active_chronic_conditions || 0,
      icon: TrendingUp,
      description: "Active cases",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of the clinic's current status.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stat.value}</div>}
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30">
                  <Calendar className="size-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New appointment scheduled</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30">
                  <Stethoscope className="size-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Consultation completed</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/30">
                  <Package className="size-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Low stock alert</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <a
                href="/dashboard/appointments"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <Calendar className="size-5 text-primary" />
                <span className="text-sm font-medium">Schedule Appointment</span>
              </a>
              <a
                href="/dashboard/students"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <Users className="size-5 text-primary" />
                <span className="text-sm font-medium">Add New Student</span>
              </a>
              <a
                href="/dashboard/consultations"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <Stethoscope className="size-5 text-primary" />
                <span className="text-sm font-medium">Start Consultation</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
