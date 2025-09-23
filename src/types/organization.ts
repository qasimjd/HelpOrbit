export interface Organization {
  id: string
  slug: string
  name: string
  logoUrl?: string
  primaryColor: string
  themeMode: 'light' | 'dark' | 'auto'
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
  themeMode: 'light' | 'dark' | 'auto'
}

// Default branding configuration
export const defaultBranding: OrganizationBranding = {
  primaryColor: '#3b82f6', // Blue-500
  themeMode: 'light'
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'