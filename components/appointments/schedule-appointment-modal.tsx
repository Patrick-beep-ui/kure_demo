"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { clinicApi } from "@/lib/api-service"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ScheduleAppointmentModalProps {
  studentId: number
  scheduledBy: number        // logged-in user ID
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface Doctor {
  id: number
  first_name: string
  last_name: string
}

interface AppointmentFormData {
  date: string
  start_time: string
  end_time?: string
  notes?: string
  provided_by: number
}

export function ScheduleAppointmentModal({
  studentId,
  scheduledBy = 1,
  isOpen,
  onOpenChange,
  onSuccess,
}: ScheduleAppointmentModalProps) {

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [doctors, setDoctors] = useState<Doctor[]>([])

  // Fetch doctors
  useEffect(() => {
    const getDoctors = async () => {
      try {
        const response = await clinicApi.getDoctors()
        setDoctors(response)
      } catch (err) {
        console.error("Failed to fetch doctors:", err)
      }
    }
    getDoctors()
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm<AppointmentFormData>()


  const onSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const payload = {
        ...data,
        student_id: studentId,
        scheduled_by: scheduledBy,
        status: "pendiente",
      }

      await clinicApi.createAppointment(payload)
      alert("API call to create appointment with data: " + JSON.stringify(payload))

      reset()
      onOpenChange(false)
      onSuccess()

    } catch (err: any) {
      setError(err.message || "Failed to schedule appointment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Agendar Cita</DialogTitle>
          <DialogDescription>
            Crear una nueva cita para este estudiante.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">

          {/* Doctor */}
          <div className="space-y-2">
            <Label>Atendido por *</Label>
            <Select onValueChange={(value) => setValue("provided_by", Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.first_name} {d.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.provided_by && <p className="text-red-500 text-sm">Seleccione un doctor</p>}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Fecha *</Label>
            <Input
              type="date"
              {...register("date", { required: "La fecha es requerida" })}
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label>Hora de Inicio *</Label>
            <Input
              type="time"
              {...register("start_time", { required: "Hora de inicio requerida" })}
            />
            {errors.start_time && <p className="text-red-500 text-sm">{errors.start_time.message}</p>}
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label>Hora de Finalización</Label>
            <Input
              type="time"
              {...register("end_time")}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              rows={3}
              placeholder="Información adicional"
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Agendar Cita"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}
