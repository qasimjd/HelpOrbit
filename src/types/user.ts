/* eslint-disable @typescript-eslint/no-explicit-any */
// User related types
export interface User {
  id: string
  name: string
  email: string
  image?: string | null
  emailVerified?: boolean
  role?: string
  status?: string
  createdAt?: Date
  lastActiveAt?: Date
}

export interface UserSession {
  user: User
  session: {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    expiresAt: Date
    token: string
    ipAddress?: string
    userAgent?: string
    impersonatedBy?: string
    activeOrganizationId?: string
  }
}

export interface UserContextValue {
  user: User | null
  currentOrganization: Organization | null
  organizations: Organization[]
  isLoading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  setCurrentOrganization: (org: Organization) => void
}

// Organization related types
export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string | null
  metadata?: Record<string, any> | null
  createdAt?: Date
  updatedAt?: Date
}

export interface OrganizationMember {
  id: string
  userId: string
  organizationId: string
  role: 'owner' | 'admin' | 'member' | 'guest'
  createdAt: Date
  updatedAt?: Date
  user?: User
}

export type UserRole = 'owner' | 'admin' | 'member' | 'guest'

export interface OrganizationPermissions {
  canManageUsers: boolean
  canManageSettings: boolean
  canCreateTickets: boolean
  canManageTickets: boolean
  canDeleteOrganization: boolean
}