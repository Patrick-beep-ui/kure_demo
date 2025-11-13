"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { apiService } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface AddMedicationFormProps {
  onSuccess: () => void
}

interface MedicationFormData {
  name: string
  description?: string
  dosage_form: string
  strength: string
  quantity: number
  unit: string
  expiry_date: string
  is_controlled: boolean
  reorder_level: number
  supplier?: string
}

export function AddMedicationForm({ onSuccess }: AddMedicationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isControlled, setIsControlled] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicationFormData>()

  const onSubmit = async (data: MedicationFormData) => {
    setIsLoading(true)
    setError("")

    try {
      await apiService.post("/medications", { ...data, is_controlled: isControlled })
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to add medication")
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
        <Label htmlFor="name">Medication Name *</Label>
        <Input id="name" {...register("name", { required: "Name is required" })} placeholder="e.g., Paracetamol" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} placeholder="Brief description" rows={2} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dosage_form">Dosage Form *</Label>
          <Input
            id="dosage_form"
            {...register("dosage_form", { required: "Dosage form is required" })}
            placeholder="e.g., Tablet, Capsule, Syrup"
          />
          {errors.dosage_form && <p className="text-sm text-destructive">{errors.dosage_form.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="strength">Strength *</Label>
          <Input
            id="strength"
            {...register("strength", { required: "Strength is required" })}
            placeholder="e.g., 500mg, 10ml"
          />
          {errors.strength && <p className="text-sm text-destructive">{errors.strength.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            {...register("quantity", { required: "Quantity is required", valueAsNumber: true })}
            placeholder="0"
          />
          {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Input
            id="unit"
            {...register("unit", { required: "Unit is required" })}
            placeholder="e.g., tablets, bottles, boxes"
          />
          {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expiry_date">Expiry Date *</Label>
          <Input id="expiry_date" type="date" {...register("expiry_date", { required: "Expiry date is required" })} />
          {errors.expiry_date && <p className="text-sm text-destructive">{errors.expiry_date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reorder_level">Reorder Level *</Label>
          <Input
            id="reorder_level"
            type="number"
            {...register("reorder_level", { required: "Reorder level is required", valueAsNumber: true })}
            placeholder="Minimum quantity before reorder"
          />
          {errors.reorder_level && <p className="text-sm text-destructive">{errors.reorder_level.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier">Supplier</Label>
        <Input id="supplier" {...register("supplier")} placeholder="Supplier name" />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="is_controlled" checked={isControlled} onCheckedChange={(checked) => setIsControlled(!!checked)} />
        <Label htmlFor="is_controlled" className="text-sm font-normal cursor-pointer">
          This is a controlled medication (requires special tracking)
        </Label>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Medication"}
        </Button>
      </div>
    </form>
  )
}
