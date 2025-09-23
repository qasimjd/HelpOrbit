import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { SplitOrganizationLayout } from '@/components/auth/split-organization-layout'
import { OrganizationFinder } from '@/components/auth/organization-finder'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { LogoWithText } from '@/components/branding/branded-logo'
import { getServerSession } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Select Organization - HelpOrbit',
  description: 'Choose your organization to access your support portal',
}

interface SelectOrganizationPageProps {
  searchParams: Promise<{
    create?: string
  }>
}

export default async function SelectOrganizationPage({ searchParams }: SelectOrganizationPageProps) {
  // Check if user is authenticated
  const session = await getServerSession()
  const params = await searchParams
  
  if (!session?.user) {
    // If user is not authenticated but trying to create, redirect to auth with intent
    if (params.create === 'true') {
      redirect('/auth?intent=create-organization&mode=signup')
    }
    // For regular organization selection, don't require auth (users can find orgs to join)
  }

  return (
    <SplitOrganizationLayout>
      {/* Organization Selection Card */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="text-center pb-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {params.create === 'true' ? 'Create Your Organization' : 'Find Your Organization'}
          </h1>
          <p className="text-gray-600">
            {params.create === 'true' 
              ? 'Set up your organization to get started with HelpOrbit.'
              : 'Enter your organization name or domain to access your support portal.'
            }
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <OrganizationFinder autoCreate={params.create === 'true'} />
        </CardContent>
      </Card>

      {/* Footer Links */}
      <div className="text-center mt-8 space-y-4 text-sm text-gray-500">
        <p>
          Don't see your organization? Contact your administrator for access.
        </p>
        <div className="flex justify-center space-x-6">
          <a href="/about" className="link-brand hover:text-blue-600">
            About HelpOrbit
          </a>
          <a href="/privacy" className="link-brand hover:text-blue-600">
            Privacy Policy
          </a>
          <a href="/support" className="link-brand hover:text-blue-600">
            Get Help
          </a>
        </div>
      </div>
    </SplitOrganizationLayout>
  )
}