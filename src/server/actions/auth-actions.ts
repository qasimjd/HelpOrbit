"use server"

import { headers } from 'next/headers'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import type { LoginCredentials, ForgotPasswordRequest } from '@/types/auth'
import {
  loginSchema,
  loginWithoutOrgSchema,
  serverSignUpSchema,
  serverSignUpWithoutOrgSchema,
  forgotPasswordSchema
} from '@/schemas/auth'

// Server action for login
export async function loginAction(prevState: any, formData: FormData) {
  try {
    // Check if formData is actually a FormData object
    if (!formData || typeof formData.get !== 'function') {
      console.error('Invalid formData object received:', formData)
      return {
        success: false,
        message: 'Invalid form data received. Please try again.',
        errors: {}
      }
    }

    // Extract form data
    const rawFormData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      organizationSlug: formData.get('organizationSlug') as string,
      intent: formData.get('intent') as string | null,
    }

    const rememberMe = formData.get('rememberMe') === 'on'

    console.log('Raw form data:', {
      email: rawFormData.email,
      hasPassword: !!rawFormData.password,
      organizationSlug: rawFormData.organizationSlug,
      intent: rawFormData.intent
    })

    // Clean up the form data - convert null/empty intent to undefined
    const cleanedFormData = {
      ...rawFormData,
      intent: rawFormData.intent && rawFormData.intent.trim() !== "" ? rawFormData.intent : undefined
    }

    // For general auth flow (intent=create-organization), we don't need organizationSlug
    const schemaToUse = cleanedFormData.intent === 'create-organization'
      ? loginWithoutOrgSchema
      : loginSchema.extend({ intent: z.string().optional() })

    console.log('Using schema for intent:', cleanedFormData.intent, schemaToUse === loginWithoutOrgSchema ? 'loginWithoutOrgSchema' : 'loginSchema')

    // Validate input
    const validatedFields = schemaToUse.safeParse(cleanedFormData)

    if (!validatedFields.success) {
      console.log('Validation failed:', validatedFields.error.flatten().fieldErrors)
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Please check your input and try again.'
      }
    }

    const { email, password, intent } = validatedFields.data
    const organizationSlug = 'organizationSlug' in validatedFields.data ? validatedFields.data.organizationSlug : undefined

    // Sign in with Better Auth
    console.log('Attempting sign in for email:', email, 'with org slug:', organizationSlug)

    let signInResult;
    try {
      signInResult = await auth.api.signInEmail({
        body: {
          email,
          password,
          rememberMe: rememberMe || false
        },
        headers: await headers(),
      })
      console.log('Sign in result:', signInResult ? 'Success' : 'Failed', signInResult?.user ? 'Has user' : 'No user')
    } catch (authError: any) {
      console.error('Auth API error:', authError)

      // Simply display the backend error message
      const errorMessage = authError?.body?.message || authError?.message || 'Invalid email or password. Please try again.'

      return {
        success: false,
        message: errorMessage,
        errors: {}
      }
    }

    if (!signInResult || !signInResult.user) {
      console.log('Sign in failed - no result or user')
      return {
        success: false,
        message: 'Invalid email or password. Please try again.',
        errors: {}
      }
    }

    // Handle different intents
    if (intent === 'create-organization') {
      // After successful login, return redirect path for client-side navigation
      return {
        success: true,
        message: 'Login successful!',
        errors: {},
        redirectTo: '/org'
      }
    } else if (organizationSlug) {
      // Original organization-specific login flow
      // After successful login, check if user has access to the organization
      // Use the signInResult user instead of making a separate session call
      const user = signInResult.user

      if (!user) {
        return {
          success: false,
          message: 'Authentication failed. Please try again.',
          errors: {}
        }
      }

      // Get user's organizations to verify access
      try {
        const userOrgs = await auth.api.listOrganizations({
          headers: await headers()
        })

        console.log('User organizations found:', userOrgs?.length || 0)
        console.log('Looking for organization slug:', organizationSlug)

        const hasAccess = userOrgs?.some((org: any) =>
          org.slug === organizationSlug
        )

        if (!hasAccess) {
          console.log('User does not have access to organization:', organizationSlug)
          return {
            success: false,
            message: 'You do not have access to this organization.',
            errors: {}
          }
        }

        console.log('User has access to organization:', organizationSlug)
      } catch (orgError) {
        console.error('Error fetching user organizations:', orgError)
        // If we can't fetch organizations, let's still allow login and handle it later
        console.log('Proceeding with login despite organization check failure')
      }

      // Return redirect path for client-side navigation
      return {
        success: true,
        message: 'Login successful!',
        errors: {},
        redirectTo: `/org/${organizationSlug}/dashboard`
      }
    } else {
      // Default redirect for general login
      return {
        success: true,
        message: 'Login successful!',
        errors: {},
        redirectTo: '/select-organization'
      }
    }
  } catch (error) {
    // Check if this is a Next.js redirect first (before logging as error)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error // Re-throw redirect errors - this is normal Next.js behavior
    }

    console.error('Login error:', error)

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
    // Check if formData is actually a FormData object
    if (!formData || typeof formData.get !== 'function') {
      console.error('Invalid formData object received:', formData)
      return {
        success: false,
        message: 'Invalid form data received. Please try again.',
        errors: {}
      }
    }

    // Extract form data
    const rawFormData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      organizationSlug: formData.get('organizationSlug') as string,
      intent: formData.get('intent') as string,
    }

    console.log('Sign up raw form data:', {
      email: rawFormData.email,
      hasPassword: !!rawFormData.password,
      name: rawFormData.name,
      organizationSlug: rawFormData.organizationSlug,
      intent: rawFormData.intent
    })

    // For general auth flow (intent=create-organization), we don't need organizationSlug
    const signUpSchemaToUse = rawFormData.intent === 'create-organization'
      ? serverSignUpWithoutOrgSchema
      : serverSignUpSchema

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

    // Sign up with Better Auth
    let signUpResult;
    try {
      signUpResult = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
          callbackURL: "/email-verified"
        },
        headers: await headers(),
      })
    } catch (authError: any) {
      console.error('Better Auth signup error:', authError)

      // Simply display the backend error message
      const errorMessage = authError?.body?.message || authError?.message || 'Failed to create account. Please try again.'

      return {
        success: false,
        message: errorMessage,
        errors: {}
      }
    }

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
        redirectTo: '/select-organization'
      }
    } else {
      return {
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        errors: {},
        redirectTo: organizationSlug ? `/org/${organizationSlug}/dashboard` : '/select-organization'
      }
    }
  } catch (error) {
    // Check if this is a Next.js redirect first (before logging as error)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error // Re-throw redirect errors - this is normal Next.js behavior
    }

    console.error('Sign up error:', error)

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

    return {
      success: true,
      message: 'Logged out successfully',
      redirectTo: '/select-organization'
    }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      message: 'Failed to logout. Please try again.',
      redirectTo: null
    }
  }
}

// Server action to send verification email
export async function sendVerificationEmailAction() {
  try {
    // You may need to get the current user's email from session or context
    const session = await auth.api.getSession({ headers: await headers() });
    const email = session?.user?.email;
    if (!email) throw new Error('No user email found for verification email.');

    await auth.api.sendVerificationEmail({
      body: { email },
      headers: await headers()
    })

    return {
      success: true,
      message: 'Verification email sent successfully! Please check your inbox.'
    }
  } catch (error: any) {
    console.error('Send verification email error:', error)

    const errorMessage = error?.body?.message || error?.message || 'Failed to send verification email. Please try again.'

    return {
      success: false,
      message: errorMessage
    }
  }
}