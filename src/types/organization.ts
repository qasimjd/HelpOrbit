export interface Organization {
  id: string
  slug: string
  name: string
  logoUrl?: string
  primaryColor: string
  domain?: string
  settings: OrganizationSettings
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationSettings {
  allowPublicRegistration: boolean
  defaultTicketPriority: TicketPriority
  autoAssignTickets: boolean
  enableNotifications: boolean
  workingHours: {
    start: string
    end: string
    timezone: string
    workingDays: number[]
  }
}

export interface OrganizationBranding {
  logoUrl?: string
  primaryColor: string
}

// Default branding configuration
export const defaultBranding: OrganizationBranding = {
  primaryColor: '#3b82f6' // Blue-500
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'