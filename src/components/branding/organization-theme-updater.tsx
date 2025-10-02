"use client"

import { useEffect } from 'react'
import { updateOrganizationTheme } from '@/components/branding/theme-provider'

interface OrganizationThemeUpdaterProps {
  organization: {
    id: string
    name: string
    slug: string
    logoUrl?: string
    primaryColor?: string
  }
}

export function OrganizationThemeUpdater({ organization }: OrganizationThemeUpdaterProps) {
  useEffect(() => {
    if (organization && organization.primaryColor) {
      updateOrganizationTheme({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        primaryColor: organization.primaryColor,
        logoUrl: organization.logoUrl
      })
    }
  }, [organization])

  return null // This component doesn't render anything
}