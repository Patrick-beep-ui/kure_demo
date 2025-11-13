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

interface AddConsultationFormProps {
  onSuccess: () => void
}

interface ConsultationFormData {
  student_id: number
  consultation_date: string
  chief_complaint: string
  diagnosis: string
  treatment_plan: string
  notes?: string
}

export function AddConsultationForm({ onSuccess }: AddConsultationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ConsultationFormData>()

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

  const onSubmit = async (data: ConsultationFormData) => {
    setIsLoading(true)
    setError("")

    try {
      await apiService.post("/consultations", data)
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to create consultation")
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

      <div className="space-y-2">
        <Label htmlFor="consultation_date">Consultation Date *</Label>
        <Input
          id="consultation_date"
          type="date"
          {...register("consultation_date", { required: "Date is required" })}
        />
        {errors.consultation_date && <p className="text-sm text-destructive">{errors.consultation_date.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="chief_complaint">Chief Complaint *</Label>
        <Textarea
          id="chief_complaint"
          {...register("chief_complaint", { required: "Chief complaint is required" })}
          placeholder="Patient's main concern or reason for visit"
          rows={3}
        />
        {errors.chief_complaint && <p className="text-sm text-destructive">{errors.chief_complaint.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnosis *</Label>
        <Textarea
          id="diagnosis"
          {...register("diagnosis", { required: "Diagnosis is required" })}
          placeholder="Medical diagnosis"
          rows={3}
        />
        {errors.diagnosis && <p className="text-sm text-destructive">{errors.diagnosis.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatment_plan">Treatment Plan *</Label>
        <Textarea
          id="treatment_plan"
          {...register("treatment_plan", { required: "Treatment plan is required" })}
          placeholder="Recommended treatment and medications"
          rows={4}
        />
        {errors.treatment_plan && <p className="text-sm text-destructive">{errors.treatment_plan.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea id="notes" {...register("notes")} placeholder="Any additional observations or notes" rows={3} />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Consultation"}
        </Button>
      </div>
    </form>
  )
}
