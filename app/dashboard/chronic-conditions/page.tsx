"use client"

import { useEffect, useState, useRef } from "react"
import { clinicApi } from "@/lib/api-service"
import type { ChronicCondition } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, User, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddChronicConditionForm } from "@/components/chronic-conditions/add-chronic-condition-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ChronicConditionsPage() {
  // data
  const [conditions, setConditions] = useState<ChronicCondition[]>([])
  // pagination meta from backend
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [lastPage, setLastPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchInput, setSearchInput] = useState<string>("") // immediate input (debounced)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false)

  // debounce timer ref
  const searchDebounceRef = useRef<number | null>(null)

  // Fetch function (page + search)
  const fetchConditions = async (page = 1, search = "") => {
    setIsLoading(true)
    try {
      // Assuming clinicApi.getConditions(page, search) returns the entire paginator JSON.
      // If your clinicApi returns `res.data`, adapt accordingly.
      const res = await clinicApi.getConditions({ page, search })
      // res expected shape: { data: [...], current_page, last_page, per_page, total, next_page_url, prev_page_url }
      const payload = res

      setConditions(payload.data || [])
      setCurrentPage(payload.current_page || 1)
      setLastPage(payload.last_page || 1)
      setPerPage(payload.per_page || 10)
      setTotal(payload.total || 0)
    } catch (error) {
      console.error("Failed to fetch chronic conditions:", error)
      setConditions([])
      setCurrentPage(1)
      setLastPage(1)
      setPerPage(10)
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  // initial load
  useEffect(() => {
    fetchConditions(1, "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // handle search input with debounce
  useEffect(() => {
    // clear previous timer
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current)
    }

    // start new timer
    searchDebounceRef.current = window.setTimeout(() => {
      // when search executes, reset to page 1
      setCurrentPage(1)
      fetchConditions(1, searchInput.trim())
      setSearchQuery(searchInput.trim())
    }, 500)

    // cleanup on unmount
    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  // when page changes, fetch that page (keeping current searchQuery)
  useEffect(() => {
    fetchConditions(currentPage, searchQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const handleConditionAdded = () => {
    setIsAddDialogOpen(false)
    // reload current page and current search
    fetchConditions(1, searchQuery)
  }

  // Render helpers
  const ConditionCard = ({ condition }: { condition: ChronicCondition }) => (
    <Card>
      <CardContent className="p-4 space-y-4">

        {/* Condition Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{condition.condition_name}</span>
            <Badge className="capitalize">{condition.condition_type}</Badge>
          </div>

          {condition.condition_description && (
            <p className="text-sm text-muted-foreground mt-1">
              {condition.condition_description}
            </p>
          )}
        </div>

        <div className="h-px bg-muted" />

        {/* Students */}
        <div className="space-y-3">
          <p className="font-medium text-sm">Estudiantes con esta condición:</p>

          {condition.student_conditions?.map((sc) => (
            <Card key={sc.id} className="border border-muted">
              <CardContent className="p-3 space-y-2">

                {/* Student Name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="size-4" />
                    <span>
                      {sc.student?.first_name} {sc.student?.last_name}
                    </span>
                    <Badge variant="outline">{sc.student?.ku_id}</Badge>
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <a href={`/dashboard/students/${sc.student_id}`}>
                      Ver estudiante
                    </a>
                  </Button>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  <span>
                    Desde: {sc.start_date ? new Date(sc.start_date).toLocaleDateString() : "—"}
                    {sc.end_date &&
                      ` · Hasta: ${new Date(sc.end_date).toLocaleDateString()}`}
                  </span>
                </div>

                {/* Notes */}
                {sc.notes && (
                  <p className="text-xs text-muted-foreground">
                    <b>Notas:</b> {sc.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

      </CardContent>
    </Card>
  )

  // helpful small UI: page numbers (show up to ±2 around current)
  const renderPageNumbers = () => {
    const pages: (number | "...")[] = []
    const delta = 2
    const start = Math.max(1, currentPage - delta)
    const end = Math.min(lastPage, currentPage + delta)

    if (start > 1) pages.push(1)
    if (start > 2) pages.push("...")

    for (let p = start; p <= end; p++) pages.push(p)

    if (end < lastPage - 1) pages.push("...")
    if (end < lastPage) pages.push(lastPage)

    return pages.map((p, idx) =>
      p === "..." ? (
        <span key={`dots-${idx}`} className="px-2 text-sm text-muted-foreground">...</span>
      ) : (
        <Button
          key={`page-${p}`}
          variant={p === currentPage ? "default" : "ghost"}
          onClick={() => setCurrentPage(Number(p))}
          size="sm"
        >
          {p}
        </Button>
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Condiciones</h1>
          <p className="text-muted-foreground">
            Monitorea las condiciones médicas de cada estudiante
          </p>
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

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por condición o estudiante..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

                {/* Pagination controls */}
                <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
              >
                Previous
              </Button>

              {renderPageNumbers()}
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage >= lastPage || isLoading}
              >
                Next
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {lastPage} · {total} resultados
            </div>
          </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : conditions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No hay condiciones registradas.</p>
              </CardContent>
            </Card>
          ) : (
            conditions.map((condition) => (
              <ConditionCard key={condition.id} condition={condition} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
