"use client"

import { useEffect, useState } from "react"
import { clinicApi } from "@/lib/api-service"
import type { MedicationDispense, Medication } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Pill, User, Calendar, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DispenseMedicationForm } from "@/components/medications/dispense-medication-form"

export default function ControlledMedicationsPage() {
  const [dispenses, setDispenses] = useState<MedicationDispense[]>([])
  const [controlledMeds, setControlledMeds] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDispenseDialogOpen, setIsDispenseDialogOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [dispensesResponse, medsResponse] = await Promise.all([
        clinicApi.getMedicationDispenses(),
        clinicApi.getMedications(),
      ])

      const dispensesData = dispensesResponse.data || []
      const medsData = medsResponse.data || []

      const controlledDispenses = dispensesData.filter((d) => d.medication?.is_controlled)
      const controlledMeds = medsData.filter((m) => m.is_controlled)
      setDispenses(controlledDispenses)
      setControlledMeds(controlledMeds)
    } catch (error) {
      console.error("Failed to fetch controlled medications data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMedicationDispensed = () => {
    setIsDispenseDialogOpen(false)
    fetchData()
  }

  const todayDispenses = dispenses.filter((d) => new Date(d.dispensed_at).toDateString() === new Date().toDateString())

  const thisWeekDispenses = dispenses.filter((d) => {
    const dispensedDate = new Date(d.dispensed_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return dispensedDate >= weekAgo
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controlled Medications</h1>
          <p className="text-muted-foreground">Track dispensing of controlled substances</p>
        </div>
        <Dialog open={isDispenseDialogOpen} onOpenChange={setIsDispenseDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Dispense Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Dispense Controlled Medication</DialogTitle>
            </DialogHeader>
            <DispenseMedicationForm onSuccess={handleMedicationDispensed} controlledOnly />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Controlled Medications</div>
            <Pill className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{controlledMeds.length}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Dispensed Today</div>
            <Calendar className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayDispenses.length}</div>
            <p className="text-xs text-muted-foreground">Transactions today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">This Week</div>
            <FileText className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekDispenses.length}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dispensing History</h2>
            <Badge variant="outline">Controlled Substances Only</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : dispenses.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No controlled medications dispensed yet</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Dispensed By</TableHead>
                    <TableHead>Instructions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispenses.map((dispense) => (
                    <TableRow key={dispense.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{new Date(dispense.dispensed_at).toLocaleDateString()}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(dispense.dispensed_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {dispense.student?.first_name} {dispense.student?.last_name}
                            </span>
                            <span className="text-xs text-muted-foreground">{dispense.student?.student_id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Pill className="size-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="font-medium">{dispense.medication?.name}</span>
                            <span className="text-xs text-muted-foreground">{dispense.medication?.strength}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {dispense.quantity_dispensed} {dispense.medication?.unit}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">Staff ID: {dispense.dispensed_by}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {dispense.instructions}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Controlled Medications Inventory</h2>
        </CardHeader>
        <CardContent>
          {controlledMeds.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No controlled medications in inventory</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Strength</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Expiry Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {controlledMeds.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium">{med.name}</TableCell>
                      <TableCell>{med.strength}</TableCell>
                      <TableCell>
                        <Badge variant={med.quantity <= med.reorder_level ? "destructive" : "secondary"}>
                          {med.quantity} {med.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(med.expiry_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
