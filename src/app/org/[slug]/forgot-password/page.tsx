import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { validateOrganizationAction } from '@/server/actions/auth-actions'
import { SplitAuthLayout } from '@/components/auth/split-auth-layout'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { ThemeProvider } from '@/components/branding/theme-provider'

// This page uses database queries, so it should be dynamically rendered
export const dynamic = 'force-dynamic'

interface ForgotPasswordPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ForgotPasswordPageProps): Promise<Metadata> {
  const { slug } = await params
  const { exists, organization } = await validateOrganizationAction(slug)
  
  if (!exists || !organization) {
    return {
      title: 'Organization Not Found - HelpOrbit',
      description: 'The requested organization could not be found.',
    }
  }

  return {
    title: `Reset Password - ${organization.name} - HelpOrbit`,
    description: `Reset your ${organization.name} support portal password`,
  }
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { slug } = await params
  const { exists, organization } = await validateOrganizationAction(slug)
  
  if (!exists || !organization) {
    notFound()
  }

  return (
    <ThemeProvider initialOrganization={organization}>
      <SplitAuthLayout>
        <ForgotPasswordForm organizationSlug={slug} />
      </SplitAuthLayout>
    </ThemeProvider>
  )
}