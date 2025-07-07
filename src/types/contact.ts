// Contact form types
export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  honeypot?: string // Bot prevention field
}

export interface ContactFormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
  general?: string
}

export interface ContactSubmissionResponse {
  success: boolean
  message?: string
  error?: string
  data?: {
    id: string
    created_at: string
  }
}

// Contact information types
export interface ContactInfo {
  email: string
  phone?: string
  location: string
  socialLinks: SocialLink[]
  availability: AvailabilityInfo
}

export interface SocialLink {
  platform: string
  url: string
  username?: string
  is_active: boolean
  icon_class?: string
  order?: number
}

export interface AvailabilityInfo {
  status: string
  responseTime: string
  timezone: string
}

// API response types
export interface ContactInfoResponse {
  success: boolean
  data?: ContactInfo
  error?: string
}

// Form validation types
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => boolean | string
}

export interface FormValidationRules {
  name: ValidationRule
  email: ValidationRule
  subject?: ValidationRule
  message: ValidationRule
}

// Contact submission tracking
export interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  replied_at?: string
  ip_address?: string
  user_agent?: string
  referrer?: string
}

export default ContactFormData
