"use server"

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { z } from 'zod'
import { auth } from '@/lib/auth'
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

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
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
      intent: formData.get('intent') as string,
    }

    const rememberMe = formData.get('rememberMe') === 'on'

    // For general auth flow (intent=create-organization), we don't need organizationSlug
    const loginSchema = rawFormData.intent === 'create-organization' 
      ? z.object({
          email: z.string().email('Please enter a valid email address'),
          password: z.string().min(6, 'Password must be at least 6 characters'),
          intent: z.string().optional(),
        })
      : z.object({
          email: z.string().email('Please enter a valid email address'),
          password: z.string().min(6, 'Password must be at least 6 characters'),
          organizationSlug: z.string().min(1, 'Organization is required'),
          intent: z.string().optional(),
        })

    // Validate input
    const validatedFields = loginSchema.safeParse(rawFormData)
    
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Please check your input and try again.'
      }
    }

    const { email, password, intent } = validatedFields.data
    const organizationSlug = 'organizationSlug' in validatedFields.data ? validatedFields.data.organizationSlug : undefined

    // Sign in with Better Auth
    const signInResult = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe: rememberMe || false
      },
      headers: await headers(),
    })

    if (!signInResult) {
      return {
        success: false,
        message: 'Invalid email or password. Please try again.',
        errors: {}
      }
    }

    // Handle different intents
    if (intent === 'create-organization') {
      // After successful login, redirect to select organization with create intent
      redirect('/select-organization?create=true')
    } else if (organizationSlug) {
      // Original organization-specific login flow
      // After successful login, check if user has access to the organization
      const session = await auth.api.getSession({
        headers: await headers()
      })

      if (!session?.user) {
        return {
          success: false,
          message: 'Authentication failed. Please try again.',
          errors: {}
        }
      }

      // Get user's organizations to verify access
      const userOrgs = await auth.api.listOrganizations({
        headers: await headers()
      })

      const hasAccess = userOrgs?.some((org: any) => 
        org.slug === organizationSlug
      )

      if (!hasAccess) {
        return {
          success: false,
          message: 'You do not have access to this organization.',
          errors: {}
        }
      }

      // Redirect to dashboard
      redirect(`/org/${organizationSlug}/dashboard`)
    } else {
      // Default redirect for general login
      redirect('/select-organization')
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

    const { email } = validatedFields.data

    // Send password reset email using Better Auth
    await auth.api.forgetPassword({
      body: {
        email,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
      },
      headers: await headers()
    })

    return {
      success: true,
      message: `If an account with ${email} exists, we've sent a password reset link to your email.`,
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
    // Import database query function
    const { getOrganizationBySlug } = await import('@/server/db/queries')
    
    // Query the database for the organization
    const organization = await getOrganizationBySlug(slug)
    
    if (organization) {
      // Parse metadata if it exists (it might contain additional settings like primaryColor)
      let metadata = {};
      if (organization.metadata) {
        try {
          metadata = JSON.parse(organization.metadata);
        } catch (e) {
          console.warn('Failed to parse organization metadata:', e);
        }
      }

      return {
        exists: true,
        organization: {
          id: organization.id,
          slug: organization.slug,
          name: organization.name,
          primaryColor: (metadata as any).primaryColor || '#3b82f6', // Default blue if no color set
          themeMode: ((metadata as any).themeMode || 'light') as 'light' | 'dark' | 'auto',
          logoUrl: organization.logo || undefined,
          settings: {
            allowPublicRegistration: (metadata as any).allowPublicRegistration ?? true,
            defaultTicketPriority: ((metadata as any).defaultTicketPriority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
            autoAssignTickets: (metadata as any).autoAssignTickets ?? false,
            enableNotifications: (metadata as any).enableNotifications ?? true,
            workingHours: (metadata as any).workingHours || {
              start: '09:00',
              end: '17:00',
              timezone: 'UTC',
              workingDays: [1, 2, 3, 4, 5]
            }
          },
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt
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

// Server action for sign up
export async function signUpAction(prevState: any, formData: FormData) {
  try {
    // Extract form data
    const rawFormData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      organizationSlug: formData.get('organizationSlug') as string,
      intent: formData.get('intent') as string,
    }

    // For general auth flow (intent=create-organization), we don't need organizationSlug
    const signUpSchemaToUse = rawFormData.intent === 'create-organization'
      ? z.object({
          email: z.string().email('Please enter a valid email address'),
          password: z.string().min(8, 'Password must be at least 8 characters'),
          name: z.string().min(1, 'Name is required'),
          intent: z.string().optional(),
        })
      : signUpSchema

    // Validate input
    const validatedFields = signUpSchemaToUse.safeParse(rawFormData)
    
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Please check your input and try again.'
      }
    }

    const { email, password, name } = validatedFields.data
    const intent = 'intent' in validatedFields.data ? validatedFields.data.intent : rawFormData.intent
    const organizationSlug = 'organizationSlug' in validatedFields.data ? validatedFields.data.organizationSlug : undefined

    // Determine callback URL based on intent
    const callbackURL = intent === 'create-organization' 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/select-organization?create=true`
      : organizationSlug 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/org/${organizationSlug}/dashboard`
        : `${process.env.NEXT_PUBLIC_APP_URL}/select-organization`

    // Sign up with Better Auth
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        callbackURL
      },
      headers: await headers(),
    })

    if (!signUpResult) {
      return {
        success: false,
        message: 'Failed to create account. Please try again.',
        errors: {}
      }
    }

    // Handle different intents
    if (intent === 'create-organization') {
      return {
        success: true,
        message: 'Account created successfully! You can now create your organization.',
        errors: {},
        redirect: '/select-organization?create=true'
      }
    } else {
      return {
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        errors: {}
      }
    }
  } catch (error) {
    console.error('Sign up error:', error)
    
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

// Server action to logout
export async function logoutAction() {
  try {
    await auth.api.signOut({
      headers: await headers()
    })
    
    redirect('/select-organization')
  } catch (error) {
    console.error('Logout error:', error)
    
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error // Re-throw redirect errors
    }
    
    throw error
  }
}