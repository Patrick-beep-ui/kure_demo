"use client"

import { useEffect, useState } from "react"
import { clinicApi } from "@/lib/api-service"
import type { Medication } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, AlertTriangle, Package, Edit, TrendingDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddMedicationForm } from "@/components/inventory/add-medication-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InventoryPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    fetchMedications()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMedications(medications)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = medications.filter(
        (med) =>
          med.medication_name.toLowerCase().includes(query) ||
          med.description?.toLowerCase().includes(query) ||
          med.form.toLowerCase().includes(query),
      )
      setFilteredMedications(filtered)
    }
  }, [searchQuery, medications])

  const fetchMedications = async () => {
    try {
      const { data } = await clinicApi.getInventory()
      console.log("Fetched medications:", data)
      setMedications(data)
      setFilteredMedications(data)
    } catch (error) {
      console.error("Failed to fetch medications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMedicationAdded = () => {
    setIsAddDialogOpen(false)
    fetchMedications()
  }

  const getStockStatus = (medication: Medication) => {
    if (medication.quantity <= 0) {
      return { label: "Out of Stock", variant: "destructive" as const, icon: AlertTriangle }
    }
    if (medication.quantity <= medication.reorder_level) {
      return { label: "Low Stock", variant: "default" as const, icon: TrendingDown }
    }
    return { label: "In Stock", variant: "secondary" as const, icon: Package }
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 90 && daysUntilExpiry >= 0
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const lowStockMedications = medications.filter((med) => med.quantity <= med.reorder_level && med.quantity > 0)
  const outOfStockMedications = medications.filter((med) => med.quantity <= 0)
  const expiringMedications = medications.filter(
    (med) => isExpiringSoon(med.expiry_date) && !isExpired(med.expiry_date),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Track medications and medical supplies</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
            </DialogHeader>
            <AddMedicationForm onSuccess={handleMedicationAdded} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Low Stock Items</div>
            <TrendingDown className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockMedications.length}</div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Out of Stock</div>
            <AlertTriangle className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockMedications.length}</div>
            <p className="text-xs text-muted-foreground">Urgent restock needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Expiring Soon</div>
            <AlertTriangle className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringMedications.length}</div>
            <p className="text-xs text-muted-foreground">Within 90 days</p>
          </CardContent>
        </Card>
      </div>

      {(lowStockMedications.length > 0 || outOfStockMedications.length > 0 || expiringMedications.length > 0) && (
        <Alert>
          <AlertTriangle className="size-4" />
          <AlertDescription>
            You have {lowStockMedications.length + outOfStockMedications.length} items requiring attention and{" "}
            {expiringMedications.length} medications expiring within 90 days.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Medications</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="controlled">Controlled</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search medications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredMedications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? "No medications found matching your search" : "No medications in inventory"}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Dosage Form</TableHead>
                        <TableHead>Strength</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedications.map((medication) => {
                        const stockStatus = getStockStatus(medication)
                        const StatusIcon = stockStatus.icon
                        return (
                          <TableRow key={medication.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {medication.medication_name}
                                {medication.is_controlled && (
                                  <Badge variant="outline" className="text-xs">
                                    Controlled
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{medication.form}</TableCell>
                            <TableCell>{medication.dosage}</TableCell>
                            <TableCell>
                              <span
                                className={
                                  medication.quantity <= medication.reorder_level ? "font-semibold text-orange-600" : ""
                                }
                              >
                                {medication.quantity} {medication.unit}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={
                                  isExpired(medication.expiry_date)
                                    ? "text-red-600 font-semibold"
                                    : isExpiringSoon(medication.expiry_date)
                                      ? "text-yellow-600 font-semibold"
                                      : ""
                                }
                              >
                                {new Date(medication.expiry_date).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={stockStatus.variant} className="gap-1">
                                <StatusIcon className="size-3" />
                                {stockStatus.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon">
                                <Edit className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock">
          <Card>
            <CardContent className="pt-6">
              {lowStockMedications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No low stock items</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockMedications.map((medication) => (
                    <div key={medication.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">{medication.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Current: {medication.quantity} {medication.unit} | Reorder Level: {medication.reorder_level}{" "}
                          {medication.unit}
                        </p>
                      </div>
                      <Button size="sm">Reorder</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controlled">
          <Card>
            <CardContent className="pt-6">
              {medications.filter((m) => m.is_controlled).length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No controlled medications</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Strength</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medications
                        .filter((m) => m.is_controlled)
                        .map((medication) => {
                          const stockStatus = getStockStatus(medication)
                          return (
                            <TableRow key={medication.id}>
                              <TableCell className="font-medium">{medication.name}</TableCell>
                              <TableCell>{medication.strength}</TableCell>
                              <TableCell>
                                {medication.quantity} {medication.unit}
                              </TableCell>
                              <TableCell>
                                <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
