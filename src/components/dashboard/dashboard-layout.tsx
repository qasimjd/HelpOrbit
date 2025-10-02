import React from 'react'
import { ThemeProvider } from '@/components/branding/theme-provider'
import { OrganizationThemeUpdater } from '@/components/branding/organization-theme-updater'
import { Header } from '@/components/dashboard/header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar } from './dashboard-sidebar'
import { getCurrentUser, getUserRoleAction } from '@/server/actions/user-actions'
import type { UserRole } from '@/types'
import type { OrganizationSettings } from '@/types/organization'

interface DashboardLayoutProps {
  children: React.ReactNode
  organizationSlug: string
  organization: {
    id: string
    name: string
    slug: string
    logoUrl?: string
    primaryColor?: string
    settings?: OrganizationSettings
    createdAt?: Date
    updatedAt?: Date
  }
}

export async function DashboardLayout({
  children,
  organizationSlug,
  organization
}: DashboardLayoutProps) {
  try {
    // Fetch current user and their role in this organization
    const userResult = await getCurrentUser()
    if (!userResult.success || !userResult.data) {
      return <div>Please log in to continue</div>
    }

    const user = userResult.data

    let userRole: UserRole = 'guest'
    if (user && organization) {
      const roleResult = await getUserRoleAction(organization.id)
      if (roleResult.success && roleResult.data) {
        userRole = roleResult.data
      } else {
        return <div>You don&apos;t have access to this organization</div>
      }
    }

    // Use the organization data directly since validateOrganizationAction already processed it
    const themeOrganization = organization ? {
      ...organization,
      logoUrl: organization.logoUrl,
      primaryColor: organization.primaryColor || '#3b82f6',
      domain: undefined,
      settings: organization.settings || {
        allowPublicRegistration: true,
        defaultTicketPriority: 'medium' as const,
        autoAssignTickets: false,
        enableNotifications: true,
        workingHours: {
          start: '09:00',
          end: '17:00',
          timezone: 'UTC',
          workingDays: [1, 2, 3, 4, 5]
        }
      },
      createdAt: organization.createdAt || new Date(),
      updatedAt: organization.updatedAt || new Date()
    } : null

    return (
      <ThemeProvider initialOrganization={themeOrganization}>
        <OrganizationThemeUpdater organization={organization} />
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <DashboardSidebar
              organizationSlug={organizationSlug}
              organization={organization}
              user={user}
              userRole={userRole}
            />
            <SidebarInset>
              <Header
                organizationSlug={organizationSlug}
                organizationName={organization?.name}
                user={user}
              />
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    )
  } catch (error) {
    console.error('Error loading dashboard layout:', error)
    return <div>Error loading dashboard. Please try again.</div>
  }
}