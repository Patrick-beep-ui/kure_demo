"use client"

import { useEffect, useState } from "react"
import { clinicApi } from "@/lib/api-service"
import type { Consultation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, User, Calendar, FileText, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddConsultationForm } from "@/components/consultations/add-consultation-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      const { data } = await clinicApi.getConsultations()
      setConsultations(data)
    } catch (error) {
      console.error("Failed to fetch consultations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConsultationAdded = () => {
    setIsAddDialogOpen(false)
    fetchConsultations()
  }

  const filterConsultations = (status?: Consultation["status"]) => {
    if (!status) return consultations
    return consultations.filter((cons) => cons.status === status)
  }

  const getStatusVariant = (status: Consultation["status"]) => {
    switch (status) {
      case "completed":
        return "secondary"
      case "in-progress":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const ConsultationCard = ({ consultation }: { consultation: Consultation }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <span className="font-medium">
                {consultation.student?.first_name} {consultation.student?.last_name}
              </span>
              <Badge variant="outline">{consultation.student?.student_id}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>{new Date(consultation.consultation_date).toLocaleDateString()}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <FileText className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Chief Complaint:</p>
                  <p className="text-sm text-muted-foreground">{consultation.chief_complaint}</p>
                </div>
              </div>
              {consultation.diagnosis && (
                <div className="ml-6">
                  <p className="text-sm font-medium">Diagnosis:</p>
                  <p className="text-sm text-muted-foreground">{consultation.diagnosis}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusVariant(consultation.status)}>{consultation.status}</Badge>
            <Button size="sm" variant="outline" asChild>
              <a href={`/dashboard/consultations/${consultation.id}`}>
                <Eye className="mr-2 size-4" />
                View
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
          <p className="text-muted-foreground">Manage patient consultations and medical records</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              New Consultation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Consultation</DialogTitle>
            </DialogHeader>
            <AddConsultationForm onSuccess={handleConsultationAdded} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : consultations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No consultations recorded</p>
              </CardContent>
            </Card>
          ) : (
            consultations.map((consultation) => <ConsultationCard key={consultation.id} consultation={consultation} />)
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {filterConsultations("scheduled").map((consultation) => (
            <ConsultationCard key={consultation.id} consultation={consultation} />
          ))}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {filterConsultations("in-progress").map((consultation) => (
            <ConsultationCard key={consultation.id} consultation={consultation} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filterConsultations("completed").map((consultation) => (
            <ConsultationCard key={consultation.id} consultation={consultation} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
