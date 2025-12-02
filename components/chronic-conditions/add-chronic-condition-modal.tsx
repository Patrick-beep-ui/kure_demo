"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { useDebounce } from 'use-debounce'; 

interface AddChronicConditionModalProps {
  studentId: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface Condition {
  id: number
  condition_name: string
  condition_type: string
  condition_description: string
}

interface MedicationEntry {
  medication_id: number
  quantity: number
  dosage?: string
  instructions?: string
  status: "dada" | "no_disponible"
}

interface ChronicConditionFormData extends Condition, MedicationEntry {
  diagnosed_date: string
  notes?: string
}

export function AddChronicConditionModal({
  studentId,
  isOpen,
  onOpenChange,
  onSuccess,
}: AddChronicConditionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
   const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [suggestedMeds, setSuggestedMedications] = useState<MedicationEntry[]>([]);

    useEffect(() => {
      const getMedications = async () => {
          try {
              const response = await clinicApi.getMedications();
              setMedications(response);
              console.log("Fetched medications:", response);
          }
          catch(err) {
              console.error("Failed to fetch user ID:", err);
          }
      }
  
      getMedications();
    }, [])

    useEffect(() => {
      const getConditions = async () => {
          try {
              const response = await clinicApi.getConditions();
              setConditions(response);
              console.log("Fetched conditions:", response);
          }
          catch(err) {
              console.error("Failed to fetch conditions:", err);
          }
      }
  
      getConditions();
    }, [])
    

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ChronicConditionFormData>()

  const condition = watch("condition_name");

  const [debouncedCondition] = useDebounce(condition, 500);

  useEffect(() => {
    if (!debouncedCondition) return;

    const getSuggestedMedications = async () => {
      try {
        const response = await clinicApi.getSuggestedCondMedications({condition: debouncedCondition});
        const suggestions = response.suggestions;
        console.log("Fetched suggested medications:", suggestions);

        if (suggestions.length === 0) return;

        setValue("medications", []);

        suggestions.forEach((suggestion: MedicationEntry) => {
          appendMedication({
            medication_id: suggestion.medication_id,
            duration_amount: 1,
            schedule: "",
            duration_type: "prn",
            duration_unit: "dias",
          });
        });

        setSuggestedMedications(suggestions);
      }
      catch(err) {
        console.error("Failed to fetch suggested medications:", err);
      }
    }

    getSuggestedMedications();
  }, [debouncedCondition])

    const { fields: medicationFields, append: appendMedication, remove: removeMedication } =
      useFieldArray({
        control,
        name: "medications",
      })

  const onSubmit = async (data: ChronicConditionFormData) => {
    setIsLoading(true)
    setError("")

    try {

      const conditionData = {
        ...data,
        student_id: studentId,
      }

      //alert(JSON.stringify(conditionData, null, 2));

      
      await clinicApi.createChronicCondition({
       ...conditionData
      })
        
      reset()
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to add chronic condition")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Agregar Condición</DialogTitle>
          <DialogDescription>Agrega un nuevo padecimiento para el estudiante</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="condition_name">Nombre del Padecimiento *</Label>
            <Input
              id="condition_name"
              {...register("condition_name", { required: "Condition name is required" })}
              placeholder="e.g., Type 1 Diabetes"
            />
            {errors.condition_name && (
              <p className="text-sm text-destructive">{errors.condition_name.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="diagnosed_date">Fecha Diagnosticada *</Label>
              <Input
                id="diagnosed_date"
                type="date"
                {...register("diagnosed_date", { required: "Diagnosed date is required" })}
              />
              {errors.diagnosed_date && (
                <p className="text-sm text-destructive">{errors.diagnosed_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Tipo *</Label>
              <Select onValueChange={(value) => setValue("condition_type", value as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escoge tipo" />
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_medications">Descripción</Label>
            <Textarea
              id="current_medications"
              {...register("condition_description")}
              placeholder="Detalles del padecimiento"
              rows={2}
            />
          </div>

          <div>
            <Label className="font-semibold">Medicación controlada</Label>

            {medicationFields.map((field, index) => (
                <div
                key={field.id}
                className="border rounded p-4 mt-3 grid gap-4 md:grid-cols-4"
                >
                {/* Medication search / autocomplete */}
                <div className="col-span-2">
                    <Label>Medicamento</Label>

                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between mt-1"
                        >
                            {watch(`medications.${index}.medication_id`)
                                ? (() => {
                                      const med = medications.find(
                                          (m) =>
                                              String(m.id) ===
                                              String(watch(`medications.${index}.medication_id`))
                                      );
                                      return med ? `${med.name} - ${med.dosage}` : "Selecciona medicamento";
                                  })()
                                : "Selecciona medicamento"}
                        </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder="Buscar medicamento..." />

                            <CommandList>
                            <CommandEmpty>No se encontró.</CommandEmpty>

                            <CommandGroup>
                                {medications.map((med) => (
                                <CommandItem
                                    key={med.id}
                                    value={`${med.name} ${med.dosage || ""}`}
                                    onSelect={() => {
                                    setValue(
                                        `medications.${index}.medication_id`,
                                        String(med.id)
                                    )
                                    }}
                                >
                                    {med.name} — {med.dosage}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                            </CommandList>
                        </Command>
                        </PopoverContent>
                    </Popover>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <Label>Tipo</Label>
                      <Select
                        onValueChange={(v) =>
                          setValue(`medications.${index}.duration_type`, v as any)
                        }
                      >
                        <SelectTrigger className="mt-1 w-full">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="permanente">Permanente</SelectItem>
                          <SelectItem value="fija">Fija</SelectItem>
                          <SelectItem value="prn">Prn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantity */}
                    
                    <div className="col-span-2">
                      <Label>Unidad</Label>
                      <Select
                        onValueChange={(v) =>
                          setValue(`medications.${index}.duration_unit`, v as any)
                        }
                      >
                        <SelectTrigger className="mt-1 w-full">
                          <SelectValue placeholder="Escoge Unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dias">Dias</SelectItem>
                          <SelectItem value="semanas">Semanas</SelectItem>
                          <SelectItem value="meses">Meses</SelectItem>
                          <SelectItem value="años">Años</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        className="mt-1"
                        defaultValue={1}
                        {...register(`medications.${index}.duration_amount` as const)}
                      />
                    </div>

                    {/* Instructions */}
                    <div className="col-span-4">
                      <Label>Horario</Label>
                      <Textarea
                        rows={2}
                        className="mt-1"
                        {...register(`medications.${index}.schedule` as const)}
                      />
                    </div>

                    {/* Remove button */}
                    <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeMedication(index)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  className="mt-3"
                  onClick={() =>
                    appendMedication({
                      medication_id: 0,
                      duration_amount: 0,
                      schedule: "",
                      duration_type: "fija",
                      duration_unit: "dias",
                    })
                  }
                >
                  Añadir Medicamento
                </Button>
              </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Informacion adicional"
              rows={2}
            />
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
              {isLoading ? "Adding..." : "Add Condition"}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
