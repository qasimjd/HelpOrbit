import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getServerSession } from '@/lib/session'
import { OrganizationSelection } from '@/components/auth/organization-selection'
import { BrandedLogo } from '@/components/branding/branded-logo'
import { SwitchOrganizationButton } from '@/components/auth/switch-organization-button'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Create Organization - HelpOrbit',
  description: 'Create a new organization to get started with HelpOrbit',
}

export default async function CreateOrganizationPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center space-y-8 py-12">
        <BrandedLogo size="lg" helpOrbit={true} />

        <div className="w-full">
          <OrganizationSelection />
        </div>

        <div className="w-full text-center mt-6">
          <p className="text-sm text-muted-foreground mb-2">
            Looking for a different organization?
          </p>
            <SwitchOrganizationButton className="group text-sm flex items-center justify-center text-foreground hover:underline" >
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1.5 transition-transform" />
            Back on organization select
            </SwitchOrganizationButton>
        </div>
      </div>
    </div>
  )
}
