// Shared TypeScript types for the clinic application

export interface Student {
  id: number
  student_id: string
  first_name: string
  last_name: string
  ku_email: string
  phone: string
  ku_id: string
  date_of_birth: string
  residence: string
  gender: "male" | "female" | "other"
  blood_type?: string
  allergies?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  created_at: string
  updated_at: string
}

export interface Consultation {
  id: number
  student_id: number
  doctor_id: number
  consultation_date: string
  chief_complaint: string
  diagnosis: string
  treatment_plan: string
  notes?: string
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  student?: Student
  doctor?: User
}

export interface Appointment {
  id: number
  student_id: number
  doctor_id?: number
  appointment_date: string
  appointment_time: string
  reason: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes?: string
  created_at: string
  updated_at: string
  student?: Student
  doctor?: User
}

export interface Medication {
  id: number
  name: string
  description?: string
  dosage_form: string
  strength: string
  quantity: number
  unit: string
  expiry_date: string
  is_controlled: boolean
  reorder_level: number
  supplier?: string
  created_at: string
  updated_at: string
}

export interface MedicationDispense {
  id: number
  student_id: number
  medication_id: number
  consultation_id?: number
  quantity_dispensed: number
  dispensed_by: number
  dispensed_at: string
  instructions: string
  created_at: string
  updated_at: string
  student?: Student
  medication?: Medication
}

export interface ChronicCondition {
  id: number
  student_id: number
  condition_name: string
  condition_type: string
  diagnosed_date: string
  severity: "mild" | "moderate" | "severe"
  current_medications?: string
  notes?: string
  created_at: string
  updated_at: string
  student?: Student
}

export interface User {
  id: number
  name: string
  email: string
  role: "admin" | "doctor" | "nurse" | "staff"
  created_at: string
  updated_at: string
}
