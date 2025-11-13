"use client"

import { useEffect, useState } from "react"
import { clinicApi } from "@/lib/api-service"
import type { Appointment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Plus, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddAppointmentForm } from "@/components/appointments/add-appointment-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const { data } = await clinicApi.getAppointments()
      setAppointments(data)
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppointmentAdded = () => {
    setIsAddDialogOpen(false)
    fetchAppointments()
  }

  const updateAppointmentStatus = async (id: number, status: Appointment["status"]) => {
    try {
      await clinicApi.updateAppointment(id, { status })
      fetchAppointments()
    } catch (error) {
      console.error("Failed to update appointment:", error)
    }
  }

  const filterAppointments = (status?: Appointment["status"]) => {
    if (!status) return appointments
    return appointments.filter((apt) => apt.status === status)
  }

  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="size-4 text-green-600" />
      case "completed":
        return <CheckCircle className="size-4 text-blue-600" />
      case "cancelled":
        return <XCircle className="size-4 text-red-600" />
      default:
        return <AlertCircle className="size-4 text-yellow-600" />
    }
  }

  const getStatusVariant = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <span className="font-medium">
                {appointment.student?.first_name} {appointment.student?.last_name}
              </span>
              <Badge variant="outline">{appointment.student?.student_id}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
              <Clock className="size-4 ml-2" />
              <span>{appointment.appointment_time}</span>
            </div>
            <p className="text-sm">{appointment.reason}</p>
            {appointment.notes && <p className="text-sm text-muted-foreground">{appointment.notes}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusVariant(appointment.status)} className="gap-1">
              {getStatusIcon(appointment.status)}
              {appointment.status}
            </Badge>
            {appointment.status === "pending" && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                >
                  Cancel
                </Button>
              </div>
            )}
            {appointment.status === "confirmed" && (
              <Button size="sm" onClick={() => updateAppointmentStatus(appointment.id, "completed")}>
                Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage student appointments and scheduling</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
            </DialogHeader>
            <AddAppointmentForm onSuccess={handleAppointmentAdded} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No appointments scheduled</p>
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filterAppointments("pending").map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          {filterAppointments("confirmed").map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filterAppointments("completed").map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
