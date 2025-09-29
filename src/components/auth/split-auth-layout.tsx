"use client"

import React from 'react'
import { LogoWithText } from '@/components/branding/branded-logo'
import { AuthSidePanel } from '@/components/auth/auth-side-panel'
import { SwitchOrganizationButton } from '@/components/auth/switch-organization-button'
import { useTheme } from '@/components/branding/theme-provider'

interface SplitAuthLayoutProps {
  children: React.ReactNode
  showOrgSelect?: boolean
}

export function SplitAuthLayout({
  children,
  showOrgSelect = false
}: SplitAuthLayoutProps) {
  const { organization } = useTheme()

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Organization */}
      <AuthSidePanel
        showFeatures={true}
        showSwitchOrganization={true}
        className="bg-brand-surface"
      />

      {/* Right Panel - Form Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          {/* Organization/HelpOrbit Header - Desktop & Mobile */}
          <div className="mb-8 text-center">
            <LogoWithText
              size="md"
              orientation="vertical"
              showTagline={false}
              className="justify-center"
            />
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {children}
          </div>

          {/* Organization Selection for Mobile */}
          {showOrgSelect && !organization && (
            <div className="mt-8 pt-8 border-t border-opacity-20 lg:hidden border-brand-text-20">
              <SwitchOrganizationButton />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}