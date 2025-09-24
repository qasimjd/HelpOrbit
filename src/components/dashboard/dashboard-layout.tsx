"use client"

import React, { useState } from 'react'
import { ThemeProvider } from '@/components/branding/theme-provider'
import { UserProvider } from '@/contexts/user-context'
import { TicketProvider } from '@/contexts/ticket-context'
import { Header } from '@/components/dashboard/header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar } from './dashboard-sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  organizationSlug: string
  organization: any // Organization type from server
}

function DashboardLayoutContent({ 
  children, 
  organizationSlug,
  organization, 
}: DashboardLayoutProps) {

  return (
    <SidebarProvider>
      <div 
        className="flex h-screen w-full" 
      >
        <DashboardSidebar organizationSlug={organizationSlug} />
        <SidebarInset>
          <Header 
            organizationSlug={organizationSlug}
            organizationName={organization.name}
          />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <UserProvider initialOrganizationSlug={props.organizationSlug}>
      <TicketProvider>
        <ThemeProvider initialOrganization={props.organization}>
          <DashboardLayoutContent {...props} />
        </ThemeProvider>
      </TicketProvider>
    </UserProvider>
  )
}