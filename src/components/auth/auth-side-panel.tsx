"use client"

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { LogoWithText } from '@/components/branding/branded-logo'
import { SwitchOrganizationButton } from '@/components/auth/switch-organization-button'
import { useTheme } from '@/components/branding/theme-provider'

interface AuthSidePanelProps {
  title?: string
  description?: string
  showSwitchOrganization?: boolean
  showFeatures?: boolean
  logoSize?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function AuthSidePanel({
  title,
  description,
  showSwitchOrganization = false,
  showFeatures = false,
  logoSize = "lg",
  className = ""
}: AuthSidePanelProps) {

  return (
    <div className={`hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-16 xl:px-24 relative bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}>
      <div className="relative z-10 max-w-lg">
        {/* Logo */}
        <div className="mb-8">
          <LogoWithText
            size={logoSize}
            orientation="vertical"
            showTagline={true}
            className="items-start"
          />
        </div>

        {/* Optional Title and Description */}
        {(title || description) && (
          <div className="space-y-8 text-brand-text">
            <div>
              {title && (
                <h2 className="text-2xl font-bold mb-6 text-brand-text">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-lg leading-relaxed opacity-80 text-brand-text">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Optional Features List */}
        {showFeatures && (
          <div className="space-y-4 text-foreground mt-8">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-brand-primary" />
              <p className="opacity-80">Streamlined ticket management and resolution</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-brand-primary" />
              <p className="opacity-80">Real-time collaboration with your support team</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-brand-primary" />
              <p className="opacity-80">Comprehensive reporting and analytics</p>
            </div>
          </div>
        )}

        {/* Optional Switch Organization Button */}
        {showSwitchOrganization && (
          <div className="mt-8 pt-8 border-t border-opacity-20 border-brand-text-20">
            <SwitchOrganizationButton className="text-sm opacity-70 hover:opacity-100 inline-flex items-center group transition-opacity text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Switch organization
            </SwitchOrganizationButton>
          </div>
        )}
      </div>
    </div>
  )
}
