"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { clinicApi } from "@/lib/api-service"
import type { Student, Consultation, ChronicCondition } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Phone, Mail, Calendar, AlertTriangle, Edit, User, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { AddConsultationModal } from "@/components/consultations/add-consultation-modal"
import { AddChronicConditionModal } from "@/components/chronic-conditions/add-chronic-condition-modal"
import { DispenseMedicationModal } from "@/components/medications/dispense-medication-modal"
import { ScheduleAppointmentModal } from "@/components/appointments/schedule-appointment-modal"

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [showConsultationModal, setShowConsultationModal] = useState(false)
  const [showConditionModal, setShowConditionModal] = useState(false)
  const [showMedicationModal, setShowMedicationModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)

  useEffect(() => {
    if (params.id) fetchStudent()
  }, [params.id])

  const fetchStudent = async () => {
    try {
      const data = await clinicApi.getStudent(Number(params.id))
      setStudent(data)
    } catch (error) {
      console.error("Failed to fetch student details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!student) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Student not found</AlertDescription>
      </Alert>
    )
  }

  // First personal phone number
  const personalPhone = student.contact_numbers?.find(c => c.type === "personal")?.phone_number
  const emergencyPhone = student.contact_numbers?.find(c => c.type === "emergencia")?.phone_number

  // All medications from consultations
  const allMedications = student.consultations.flatMap(c => c.consultation_medications || [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex flex-col items-center gap-4">
          {student.profile_pic_url ? (
            <Image
              src={student.profile_pic_url}
              alt={`${student.first_name} ${student.last_name}`}
              width={160}
              height={160}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-muted">
              <User className="h-20 w-20 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 h-full">
          <div className="flex h-full items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {student.first_name} {student.last_name}
              </h1>
              <p className="text-muted-foreground">Student ID: {student.ku_id}</p>
            </div>
            <Button>
              <Edit className="mr-2 size-4" />
              Editar Perfil
            </Button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground" />
              <span className="text-sm">{student.ku_email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-muted-foreground" />
              <span className="text-sm">{personalPhone || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm">{new Date(student.dob).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información de Programa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Programa</span>
              <Badge variant="outline">{student.program?.program_name}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contactos de Emergencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">{emergencyPhone || "No registrado"}</p>
              <p className="text-sm text-muted-foreground">{student.emergency_contact_phone || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="consultations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consultations">Consultas</TabsTrigger>
          <TabsTrigger value="chronic-conditions">Padecimientos</TabsTrigger>
          <TabsTrigger value="medications">Medicacion</TabsTrigger>
          <TabsTrigger value="citas">Citas</TabsTrigger>
        </TabsList>

        {/* Consultations */}
        <TabsContent value="consultations" className="space-y-4">
          {student.consultations.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No consultations recorded</p>
          ) : (
            <div className="space-y-4">
              <Button
              size="sm"
              onClick={() => setShowConsultationModal(true)}
            >
              <Plus className="mr-2 size-4" />
              Nueva Consulta
            </Button>
              {student.consultations.map((consultation) => (
                <Card key={consultation.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{consultation.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(consultation.date).toLocaleDateString()} | {consultation.start_time} - {consultation.end_time}
                      </p>
                      <Badge variant="outline" className="mt-2">{consultation.type}</Badge>
                    </div>
                  </div>

                  {consultation.diagnosis && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Diagnosis:</p>
                      <p className="text-sm text-muted-foreground">{consultation.diagnosis}</p>
                    </div>
                  )}

                  {consultation.consultation_medications?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Medications:</p>
                      <ul className="ml-4 list-disc text-sm text-muted-foreground">
                        {consultation.consultation_medications.map((cm) => (
                          <li key={cm.id}>
                            {cm.medication.name} - {cm.quantity} {cm.medication.unit} ({cm.medication.dosage}) | {cm.instructions}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

      {/* Chronic Conditions */}
      <TabsContent value="chronic-conditions" className="space-y-4">
        {student.conditions.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No chronic conditions recorded
          </p>
        ) : (
          <div className="space-y-4">
            <Button
              size="sm"
              onClick={() => setShowConditionModal(true)}
            >
              <Plus className="mr-2 size-4" />
              Nueva Condición
            </Button>
            {student.conditions.map((condition) => (
              <Card key={condition.id} className="p-4">
                {/* Header: Condition Name & Type */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{condition.condition.condition_name}</p>
                    <Badge variant="outline" className="capitalize">
                      {condition.condition.condition_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start: {new Date(condition.start_date).toLocaleDateString()}
                  </p>
                </div>

                {/* Description */}
                {condition.condition.condition_description && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Description:</p>
                    <p className="text-sm text-muted-foreground">
                      {condition.condition.condition_description}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {condition.notes && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Notes:</p>
                    <p className="text-sm text-muted-foreground">{condition.notes}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </TabsContent>


        {/* Medications */}
        <TabsContent value="medications" className="space-y-4">
        <Button
              size="sm"
              onClick={() => setShowMedicationModal(true)}
            >
              <Plus className="mr-2 size-4" />
              Nueva Medicina
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Medication History</CardTitle>
            </CardHeader>
            <CardContent>
              {allMedications.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No medications dispensed yet</p>
              ) : (
                <ul className="list-disc ml-4 text-sm text-muted-foreground">
                  {allMedications.map((cm) => (
                    <li key={cm.id}>
                      {cm.medication.name} - {cm.quantity} {cm.medication.dosage} ({cm.medication.unit}) | {cm.instructions}
                    </li>
                  ))} 
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      {/* Citas */}
      <TabsContent value="citas" className="space-y-4">
        {student.conditions.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Ninguna cita agendada para este estudiante
          </p>
        ) : (
          <div className="space-y-4">
            <Button
              size="sm"
              onClick={() => setShowAppointmentModal(true)}
            >
              <Plus className="mr-2 size-4" />
              Nueva Cita
            </Button>
            {student.conditions.map((condition) => (
              <Card key={condition.id} className="p-4">
                {/* Header: Condition Name & Type */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{condition.condition.condition_name}</p>
                    <Badge variant="outline" className="capitalize">
                      {condition.condition.condition_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start: {new Date(condition.start_date).toLocaleDateString()}
                  </p>
                </div>

                {/* Description */}
                {condition.condition.condition_description && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Description:</p>
                    <p className="text-sm text-muted-foreground">
                      {condition.condition.condition_description}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {condition.notes && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Notes:</p>
                    <p className="text-sm text-muted-foreground">{condition.notes}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      </Tabs>
      

      {student && (
        <>
          <AddConsultationModal
            studentId={student.id}
            isOpen={showConsultationModal}
            onOpenChange={setShowConsultationModal}
            onSuccess={fetchStudent}
          />
          <AddChronicConditionModal
            studentId={student.id}
            isOpen={showConditionModal}
            onOpenChange={setShowConditionModal}
            onSuccess={fetchStudent}
          />
          <DispenseMedicationModal
            studentId={student.id}
            isOpen={showMedicationModal}
            onOpenChange={setShowMedicationModal}
            onSuccess={fetchStudent}
          />

          <ScheduleAppointmentModal
            studentId={student.id}
            isOpen={showAppointmentModal}
            onOpenChange={setShowAppointmentModal}
            onSuccess={fetchStudent}
          />
        </>
      )}

    </div>
  )
}
