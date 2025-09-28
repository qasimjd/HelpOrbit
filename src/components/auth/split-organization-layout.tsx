"use client"

import React from 'react'
import { LogoWithText } from '@/components/branding/branded-logo'
import { AuthSidePanel } from '@/components/auth/auth-side-panel'

interface SplitOrganizationLayoutProps {
  children: React.ReactNode
  className?: string
}

export function SplitOrganizationLayout({ children, className }: SplitOrganizationLayoutProps) {
  return (
    <div className="max-h-screen min-h-screen flex">
      {/* Left Panel - HelpOrbit Branding */}
      <AuthSidePanel 
        title="Modern Support Made Simple"
        description="HelpOrbit transforms how organizations manage customer support with intelligent ticketing, seamless collaboration, and powerful insights."
        logoSize="xl"
        organizationSelect
      />

      {/* Right Panel - Organization Selection */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 overflow-scroll">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <LogoWithText 
              size="md" 
              orientation="vertical"
              showTagline={true}
              className="justify-center"
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}