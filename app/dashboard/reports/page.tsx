"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api-service"

export default function ReportsPage() {
  const [reportType, setReportType] = useState<string>("")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [format, setFormat] = useState<"pdf" | "excel" | "csv">("pdf")
  const [isExporting, setIsExporting] = useState(false)
  const [includeFields, setIncludeFields] = useState({
    personalInfo: true,
    medicalHistory: true,
    consultations: true,
    medications: true,
    chronicConditions: true,
  })

  const handleExport = async () => {
    if (!reportType || !dateFrom || !dateTo) {
      alert("Please select report type and date range")
      return
    }

    setIsExporting(true)
    try {
      const response = await apiService.exportData({
        reportType,
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
        format,
        includeFields,
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `clinic-report-${reportType}-${format}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export data. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Data Export</h1>
        <p className="text-muted-foreground mt-2">Generate and export clinic reports in various formats</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export Configuration</CardTitle>
            <CardDescription>Select report type and date range</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultations">Consultations Report</SelectItem>
                  <SelectItem value="appointments">Appointments Report</SelectItem>
                  <SelectItem value="students">Student Records</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="medications">Medication Dispensing</SelectItem>
                  <SelectItem value="chronic">Chronic Conditions</SelectItem>
                  <SelectItem value="controlled">Controlled Medications</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Include Fields</CardTitle>
            <CardDescription>Select data to include in the report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="personalInfo"
                checked={includeFields.personalInfo}
                onCheckedChange={(checked) => setIncludeFields({ ...includeFields, personalInfo: checked as boolean })}
              />
              <Label htmlFor="personalInfo" className="cursor-pointer">
                Personal Information
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="medicalHistory"
                checked={includeFields.medicalHistory}
                onCheckedChange={(checked) =>
                  setIncludeFields({ ...includeFields, medicalHistory: checked as boolean })
                }
              />
              <Label htmlFor="medicalHistory" className="cursor-pointer">
                Medical History
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="consultations"
                checked={includeFields.consultations}
                onCheckedChange={(checked) => setIncludeFields({ ...includeFields, consultations: checked as boolean })}
              />
              <Label htmlFor="consultations" className="cursor-pointer">
                Consultations
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="medications"
                checked={includeFields.medications}
                onCheckedChange={(checked) => setIncludeFields({ ...includeFields, medications: checked as boolean })}
              />
              <Label htmlFor="medications" className="cursor-pointer">
                Medications
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="chronicConditions"
                checked={includeFields.chronicConditions}
                onCheckedChange={(checked) =>
                  setIncludeFields({ ...includeFields, chronicConditions: checked as boolean })
                }
              />
              <Label htmlFor="chronicConditions" className="cursor-pointer">
                Chronic Conditions
              </Label>
            </div>

            <Button onClick={handleExport} disabled={isExporting} className="w-full mt-6">
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
          <CardDescription>Generate commonly used reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto flex-col items-start p-4 bg-transparent">
              <FileText className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Daily Summary</div>
                <div className="text-sm text-muted-foreground">Today's activities</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start p-4 bg-transparent">
              <FileText className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Weekly Report</div>
                <div className="text-sm text-muted-foreground">Last 7 days</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start p-4 bg-transparent">
              <FileText className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Monthly Report</div>
                <div className="text-sm text-muted-foreground">Current month</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start p-4 bg-transparent">
              <FileText className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Inventory Status</div>
                <div className="text-sm text-muted-foreground">Current stock levels</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start p-4 bg-transparent">
              <FileText className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Expiring Medications</div>
                <div className="text-sm text-muted-foreground">Next 30 days</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start p-4 bg-transparent">
              <FileText className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Chronic Patients</div>
                <div className="text-sm text-muted-foreground">Active conditions</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
