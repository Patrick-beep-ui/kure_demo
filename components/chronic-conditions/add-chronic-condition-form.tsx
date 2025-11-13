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

interface AddChronicConditionFormProps {
  onSuccess: () => void
}

interface ChronicConditionFormData {
  student_id: number
  condition_name: string
  diagnosed_date: string
  severity: "mild" | "moderate" | "severe"
  current_medications?: string
  notes?: string
}

export function AddChronicConditionForm({ onSuccess }: AddChronicConditionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ChronicConditionFormData>()

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

  const onSubmit = async (data: ChronicConditionFormData) => {
    setIsLoading(true)
    setError("")

    try {
      await apiService.post("/chronic-conditions", data)
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to add chronic condition")
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
        <Label htmlFor="condition_name">Condition Name *</Label>
        <Input
          id="condition_name"
          {...register("condition_name", { required: "Condition name is required" })}
          placeholder="e.g., Type 1 Diabetes, Asthma"
        />
        {errors.condition_name && <p className="text-sm text-destructive">{errors.condition_name.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="diagnosed_date">Diagnosed Date *</Label>
          <Input
            id="diagnosed_date"
            type="date"
            {...register("diagnosed_date", { required: "Diagnosed date is required" })}
          />
          {errors.diagnosed_date && <p className="text-sm text-destructive">{errors.diagnosed_date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="severity">Severity *</Label>
          <Select onValueChange={(value) => setValue("severity", value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mild">Mild</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="severe">Severe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="current_medications">Current Medications</Label>
        <Textarea
          id="current_medications"
          {...register("current_medications")}
          placeholder="List medications currently prescribed for this condition"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Any additional information about the condition"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Condition"}
        </Button>
      </div>
    </form>
  )
}
