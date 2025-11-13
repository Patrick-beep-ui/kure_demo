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
import { ArrowLeft, Phone, Mail, Calendar, AlertTriangle, Edit } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [chronicConditions, setChronicConditions] = useState<ChronicCondition[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchStudentDetails()
    }
  }, [params.id])

  const fetchStudentDetails = async () => {
    try {
      const [studentData, consultationsResponse, conditionsResponse] = await Promise.all([
        clinicApi.getStudent(Number(params.id)),
        clinicApi.getConsultations(),
        clinicApi.getChronicConditions(),
      ])
  
      console.log("Fetched student data:", studentData)
      console.log("Fetched all consultations:", consultationsResponse)
      console.log("Fetched all chronic conditions:", conditionsResponse)
  
      // Extract .data from the API responses that return paginated lists
      const consultationsData = consultationsResponse.data || []
      const conditionsData = conditionsResponse.data || []
  
      const studentConsultations = consultationsData.filter(
        (c) => c.student_id === Number(params.id)
      )
      const studentConditions = conditionsData.filter(
        (c) => c.student_id === Number(params.id)
      )
  
      setStudent(studentData)
      setConsultations(studentConsultations)
      setChronicConditions(studentConditions)
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
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>Student not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {student.first_name} {student.last_name}
          </h1>
          <p className="text-muted-foreground">Student ID: {student.student_id}</p>
        </div>
        <Button>
          <Edit className="mr-2 size-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground" />
              <span className="text-sm">{student.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-muted-foreground" />
              <span className="text-sm">{student.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm">{new Date(student.date_of_birth).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gender</span>
              <Badge variant="outline" className="capitalize">
                {student.gender}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Blood Type</span>
              <Badge variant="outline">{student.blood_type || "Unknown"}</Badge>
            </div>
            {student.allergies && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Allergies</p>
                  <p className="text-sm text-muted-foreground">{student.allergies}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">{student.emergency_contact_name || "Not provided"}</p>
              <p className="text-sm text-muted-foreground">{student.emergency_contact_phone || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="consultations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="chronic-conditions">Chronic Conditions</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
        </TabsList>

        <TabsContent value="consultations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consultation History</CardTitle>
            </CardHeader>
            <CardContent>
              {consultations.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No consultations recorded</p>
              ) : (
                <div className="space-y-4">
                  {consultations.map((consultation) => (
                    <div key={consultation.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{consultation.chief_complaint}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(consultation.consultation_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            consultation.status === "completed"
                              ? "secondary"
                              : consultation.status === "in-progress"
                                ? "default"
                                : "outline"
                          }
                        >
                          {consultation.status}
                        </Badge>
                      </div>
                      {consultation.diagnosis && (
                        <div className="mt-3">
                          <p className="text-sm font-medium">Diagnosis:</p>
                          <p className="text-sm text-muted-foreground">{consultation.diagnosis}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chronic-conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chronic Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              {chronicConditions.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No chronic conditions recorded</p>
              ) : (
                <div className="space-y-4">
                  {chronicConditions.map((condition) => (
                    <div key={condition.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{condition.condition_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Diagnosed: {new Date(condition.diagnosed_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            condition.severity === "severe"
                              ? "destructive"
                              : condition.severity === "moderate"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {condition.severity}
                        </Badge>
                      </div>
                      {condition.current_medications && (
                        <div className="mt-3">
                          <p className="text-sm font-medium">Current Medications:</p>
                          <p className="text-sm text-muted-foreground">{condition.current_medications}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medication History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="py-8 text-center text-muted-foreground">No medications dispensed yet</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
