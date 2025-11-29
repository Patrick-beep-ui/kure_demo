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
  
import { AlertCircle } from "lucide-react"
import { useDebounce } from 'use-debounce'; 

interface AddConsultationModalProps {
  studentId: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface ConsultationFormData {
  consultation_date: string
  start_time?: string
  end_time?: string
  reason?: string
  diagnosis?: string
  notes?: string
  type: "doctor" | "enfermera"
  provided_by: number
  medications: MedicationEntry[]
}

interface MedicationEntry {
  medication_id: number
  quantity: number
  dosage?: string
  instructions?: string
  status: "dada" | "no_disponible"
}

export function AddConsultationModal({
  studentId,
  isOpen,
  onOpenChange,
  onSuccess,
}: AddConsultationModalProps) {

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [userId, searchUserId] = useState<number | null>(1);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
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
  

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ConsultationFormData>({
    defaultValues: {
      type: "enfermera",
      medications: [
        {
          medication_id: 0,
          quantity: 1,
          dosage: "",
          instructions: "",
          status: "",
        },
      ],
    },
  })

  const reason = watch("reason");
  const tipo = watch("type");

  const [debouncedReason] = useDebounce(reason, 500); // wait 500ms after typing stops
  const [debouncedType] = useDebounce(tipo, 500); // wait 500ms after typing stops

  useEffect(() => {
    const fetchSuggestedMeds = async () => {
      if (!debouncedReason) return;
  
      try {
        const response = await clinicApi.getSuggestedMedications({ reason: debouncedReason });
        const suggestions = response.suggestions;
  
        if (suggestions.length === 0) return;
  
        // Clear previous suggested medications first
        // Optional: you might want to keep manually added meds
        setValue("medications", []);
  
        // Add all suggested meds to the form
        suggestions.forEach((med: any) => {
          appendMedication({
            medication_id: med.id,
            quantity: 1,
            dosage: med.dosage || "",
            instructions: "",
            status: "dada",
          });
        });
  
        setSuggestedMedications(suggestions);
  
      } catch (err) {
        console.error("Failed to fetch suggested medications:", err);
      }
    };
  
    fetchSuggestedMeds();
  }, [debouncedReason]);

  useEffect(() => {
    const fetchMedicationStatus = async () => {
      if (!debouncedType) return;
  
      try {
        const response = await clinicApi.getMedicationStatus();
        const { role, status } = response;
        const meds = watch("medications");
  
        // If the selected type matches rule.role → apply the rule to all medications
        if (role === debouncedType) {
          console.log("Applying medication status rule:", status);
          console.log("Current medications before applying rule:", meds);
  
          meds.forEach((_, index) => {
            setValue(`medications.${index}.status`, status);
          });
        }
        else {
          meds.forEach((_, index) => {
            setValue(`medications.${index}.status`, "");
          });
        }


  
      } catch (err) {
        console.error("Failed to fetch medication status info:", err);
      }
    };
  
    fetchMedicationStatus();
  }, [debouncedType]);
  

  const { fields: medicationFields, append: appendMedication, remove: removeMedication } =
    useFieldArray({
      control,
      name: "medications",
    })

  const onSubmit = async (data: ConsultationFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const formattedData = {
        ...data,
        student_id: studentId,
        provided_by: userId!,
      }
      
      await clinicApi.createConsultation({
        ...formattedData,
      })
      

      //alert(JSON.stringify(formattedData, null, 2));
      console.log("Submitting consultation data:", JSON.stringify(formattedData, null, 2));
      alert("Consulta creada exitosamente.");

      reset()
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to create consultation")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nueva Consulta</DialogTitle>
          <DialogDescription>
            Registra toda la información de la consulta médica del estudiante.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable form */}
        <div className="overflow-y-auto flex-1 pr-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* --- DATE AND TYPE --- */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <Label>Fecha *</Label>
                    <Input
                    type="date"
                    className="mt-1"
                    {...register("consultation_date", { required: "Required" })}
                    />
                </div>

                <div>
                    <Label>Dada Por *</Label>
                    <Select
                    onValueChange={(v) => setValue("type", v as "doctor" | "enfermera")}
                    >
                    <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="enfermera">Enfermera</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            </div>

            {/* --- TIME --- */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Hora Inicio</Label>
                <Input type="time" className="mt-1" {...register("start_time")} />
              </div>

              <div>
                <Label>Hora Fin</Label>
                <Input type="time" className="mt-1" {...register("end_time")} />
              </div>
            </div>

            {/* --- REASON --- */}
            <div>
              <Label>Motivo / Razón</Label>
              <Textarea
                rows={2}
                className="mt-1"
                placeholder="Motivo de la consulta"
                {...register("reason")}
              />
            </div>

            {/* --- DIAGNOSIS --- */}
            <div>
              <Label>Diagnóstico</Label>
              <Textarea
                rows={3}
                className="mt-1"
                placeholder="Diagnóstico médico"
                {...register("diagnosis")}
              />
            </div>

            {/* --- MEDICATIONS SECTION --- */}
            <div>
            <Label className="font-semibold">Medicamentos administrados</Label>

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


      {/* Quantity */}
      <div>
        <Label>Cantidad</Label>
        <Input
          type="number"
          className="mt-1"
          defaultValue={1}
          {...register(`medications.${index}.quantity` as const)}
        />
      </div>

      {/* Status */}
      <div>
        <Label>Estado</Label>
        <Select
        value={watch(`medications.${index}.status`)}
          onValueChange={(v) =>
            setValue(`medications.${index}.status`, v as any)
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dada">Dada</SelectItem>
            <SelectItem value="no_disponible">No disponible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Instructions */}
      <div className="col-span-4">
        <Label>Instrucciones</Label>
        <Textarea
          rows={2}
          className="mt-1"
          {...register(`medications.${index}.instructions` as const)}
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
        quantity: 1,
        dosage: "",
        instructions: "",
        status: "dada",
      })
    }
  >
    Añadir Medicamento
  </Button>
</div>


            {/* --- NOTES --- */}
            <div>
              <Label>Notas</Label>
              <Textarea
                rows={2}
                className="mt-1"
                placeholder="Notas adicionales"
                {...register("notes")}
              />
            </div>


            {/* --- SUBMIT --- */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Consulta"}
              </Button>
            </div>

          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
