import React from 'react'
import { notFound } from 'next/navigation'
import { validateOrganizationAction } from '@/server/actions/auth-actions'

// This layout uses database queries, so it should be dynamically rendered
export const dynamic = 'force-dynamic'

interface OrganizationLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function OrganizationLayout({
  children,
  params,
}: OrganizationLayoutProps) {
  const { slug } = await params
  
  // Validate that the organization exists first
  const { exists, organization } = await validateOrganizationAction(slug)
  
  if (!exists || !organization) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}