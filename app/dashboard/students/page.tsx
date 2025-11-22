"use client"

import { useEffect, useState, useRef } from "react"
import { clinicApi } from "@/lib/api-service"
import type { Student } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Eye, Edit, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddStudentForm } from "@/components/students/add-student-form"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  // search
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const debounceRef = useRef<number | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [error, setError] = useState("")

  const fetchStudents = async (page = 1, search = "") => {
    setIsLoading(true)
    try {
      setError("")
      const res = await clinicApi.getStudents({ page, search })

      setStudents(res.data || [])
      setCurrentPage(res.current_page)
      setLastPage(res.last_page)
      setTotal(res.total)
    } catch (err: any) {
      setError(err.message || "Failed to fetch students")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents(1, "")
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = window.setTimeout(() => {
      setCurrentPage(1)
      setSearchQuery(searchInput.trim())
      fetchStudents(1, searchInput.trim())
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchInput])

  useEffect(() => {
    fetchStudents(currentPage, searchQuery)
  }, [currentPage])

  const handleStudentAdded = () => {
    setIsAddDialogOpen(false)
    fetchStudents(1, searchQuery)
  }

  const renderPageNumbers = () => {
    const pages = []
    const delta = 2

    const start = Math.max(1, currentPage - delta)
    const end = Math.min(lastPage, currentPage + delta)

    if (start > 1) pages.push(1)
    if (start > 2) pages.push("...")

    for (let p = start; p <= end; p++) pages.push(p)

    if (end < lastPage - 1) pages.push("...")
    if (end < lastPage) pages.push(lastPage)

    return pages.map((p, i) =>
      p === "..."
        ? <span key={i} className="px-2 text-muted-foreground">...</span>
        : (
          <Button
            key={p}
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
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Records de Estudiantes</h1>
          <p className="text-muted-foreground">Maneja y monitorea los records médicos de cada estudiante</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Agregar Record de Estudiante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-4">
              <DialogTitle>Record</DialogTitle>
            </DialogHeader>
            <AddStudentForm onSuccess={handleStudentAdded} />
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH */}
      <Card>
        <CardHeader>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, ID o email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

        {/* PAGINATION */}
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
              Página {currentPage} - {lastPage} · {total} resultados
            </div>
          </div>

        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* TABLE OR LOADING */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? "No students found" : "No hay estudiantes registrados"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Celular</TableHead>
                    <TableHead>Programa</TableHead>
                    <TableHead>Residencia</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.ku_id}</TableCell>
                      <TableCell>{student.first_name} {student.last_name}</TableCell>
                      <TableCell>{student.ku_email}</TableCell>
                      <TableCell>{student.contact_numbers?.[0]?.phone_number ?? "N/A"}</TableCell>
                      <TableCell>
                        {student.program ? (
                          <Badge variant="outline">{student.program.program_name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.residence}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/dashboard/students/${student.id}`}>
                              <Eye className="size-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
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
