"use server"

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type { LoginCredentials, ForgotPasswordRequest } from '@/types/auth'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  organizationSlug: z.string().min(1, 'Organization is required')
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  organizationSlug: z.string().min(1, 'Organization is required')
})

// Server action for login
export async function loginAction(prevState: any, formData: FormData) {
  try {
    // Extract form data
    const rawFormData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      organizationSlug: formData.get('organizationSlug') as string,
    }

    // Validate input
    const validatedFields = loginSchema.safeParse(rawFormData)
    
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Please check your input and try again.'
      }
    }

    const { email, password, organizationSlug } = validatedFields.data

    // TODO: Replace with actual authentication logic
    // This would typically:
    // 1. Verify organization exists
    // 2. Authenticate user credentials
    // 3. Check user has access to organization
    // 4. Create session/JWT
    
    // Mock authentication
    if (email === 'demo@example.com' && password === 'password') {
      // Set session cookie
      const cookieStore = await cookies()
      cookieStore.set('session', 'mock-session-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      // Redirect to dashboard
      redirect(`/org/${organizationSlug}/dashboard`)
    } else {
      return {
        success: false,
        message: 'Invalid email or password. Please try again.',
        errors: {}
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error // Re-throw redirect errors
    }
    
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      errors: {}
    }
  }
}

// Server action for forgot password
export async function forgotPasswordAction(prevState: any, formData: FormData) {
  try {
    // Extract form data
    const rawFormData = {
      email: formData.get('email') as string,
      organizationSlug: formData.get('organizationSlug') as string,
    }

    // Validate input
    const validatedFields = forgotPasswordSchema.safeParse(rawFormData)
    
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Please check your input and try again.'
      }
    }

    const { email, organizationSlug } = validatedFields.data

    // TODO: Replace with actual password reset logic
    // This would typically:
    // 1. Verify organization exists
    // 2. Check if user exists in organization
    // 3. Generate password reset token
    // 4. Send reset email
    
    // Mock success response
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

    return {
      success: true,
      message: `If an account with ${email} exists in ${organizationSlug}, we've sent a password reset link to your email.`,
      errors: {}
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      errors: {}
    }
  }
}

// Server action to validate organization
export async function validateOrganizationAction(slug: string) {
  try {
    // TODO: Replace with actual organization validation
    // This would typically query the database to check if organization exists
    
    // Mock validation - simulate some organizations existing with different themes
    const validOrganizations = [
      { slug: 'acme-corp', name: 'ACME Corporation', color: '#dc2626', mode: 'light' },
      { slug: 'techstart-inc', name: 'TechStart Inc', color: '#7c3aed', mode: 'dark' },
      { slug: 'global-solutions', name: 'Global Solutions Ltd', color: '#059669', mode: 'light' },
      { slug: 'innovate-labs', name: 'Innovate Labs', color: '#ea580c', mode: 'light' },
      { slug: 'blue-wave', name: 'Blue Wave Digital', color: '#2563eb', mode: 'dark' },
      { slug: 'purple-tech', name: 'Purple Tech Solutions', color: '#9333ea', mode: 'light' }
    ]
    
    const orgData = validOrganizations.find(org => org.slug === slug)
    
    if (orgData) {
      return {
        exists: true,
        organization: {
          id: '1',
          slug: orgData.slug,
          name: orgData.name,
          primaryColor: orgData.color,
          themeMode: orgData.mode as 'light' | 'dark',
          logoUrl: undefined,
          settings: {
            allowPublicRegistration: true,
            defaultTicketPriority: 'medium' as const,
            autoAssignTickets: false,
            enableNotifications: true,
            workingHours: {
              start: '09:00',
              end: '17:00',
              timezone: 'UTC',
              workingDays: [1, 2, 3, 4, 5]
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    }
    
    return {
      exists: false,
      organization: null
    }
  } catch (error) {
    console.error('Organization validation error:', error)
    return {
      exists: false,
      organization: null
    }
  }
}

// Server action to logout
export async function logoutAction() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/select-organization')
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}