import React from 'react'
import { notFound } from 'next/navigation'
import { validateOrganizationAction } from '@/server/actions/auth-actions'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

// This layout uses database queries, so it should be dynamically rendered
export const dynamic = 'force-dynamic'

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