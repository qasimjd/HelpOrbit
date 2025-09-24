import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { validateOrganizationAction } from '@/server/actions/auth-actions'

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