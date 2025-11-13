"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { apiService } from "@/lib/api-service"
import type { Student } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface AddAppointmentFormProps {
  onSuccess: () => void
}

interface AppointmentFormData {
  student_id: number
  appointment_date: string
  appointment_time: string
  reason: string
  notes?: string
}

export function AddAppointmentForm({ onSuccess }: AddAppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AppointmentFormData>()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const data = await apiService.get<Student[]>("/students")
      setStudents(data)
    } catch (error) {
      console.error("Failed to fetch students:", error)
    }
  }

  const onSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true)
    setError("")

    try {
      await apiService.post("/appointments", data)
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to schedule appointment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="student_id">Student *</Label>
        <Select onValueChange={(value) => setValue("student_id", Number.parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id.toString()}>
                {student.first_name} {student.last_name} ({student.student_id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="appointment_date">Date *</Label>
          <Input
            id="appointment_date"
            type="date"
            {...register("appointment_date", { required: "Date is required" })}
          />
          {errors.appointment_date && <p className="text-sm text-destructive">{errors.appointment_date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="appointment_time">Time *</Label>
          <Input
            id="appointment_time"
            type="time"
            {...register("appointment_time", { required: "Time is required" })}
          />
          {errors.appointment_time && <p className="text-sm text-destructive">{errors.appointment_time.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Visit *</Label>
        <Textarea id="reason" {...register("reason", { required: "Reason is required" })} rows={3} />
        {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea id="notes" {...register("notes")} rows={2} />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Scheduling..." : "Schedule Appointment"}
        </Button>
      </div>
    </form>
  )
}
