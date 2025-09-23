export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: UserRole
  organizationId: string
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  user: User
  organization: {
    id: string
    slug: string
    name: string
  }
  expiresAt: Date
}

export type UserRole = 'admin' | 'agent' | 'customer'

export interface LoginCredentials {
  email: string
  password: string
  organizationSlug: string
}

export interface ForgotPasswordRequest {
  email: string
  organizationSlug: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}