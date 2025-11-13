// Mock Data Service for Frontend Development
// This allows the frontend to work without the Laravel backend running

export const mockUsers = {
  admin: {
    id: 1,
    name: "Dr. Sarah Johnson",
    email: "admin@clinic.edu",
    role: "admin" as const,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  doctor: {
    id: 2,
    name: "Dr. Michael Chen",
    email: "doctor@clinic.edu",
    role: "doctor" as const,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
}

export const mockStudents = [
  {
    id: 1,
    student_id: "STU001",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@university.edu",
    phone: "+1234567890",
    date_of_birth: "2002-05-15",
    gender: "male",
    blood_type: "O+",
    allergies: "Penicillin, Peanuts",
    emergency_contact_name: "Jane Doe",
    emergency_contact_phone: "+1234567891",
    emergency_contact_relationship: "Mother",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    student_id: "STU002",
    first_name: "Emily",
    last_name: "Smith",
    email: "emily.smith@university.edu",
    phone: "+1234567892",
    date_of_birth: "2003-08-22",
    gender: "female",
    blood_type: "A+",
    allergies: "None",
    emergency_contact_name: "Robert Smith",
    emergency_contact_phone: "+1234567893",
    emergency_contact_relationship: "Father",
    created_at: "2024-01-16T11:00:00Z",
    updated_at: "2024-01-16T11:00:00Z",
  },
  {
    id: 3,
    student_id: "STU003",
    first_name: "Michael",
    last_name: "Johnson",
    email: "michael.j@university.edu",
    phone: "+1234567894",
    date_of_birth: "2001-12-10",
    gender: "male",
    blood_type: "B+",
    allergies: "Latex",
    emergency_contact_name: "Sarah Johnson",
    emergency_contact_phone: "+1234567895",
    emergency_contact_relationship: "Mother",
    created_at: "2024-01-17T09:00:00Z",
    updated_at: "2024-01-17T09:00:00Z",
  },
]

export const mockAppointments = [
  {
    id: 1,
    student_id: 1,
    student_name: "John Doe",
    appointment_date: "2024-03-20",
    appointment_time: "10:00",
    reason: "Annual checkup",
    status: "confirmed",
    notes: "Regular health screening",
    created_at: "2024-03-15T10:00:00Z",
  },
  {
    id: 2,
    student_id: 2,
    student_name: "Emily Smith",
    appointment_date: "2024-03-21",
    appointment_time: "14:30",
    reason: "Follow-up consultation",
    status: "pending",
    notes: "Check medication effectiveness",
    created_at: "2024-03-16T11:00:00Z",
  },
]

export const mockConsultations = [
  {
    id: 1,
    student_id: 1,
    student_name: "John Doe",
    consultation_date: "2024-03-10",
    chief_complaint: "Headache and fever",
    diagnosis: "Viral infection",
    treatment: "Rest and hydration",
    prescription: "Paracetamol 500mg, 3x daily",
    notes: "Follow up if symptoms persist after 3 days",
    doctor_name: "Dr. Sarah Johnson",
    created_at: "2024-03-10T14:00:00Z",
  },
]

export const mockInventory = [
  {
    id: 1,
    medication_name: "Paracetamol",
    generic_name: "Acetaminophen",
    dosage: "500mg",
    form: "Tablet",
    quantity: 500,
    reorder_level: 100,
    expiry_date: "2025-12-31",
    supplier: "PharmaCorp",
    is_controlled: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    medication_name: "Amoxicillin",
    generic_name: "Amoxicillin",
    dosage: "250mg",
    form: "Capsule",
    quantity: 80,
    reorder_level: 100,
    expiry_date: "2024-06-30",
    supplier: "MediSupply",
    is_controlled: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    medication_name: "Morphine",
    generic_name: "Morphine Sulfate",
    dosage: "10mg",
    form: "Injection",
    quantity: 25,
    reorder_level: 20,
    expiry_date: "2025-08-15",
    supplier: "ControlledMeds Inc",
    is_controlled: true,
    created_at: "2024-01-01T00:00:00Z",
  },
]

export const mockChronicConditions = [
  {
    id: 1,
    student_id: 1,
    student_name: "John Doe",
    condition_name: "Asthma",
    severity: "moderate",
    diagnosed_date: "2020-05-15",
    treatment_plan: "Inhaler as needed, avoid triggers",
    notes: "Exercise-induced asthma",
    created_at: "2024-01-15T10:00:00Z",
  },
]

export const mockControlledDispensing = [
  {
    id: 1,
    medication_id: 3,
    medication_name: "Morphine 10mg",
    student_id: 1,
    student_name: "John Doe",
    quantity_dispensed: 2,
    dispensed_by: "Dr. Sarah Johnson",
    dispensed_date: "2024-03-15",
    reason: "Post-surgery pain management",
    prescription_number: "RX-2024-001",
    created_at: "2024-03-15T10:00:00Z",
  },
]

export const mockDashboardStats = {
  total_students: 1247,
  appointments_today: 12,
  consultations_this_week: 45,
  low_stock_items: 3,
  expiring_medications: 2,
  pending_appointments: 8,
}

export const mockNotifications = [
  {
    id: 1,
    student_name: "John Doe",
    phone: "+1234567890",
    message: "Reminder: Your appointment is scheduled for tomorrow at 10:00 AM",
    status: "sent",
    sent_at: "2024-03-19T09:00:00Z",
  },
]

// Mock API delay to simulate network request
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockApi = {
  // Authentication
  login: async (email: string, password: string) => {
    await delay(500)
    // Accept any email/password for demo
    const user = email.includes("admin") ? mockUsers.admin : mockUsers.doctor
    return {
      token: "mock-jwt-token-" + Date.now(),
      user,
    }
  },

  logout: async () => {
    await delay(300)
    return { message: "Logged out successfully" }
  },

  // Students
  getStudents: async (params?: any) => {
    await delay(400)
    return {
      data: mockStudents,
      total: mockStudents.length,
      page: 1,
      per_page: 10,
    }
  },

  getStudent: async (id: number) => {
    await delay(300)
    return mockStudents.find((s) => s.id === id) || mockStudents[0]
  },

  createStudent: async (data: any) => {
    await delay(500)
    return { ...data, id: mockStudents.length + 1, created_at: new Date().toISOString() }
  },

  updateStudent: async (id: number, data: any) => {
    await delay(500)
    return { ...data, id, updated_at: new Date().toISOString() }
  },

  deleteStudent: async (id: number) => {
    await delay(300)
    return { message: "Student deleted successfully" }
  },

  // Appointments
  getAppointments: async (params?: any) => {
    await delay(400)
    return {
      data: mockAppointments,
      total: mockAppointments.length,
    }
  },

  createAppointment: async (data: any) => {
    await delay(500)
    return { ...data, id: mockAppointments.length + 1, created_at: new Date().toISOString() }
  },

  updateAppointment: async (id: number, data: any) => {
    await delay(500)
    return { ...data, id, updated_at: new Date().toISOString() }
  },

  deleteAppointment: async (id: number) => {
    await delay(300)
    return { message: "Appointment deleted successfully" }
  },

  // Consultations
  getConsultations: async (params?: any) => {
    await delay(400)
    return {
      data: mockConsultations,
      total: mockConsultations.length,
    }
  },

  createConsultation: async (data: any) => {
    await delay(500)
    return { ...data, id: mockConsultations.length + 1, created_at: new Date().toISOString() }
  },

  getConsultation: async (id: number) => {
    await delay(300)
    return mockConsultations.find((c) => c.id === id) || mockConsultations[0]
  },

  // Inventory
  getInventory: async (params?: any) => {
    await delay(400)
    return {
      data: mockInventory,
      total: mockInventory.length,
    }
  },

  createMedication: async (data: any) => {
    await delay(500)
    return { ...data, id: mockInventory.length + 1, created_at: new Date().toISOString() }
  },

  updateMedication: async (id: number, data: any) => {
    await delay(500)
    return { ...data, id, updated_at: new Date().toISOString() }
  },

  deleteMedication: async (id: number) => {
    await delay(300)
    return { message: "Medication deleted successfully" }
  },

  // Chronic Conditions
  getChronicConditions: async (params?: any) => {
    await delay(400)
    return {
      data: mockChronicConditions,
      total: mockChronicConditions.length,
    }
  },

  createChronicCondition: async (data: any) => {
    await delay(500)
    return { ...data, id: mockChronicConditions.length + 1, created_at: new Date().toISOString() }
  },

  updateChronicCondition: async (id: number, data: any) => {
    await delay(500)
    return { ...data, id, updated_at: new Date().toISOString() }
  },

  // Controlled Medications
  getControlledMedications: async () => {
    await delay(400)
    return {
      data: mockControlledDispensing,
      total: mockControlledDispensing.length,
    }
  },

  dispenseMedication: async (data: any) => {
    await delay(500)
    return { ...data, id: mockControlledDispensing.length + 1, created_at: new Date().toISOString() }
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    await delay(300)
    return mockDashboardStats
  },

  // Reports & Export
  exportData: async (request: any) => {
    await delay(1000)
    // Return a mock blob
    return new Blob(["Mock export data"], { type: "text/csv" })
  },

  // WhatsApp Notifications
  sendWhatsAppMessage: async (data: any) => {
    await delay(500)
    return { message: "WhatsApp message sent successfully", status: "sent" }
  },

  getNotificationHistory: async () => {
    await delay(400)
    return {
      data: mockNotifications,
      total: mockNotifications.length,
    }
  },
}
