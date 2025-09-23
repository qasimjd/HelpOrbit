import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { validateOrganizationAction } from '@/server/actions/server-actions'
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

  return (
    <ThemeProvider initialOrganization={organization}>
      <SplitAuthLayout>
        <LoginForm organizationSlug={slug} />
      </SplitAuthLayout>
    </ThemeProvider>
  )
}