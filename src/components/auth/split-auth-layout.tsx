"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoWithText, BrandedLogo } from '@/components/branding/branded-logo'
import { useTheme } from '@/components/branding/theme-provider'
import { Button } from '@/components/ui/button'

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
      <div 
        className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-16 xl:px-24 relative bg-brand-surface"
      >
        <div className="relative z-10 max-w-md">
          {/* Logo and Organization Info */}
          <div className="mb-8">
            {organization ? (
              <div className="space-y-6">
                <BrandedLogo size="xl" className="mb-4" />
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-foreground">
                    {organization.name}
                  </h1>
                  <p className="text-lg opacity-80 text-foreground">
                    Support Portal
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <LogoWithText 
                  size="lg" 
                  orientation="vertical"
                  showTagline={true}
                  className="items-start"
                />
              </div>
            )}
          </div>

          {/* Features or Benefits */}
          <div className="space-y-4 text-foreground">
            <div className="flex items-start space-x-3">
              <div 
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-brand-primary"
              />
              <p className="opacity-80">Streamlined ticket management and resolution</p>
            </div>
            <div className="flex items-start space-x-3">
              <div 
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-brand-primary"
              />
              <p className="opacity-80">Real-time collaboration with your support team</p>
            </div>
            <div className="flex items-start space-x-3">
              <div 
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-brand-primary"
              />
              <p className="opacity-80">Comprehensive reporting and analytics</p>
            </div>
          </div>

          {/* Organization Change Link */}
          {organization && (
            <div className="mt-8 pt-8 border-t border-opacity-20 border-brand-text-20">
              <Link 
                href="/select-organization"
                className="text-sm opacity-70 hover:opacity-100 inline-flex items-center group transition-opacity text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Switch organization
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Form Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-brand-background">
        <div className="w-full max-w-sm mx-auto">
          {/* Organization/HelpOrbit Header - Desktop & Mobile */}
          <div className="mb-8 text-center">
            {organization ? (
              <div className="space-y-2 flex ">
                <BrandedLogo size="md" className="mx-auto" />
                <div>
                  <h1 className="text-xl font-bold mb-1 text-foreground">
                    {organization.name}
                  </h1>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <LogoWithText 
                  size="md" 
                  orientation="horizontal"
                  showTagline={true}
                  className="justify-center"
                />
                <div>
                  <p className="text-sm opacity-80 text-brand-primary">
                    Multi-tenant support platform
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {children}
          </div>

          {/* Organization Selection for Mobile */}
          {showOrgSelect && !organization && (
            <div className="mt-8 pt-8 border-t border-opacity-20 lg:hidden border-brand-text-20">
              <Link 
                href="/select-organization"
                className="text-sm opacity-70 hover:opacity-100 flex items-center justify-center text-brand-primary"
              >
                Choose your organization
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}