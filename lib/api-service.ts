// API Service Layer for Laravel Backend Integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

const USE_MOCK_DATA = true

interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    // Add auth token if available
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type")

    console.log("[v0] API Response:", {
      url: response.url,
      status: response.status,
      contentType,
      ok: response.ok,
    })

    // Check if response is HTML instead of JSON
    if (contentType && contentType.includes("text/html")) {
      console.error("[v0] Received HTML instead of JSON. Backend might not be running or URL is incorrect.")
      throw new Error(
        "Cannot connect to the backend server. Please ensure your Laravel backend is running at " + this.baseUrl,
      )
    }

    if (!response.ok) {
      try {
        const error: ApiError = await response.json()
        console.error("API Error:", error.message, error.errors)
        throw new Error(error.message || `Request failed with status ${response.status}`)
      } catch (e) {
        if (e instanceof Error && e.message.includes("connect to the backend")) {
          throw e
        }
        console.error("Failed to parse error response:", e)
        throw new Error(`Request failed with status ${response.status}`)
      }
    }

    try {
      return await response.json()
    } catch (e) {
      console.error("[v0] Failed to parse JSON response:", e)
      throw new Error("Invalid response from server")
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: this.getHeaders(),
      })
      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error("[v0] Network error - backend not reachable")
        throw new Error("Cannot connect to backend. Please ensure Laravel is running at " + this.baseUrl)
      }
      throw error
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      console.log("[v0] POST Request:", { url: `${this.baseUrl}${endpoint}`, data })
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error("[v0] Network error - backend not reachable")
        throw new Error("Cannot connect to backend. Please ensure Laravel is running at " + this.baseUrl)
      }
      throw error
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<T>(response)
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    })
    return this.handleResponse<T>(response)
  }

  async getBinary(endpoint: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: {
          Accept: "*/*",   // allow images
        }
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch binary data");
      }
  
      return await response.blob();   // return raw binary
    } catch (err) {
      console.error("Binary fetch error:", err);
      throw err;
    }
  }
  
}

export const apiService = new ApiService(API_BASE_URL)

// Type definitions for API responses
export interface User {
  id: number
  name: string
  email: string
  role: "admin" | "doctor" | "nurse" | "staff"
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Export data interface and method
export interface ExportDataRequest {
  reportType: string
  dateFrom: string
  dateTo: string
  format: "pdf" | "excel" | "csv"
  includeFields: {
    personalInfo: boolean
    medicalHistory: boolean
    consultations: boolean
    medications: boolean
    chronicConditions: boolean
  }
}

import { mockApi } from "./mock-data"

// Extended API Service with all clinic endpoints
export const clinicApi = {
  // Authentication
  login: (email: string, password: string) =>
    USE_MOCK_DATA ? mockApi.login(email, password) : apiService.post<AuthResponse>("/auth/login", { email, password }),

  logout: () => (USE_MOCK_DATA ? mockApi.logout() : apiService.post("/auth/logout")),

  // Students
  getStudents: (params?: { search?: string; page?: number }) =>
    //USE_MOCK_DATA ? mockApi.getStudents(params) : 
  apiService.get(`/students?${new URLSearchParams(params as any)}`),

  getStudent: (id: number) => /*(USE_MOCK_DATA ? mockApi.getStudent(id) :*/ apiService.get(`/students/${id}`),

  createStudent: (data: any) => (/*USE_MOCK_DATA ? mockApi.createStudent(data) :*/ apiService.post("/students", data)),

  updateStudent: (id: number, data: any) =>
    USE_MOCK_DATA ? mockApi.updateStudent(id, data) : apiService.put(`/students/${id}`, data),

  deleteStudent: (id: number) => (USE_MOCK_DATA ? mockApi.deleteStudent(id) : apiService.delete(`/students/${id}`)),

  // ----------- Programs ------------
  getPrograms: () =>
    apiService.get("/programs"),

  // Appointments
  getAppointments: (params?: { status?: string; date?: string }) =>
    USE_MOCK_DATA
      ? mockApi.getAppointments(params)
      : apiService.get(`/appointments?${new URLSearchParams(params as any)}`),

  createAppointment: (data: any) =>
    USE_MOCK_DATA ? mockApi.createAppointment(data) : apiService.post("/appointments", data),

  updateAppointment: (id: number, data: any) =>
    USE_MOCK_DATA ? mockApi.updateAppointment(id, data) : apiService.put(`/appointments/${id}`, data),

  deleteAppointment: (id: number) =>
    USE_MOCK_DATA ? mockApi.deleteAppointment(id) : apiService.delete(`/appointments/${id}`),

  // Consultations
  getConsultations: (params?: { student_id?: number; date?: string }) =>
    USE_MOCK_DATA
      ? mockApi.getConsultations(params)
      : apiService.get(`/consultations?${new URLSearchParams(params as any)}`),

  createConsultation: (data: any) =>
    /*USE_MOCK_DATA ? mockApi.createConsultation(data) :*/ apiService.post("/consultations", data),

  getConsultation: (id: number) =>
    USE_MOCK_DATA ? mockApi.getConsultation(id) : apiService.get(`/consultations/${id}`),

  // Medications
  getMedications: (params?: { search?: string; controlled?: boolean }) =>
    apiService.get(`/medications?${new URLSearchParams(params as any)}`),

  // Inventory

  getInventory: (params?: { search?: string; status?: string }) =>
    USE_MOCK_DATA ? mockApi.getInventory(params) : apiService.get(`/inventory?${new URLSearchParams(params as any)}`),

  createMedication: (data: any) =>
    USE_MOCK_DATA ? mockApi.createMedication(data) : apiService.post("/inventory", data),

  updateMedication: (id: number, data: any) =>
    USE_MOCK_DATA ? mockApi.updateMedication(id, data) : apiService.put(`/inventory/${id}`, data),

  deleteMedication: (id: number) =>
    USE_MOCK_DATA ? mockApi.deleteMedication(id) : apiService.delete(`/inventory/${id}`),

  // ----------- Conditions ------------
  
  getConditions: (params? : { search?: string; }) =>
    apiService.get(`/conditions?${new URLSearchParams(params as any)}`),

  createChronicCondition: (data: any) =>
    apiService.post("/conditions", data),

  getChronicConditions: (params?: { student_id?: number }) =>
    USE_MOCK_DATA
      ? mockApi.getChronicConditions(params)
      : apiService.get(`/chronic-conditions?${new URLSearchParams(params as any)}`),

  updateChronicCondition: (id: number, data: any) =>
    USE_MOCK_DATA ? mockApi.updateChronicCondition(id, data) : apiService.put(`/chronic-conditions/${id}`, data),

  // Controlled Medications
  getControlledMedications: () =>
    USE_MOCK_DATA ? mockApi.getControlledMedications() : apiService.get("/controlled-medications"),

  dispenseMedication: (data: any) =>
    USE_MOCK_DATA ? mockApi.dispenseMedication(data) : apiService.post("/controlled-medications/dispense", data),

  // Dashboard Stats
  getDashboardStats: () => (USE_MOCK_DATA ? mockApi.getDashboardStats() : apiService.get("/dashboard/stats")),

  // DSL
  validateRule: async (rule: string) => {
    const response = await fetch(`${API_BASE_URL}/rules/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ rule }),
    });
  
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Invalid JSON from server");
    }
  
    // Return **both status and JSON** so the frontend can decide
    return { status: response.status, ok: data.ok, ...data };
  },
  
  saveRule: async (rule: string) => {
    const response = await fetch(`${API_BASE_URL}/rules/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ rule }),
    });
  
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Invalid JSON from server");
    }
  
    return { status: response.status, ok: data.ok, ...data };
  },

  getASTImage: () =>
    apiService.getBinary("/rules/ast"),

  // Reports & Export
  exportData: async (request: ExportDataRequest) => {
    if (USE_MOCK_DATA) {
      return mockApi.exportData(request)
    }

    const response = await fetch(`${API_BASE_URL}/reports/export`, {
      method: "POST",
      headers: apiService["getHeaders"](),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error("Export failed")
    }

    return response.blob()
  },

  // WhatsApp Notifications
  sendWhatsAppMessage: (data: { phone: string; message: string }) =>
    USE_MOCK_DATA ? mockApi.sendWhatsAppMessage(data) : apiService.post("/notifications/whatsapp", data),

  getNotificationHistory: () =>
    USE_MOCK_DATA ? mockApi.getNotificationHistory() : apiService.get("/notifications/history"),
}
