"use client"

import { useEffect, useState } from "react"
import { clinicApi } from "@/lib/api-service"
import type { ChronicCondition } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Heart, User, Calendar, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddChronicConditionForm } from "@/components/chronic-conditions/add-chronic-condition-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ChronicConditionsPage() {
  const [conditions, setConditions] = useState<ChronicCondition[]>([])
  const [filteredConditions, setFilteredConditions] = useState<ChronicCondition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    fetchConditions()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConditions(conditions)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = conditions.filter(
        (condition) =>
          condition.condition_name.toLowerCase().includes(query) ||
          condition.student?.first_name.toLowerCase().includes(query) ||
          condition.student?.last_name.toLowerCase().includes(query) ||
          condition.student?.student_id.toLowerCase().includes(query),
      )
      setFilteredConditions(filtered)
    }
  }, [searchQuery, conditions])

  const fetchConditions = async () => {
    try {
      const { data } = await clinicApi.getChronicConditions()
      setConditions(data)
      setFilteredConditions(data)
    } catch (error) {
      console.error("Failed to fetch chronic conditions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConditionAdded = () => {
    setIsAddDialogOpen(false)
    fetchConditions()
  }

  const getSeverityVariant = (severity: ChronicCondition["severity"]) => {
    switch (severity) {
      case "severe":
        return "destructive"
      case "moderate":
        return "default"
      default:
        return "secondary"
    }
  }

  const getSeverityColor = (severity: ChronicCondition["severity"]) => {
    switch (severity) {
      case "severe":
        return "text-red-600"
      case "moderate":
        return "text-orange-600"
      default:
        return "text-green-600"
    }
  }

  const filterBySeverity = (severity?: ChronicCondition["severity"]) => {
    if (!severity) return filteredConditions
    return filteredConditions.filter((c) => c.severity === severity)
  }

  const ConditionCard = ({ condition }: { condition: ChronicCondition }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Heart className={`size-4 ${getSeverityColor(condition.severity)}`} />
              <span className="font-semibold text-lg">{condition.condition_name}</span>
              <Badge variant={getSeverityVariant(condition.severity)} className="capitalize">
                {condition.severity}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4" />
              <span>
                {condition.student?.first_name} {condition.student?.last_name}
              </span>
              <Badge variant="outline">{condition.student?.student_id}</Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>Diagnosed: {new Date(condition.diagnosed_date).toLocaleDateString()}</span>
            </div>

            {condition.current_medications && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium mb-1">Current Medications:</p>
                <p className="text-sm text-muted-foreground">{condition.current_medications}</p>
              </div>
            )}

            {condition.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p>{condition.notes}</p>
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" asChild>
            <a href={`/dashboard/students/${condition.student_id}`}>View Student</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const severeCount = conditions.filter((c) => c.severity === "severe").length
  const moderateCount = conditions.filter((c) => c.severity === "moderate").length
  const mildCount = conditions.filter((c) => c.severity === "mild").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chronic Conditions</h1>
          <p className="text-muted-foreground">Track and manage long-term health conditions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Add Condition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Chronic Condition</DialogTitle>
            </DialogHeader>
            <AddChronicConditionForm onSuccess={handleConditionAdded} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Severe Cases</div>
            <AlertCircle className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{severeCount}</div>
            <p className="text-xs text-muted-foreground">Require close monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Moderate Cases</div>
            <AlertCircle className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderateCount}</div>
            <p className="text-xs text-muted-foreground">Regular monitoring needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Mild Cases</div>
            <Heart className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mildCount}</div>
            <p className="text-xs text-muted-foreground">Stable conditions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by condition or student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Conditions</TabsTrigger>
          <TabsTrigger value="severe">Severe</TabsTrigger>
          <TabsTrigger value="moderate">Moderate</TabsTrigger>
          <TabsTrigger value="mild">Mild</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : filteredConditions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No chronic conditions recorded</p>
              </CardContent>
            </Card>
          ) : (
            filteredConditions.map((condition) => <ConditionCard key={condition.id} condition={condition} />)
          )}
        </TabsContent>

        <TabsContent value="severe" className="space-y-4">
          {filterBySeverity("severe").map((condition) => (
            <ConditionCard key={condition.id} condition={condition} />
          ))}
        </TabsContent>

        <TabsContent value="moderate" className="space-y-4">
          {filterBySeverity("moderate").map((condition) => (
            <ConditionCard key={condition.id} condition={condition} />
          ))}
        </TabsContent>

        <TabsContent value="mild" className="space-y-4">
          {filterBySeverity("mild").map((condition) => (
            <ConditionCard key={condition.id} condition={condition} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
