"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { apiService } from "@/lib/api-service"
import type { Student, Medication } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface DispenseMedicationFormProps {
  onSuccess: () => void
  controlledOnly?: boolean
}

interface DispenseFormData {
  student_id: number
  medication_id: number
  quantity_dispensed: number
  instructions: string
}

export function DispenseMedicationForm({ onSuccess, controlledOnly = false }: DispenseMedicationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DispenseFormData>()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsData, medsData] = await Promise.all([
        apiService.get<Student[]>("/students"),
        apiService.get<Medication[]>(controlledOnly ? "/medications?controlled=true" : "/medications"),
      ])
      setStudents(studentsData)
      setMedications(medsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  const onSubmit = async (data: DispenseFormData) => {
    setIsLoading(true)
    setError("")

    try {
      await apiService.post("/medication-dispenses", data)
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to dispense medication")
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
        <Label htmlFor="medication_id">Medication *</Label>
        <Select onValueChange={(value) => setValue("medication_id", Number.parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select medication" />
          </SelectTrigger>
          <SelectContent>
            {medications.map((med) => (
              <SelectItem key={med.id} value={med.id.toString()}>
                {med.name} - {med.strength} ({med.quantity} {med.unit} available)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity_dispensed">Quantity to Dispense *</Label>
        <Input
          id="quantity_dispensed"
          type="number"
          {...register("quantity_dispensed", { required: "Quantity is required", valueAsNumber: true })}
          placeholder="0"
        />
        {errors.quantity_dispensed && <p className="text-sm text-destructive">{errors.quantity_dispensed.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions *</Label>
        <Textarea
          id="instructions"
          {...register("instructions", { required: "Instructions are required" })}
          placeholder="Dosage and usage instructions"
          rows={4}
        />
        {errors.instructions && <p className="text-sm text-destructive">{errors.instructions.message}</p>}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Dispensing..." : "Dispense Medication"}
        </Button>
      </div>
    </form>
  )
}
