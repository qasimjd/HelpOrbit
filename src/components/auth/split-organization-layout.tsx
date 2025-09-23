"use client"

import React from 'react'
import { LogoWithText } from '@/components/branding/branded-logo'
import { cn } from '@/lib/utils'

interface SplitOrganizationLayoutProps {
  children: React.ReactNode
  className?: string
}

export function SplitOrganizationLayout({ children, className }: SplitOrganizationLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - HelpOrbit Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-16 xl:px-24 relative bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="h-full w-full"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, #3b82f6 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-lg">
          {/* HelpOrbit Logo and Branding */}
          <div className="mb-12">
            <LogoWithText 
              size="xl" 
              orientation="vertical"
              showTagline={true}
              className="items-start"
            />
          </div>

          {/* Value Propositions */}
          <div className="space-y-8 text-brand-text">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-brand-text">
                Modern Support Made Simple
              </h2>
              <p className="text-lg leading-relaxed opacity-80 text-brand-text">
                HelpOrbit transforms how organizations manage customer support with 
                intelligent ticketing, seamless collaboration, and powerful insights.
              </p>
            </div>
          </div>
         
        </div>
      </div>

      {/* Right Panel - Organization Selection */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24" style={{ backgroundColor: 'var(--brand-background)' }}>
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