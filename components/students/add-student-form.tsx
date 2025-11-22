"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { apiService } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface AddStudentFormProps {
  onSuccess: () => void
}

interface MedicationData {
  medication_id: string
  schedule?: string
  duration?: string
}

interface ConditionData {
  condition_name: string
  condition_type: string
  condition_description?: string
  start_date?: string
  end_date?: string
  notes?: string
  medications?: MedicationData[]
}

interface ContactNumberData {
  phone_number: string
  type: "personal" | "emergencia"
  relationship?: string
}

interface StudentFormData {
  ku_id: string
  first_name: string
  last_name: string
  ku_email: string
  dob: string
  gender: "male" | "female" | "other"
  department?: string
  address?: string
  program_id?: string
  residence?: "interno" | "externo" | "aquinas"
  contact_numbers: ContactNumberData[]
  conditions: ConditionData[]
}

export function AddStudentForm({ onSuccess }: AddStudentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<StudentFormData>({
    defaultValues: {
      contact_numbers: [{ phone_number: "", type: "personal" }],
      conditions: [{ condition_name: "", condition_type: "", medications: [] }]
    }
  })

  const { fields: contactFields, append: appendContact } = useFieldArray({
    control,
    name: "contact_numbers"
  })

  const { fields: conditionFields, append: appendCondition } = useFieldArray({
    control,
    name: "conditions"
  })

  const onSubmit = async (data: StudentFormData) => {
    setIsLoading(true)
    setError("")

    try {
      await apiService.post("/students", data)
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Error al guardar el estudiante")
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

      <div className="grid gap-4 md:grid-cols-2">

        {/* Student ID */}
        <div className="space-y-2">
          <Label htmlFor="ku_id">ID del Estudiante *</Label>
          <Input
            id="ku_id"
            {...register("ku_id", { required: "El ID del estudiante es obligatorio" })}
            placeholder="STU2024001"
          />
          {errors.ku_id && <p className="text-sm text-destructive">{errors.ku_id.message}</p>}
        </div>

        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="first_name">Nombre *</Label>
          <Input
            id="first_name"
            {...register("first_name", { required: "El nombre es obligatorio" })}
            placeholder="Juan"
          />
          {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="last_name">Apellido *</Label>
          <Input
            id="last_name"
            {...register("last_name", { required: "El apellido es obligatorio" })}
            placeholder="Pérez"
          />
          {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="ku_email">Correo Electrónico *</Label>
          <Input
            id="ku_email"
            type="email"
            {...register("ku_email", { required: "El correo es obligatorio" })}
            placeholder="estudiante@universidad.edu"
          />
          {errors.ku_email && <p className="text-sm text-destructive">{errors.ku_email.message}</p>}
        </div>

        {/* DOB */}
        <div className="space-y-2">
          <Label htmlFor="dob">Fecha de Nacimiento *</Label>
          <Input
            id="dob"
            type="date"
            {...register("dob", { required: "La fecha de nacimiento es obligatoria" })}
          />
          {errors.dob && <p className="text-sm text-destructive">{errors.dob.message}</p>}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">Género *</Label>
          <Select onValueChange={(value) => setValue("gender", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Masculino</SelectItem>
              <SelectItem value="female">Femenino</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Department / City */}
        <div className="space-y-2">
          <Label htmlFor="department">Ciudad *</Label>
          <Input
            id="department"
            {...register("department", { required: "La ciudad es obligatoria" })}
            placeholder="Managua"
          />
          {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
        </div>

        {/* Address */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="Barrio, calle, referencia..."
          />
        </div>

        {/* Program */}
        <div className="space-y-2">
          <Label htmlFor="program_id">Programa Académico</Label>
          <Input
            id="program_id"
            {...register("program_id")}
            placeholder="Carrera, Inglés"
          />
        </div>

        {/* Residence */}
        <div className="space-y-2">
          <Label htmlFor="residence">Residencia</Label>
          <Select onValueChange={(value) => setValue("residence", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona residencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interno">Interno</SelectItem>
              <SelectItem value="externo">Externo</SelectItem>
              <SelectItem value="aquinas">Aquinas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contact Numbers */}
      <div>
        <Label>Contactos</Label>
        {contactFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-3 gap-2 mb-2">
            <Input
              placeholder="Teléfono"
              {...register(`contact_numbers.${index}.phone_number` as const, { required: true })}
            />
            <Select onValueChange={(v) => setValue(`contact_numbers.${index}.type`, v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="emergencia">Emergencia</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Parentesco (opcional)"
              {...register(`contact_numbers.${index}.relationship` as const)}
            />
          </div>
        ))}
        <Button type="button" onClick={() => appendContact({ phone_number: "", type: "personal" })}>
          Añadir contacto
        </Button>
      </div>

      {/* Conditions */}
      <div>
        <Label>Condiciones Médicas</Label>
        {conditionFields.map((field, index) => (
          <div key={field.id} className="border p-2 mb-2">
            <Input
              placeholder="Nombre de la condición"
              {...register(`conditions.${index}.condition_name` as const, { required: true })}
            />
            <Select onValueChange={(v) => setValue(`conditions.${index}.condition_type`, v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alergia">Alergia</SelectItem>
                <SelectItem value="enfermedad_cronica">Enfermedad Crónica</SelectItem>
                <SelectItem value="lesion">Lesión</SelectItem>
                <SelectItem value="salud_mental">Salud Mental</SelectItem>
                <SelectItem value="cirugia">Cirugía</SelectItem>
                <SelectItem value="otra">Otra</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Descripción"
              {...register(`conditions.${index}.condition_description` as const)}
            />
            <Input
              type="date"
              placeholder="Fecha de inicio"
              {...register(`conditions.${index}.start_date` as const)}
            />
            <Input
              type="date"
              placeholder="Fecha de fin"
              {...register(`conditions.${index}.end_date` as const)}
            />
            <Textarea
              placeholder="Notas adicionales"
              {...register(`conditions.${index}.notes` as const)}
            />
            {/* TODO: Add medications if needed */}
          </div>
        ))}
        <Button type="button" onClick={() => appendCondition({ condition_name: "", condition_type: "", medications: [] })}>
          Añadir condición
        </Button>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Agregar Estudiante"}
        </Button>
      </div>
    </form>
  )
}
