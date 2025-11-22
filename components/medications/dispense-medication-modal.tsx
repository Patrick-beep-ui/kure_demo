"use client"

import { useState } from "react"
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
import { AlertCircle } from 'lucide-react'
import { useEffect } from "react"
import type { Medication } from "@/lib/types"

interface DispenseMedicationModalProps {
  studentId: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface DispenseFormData {
  medication_id: number
  quantity_dispensed: number
  instructions: string
}

export function DispenseMedicationModal({
  studentId,
  isOpen,
  onOpenChange,
  onSuccess,
}: DispenseMedicationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [medications, setMedications] = useState<Medication[]>([])
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<DispenseFormData>()

  useEffect(() => {
    if (isOpen) {
      fetchMedications()
    }
  }, [isOpen])

  const fetchMedications = async () => {
    try {
      const data = await clinicApi.getMedications()
      setMedications(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      console.error("Failed to fetch medications:", error)
    }
  }

  const onSubmit = async (data: DispenseFormData) => {
    setIsLoading(true)
    setError("")

    try {
      await clinicApi.dispenseMedication({
        ...data,
        student_id: studentId,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to dispense medication")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dispense Medication</DialogTitle>
          <DialogDescription>Dispense a medication to this student</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="medication_id">Medication *</Label>
            <Select onValueChange={(value) => setValue("medication_id", Number.parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                {medications.map((med) => (
                  <SelectItem key={med.id} value={med.id.toString()}>
                    {med.name} - {med.dosage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity_dispensed">Quantity *</Label>
            <Input
              id="quantity_dispensed"
              type="number"
              {...register("quantity_dispensed", {
                required: "Quantity is required",
                valueAsNumber: true,
              })}
              placeholder="0"
            />
            {errors.quantity_dispensed && (
              <p className="text-sm text-destructive">{errors.quantity_dispensed.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions *</Label>
            <Textarea
              id="instructions"
              {...register("instructions", { required: "Instructions are required" })}
              placeholder="Dosage and usage instructions"
              rows={3}
            />
            {errors.instructions && (
              <p className="text-sm text-destructive">{errors.instructions.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Dispensing..." : "Dispense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
