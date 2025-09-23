import React from 'react'
import { notFound } from 'next/navigation'
import { validateOrganizationAction } from '@/server/actions/server-actions'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

interface DashboardLayoutWrapperProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function DashboardLayoutWrapper({
  children,
  params,
}: DashboardLayoutWrapperProps) {
  const { slug } = await params
  const { exists, organization } = await validateOrganizationAction(slug)
  
  if (!exists || !organization) {
    notFound()
  }

  return (
    <DashboardLayout 
      organizationSlug={slug}
      organization={organization}
    >
      {children}
    </DashboardLayout>
  )
}