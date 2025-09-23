import React from 'react'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { validateOrganizationAction } from '@/server/actions/server-actions'
import { getServerSession } from '@/lib/session'
import { SplitAuthLayout } from '@/components/auth/split-auth-layout'
import { LoginForm } from '@/components/auth/login-form'
import { ThemeProvider } from '@/components/branding/theme-provider'

interface LoginPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { slug } = await params
  const { exists, organization } = await validateOrganizationAction(slug)
  
  if (!exists || !organization) {
    return {
      title: 'Organization Not Found - HelpOrbit',
      description: 'The requested organization could not be found.',
    }
  }

  return {
    title: `Sign in to ${organization.name} - HelpOrbit`,
    description: `Access your ${organization.name} support portal`,
  }
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { slug } = await params
  const { exists, organization } = await validateOrganizationAction(slug)
  
  if (!exists || !organization) {
    notFound()
  }

  // Check if user is already authenticated
  const session = await getServerSession()
  
  if (session?.user) {
    // If user is already logged in, check if they have access to this organization
    try {
      const { auth } = await import('@/lib/auth')
      const { headers } = await import('next/headers')
      
      const userOrgs = await auth.api.listOrganizations({
        headers: await headers()
      })

      const hasAccess = userOrgs?.some((org: any) => org.slug === slug)
      
      if (hasAccess) {
        // User has access, redirect to dashboard
        redirect(`/org/${slug}/dashboard`)
      } else {
        // User doesn't have access, redirect to select organization
        redirect('/select-organization')
      }
    } catch (error) {
      console.error('Error checking organization access:', error)
      // If there's an error, continue to show the login form
    }
  }

  return (
    <ThemeProvider initialOrganization={organization}>
      <SplitAuthLayout>
        <LoginForm organizationSlug={slug} />
      </SplitAuthLayout>
    </ThemeProvider>
  )
}