"use client"

import React, { useState } from 'react'
import { notFound } from 'next/navigation'
import { ThemeProvider, useTheme } from '@/components/branding/theme-provider'
import { Header } from '@/components/dashboard/header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
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
    <ThemeProvider initialOrganization={props.organization}>
      <DashboardLayoutContent {...props} />
    </ThemeProvider>
  )
}