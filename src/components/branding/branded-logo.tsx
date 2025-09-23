"use client"

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useTheme } from './theme-provider'

interface BrandedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showFallback?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20'
}

interface BrandedTextLogoProps {
  showTagline?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function BrandedLogo({ size = 'md', showFallback = true, className }: BrandedLogoProps) {
  const { organization, branding } = useTheme()

  const logoUrl = branding.logoUrl || '/logos/helporbit-logo.svg'
  const altText = organization?.name ? `${organization.name} logo` : 'HelpOrbit logo'

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={altText}
          fill
          className="object-contain"
          priority={size === 'lg' || size === 'xl'}
          onError={() => {
            if (showFallback && logoUrl !== '/logos/helporbit-logo.svg') {
              console.warn('Failed to load organization logo, falling back to default')
            }
          }}
        />
      ) : (
        showFallback && (
          <div 
            className={cn(
              "flex items-center justify-center rounded-lg text-white font-semibold bg-brand-primary",
              sizeClasses[size]
            )}
          >
            {organization?.name?.charAt(0).toUpperCase() || 'H'}
          </div>
        )
      )}
    </div>
  )
}

export function BrandedTextLogo({ showTagline = false, size = 'md', className }: BrandedTextLogoProps) {
  const { organization } = useTheme()

  // Map size to text size classes
  const headingSizeClasses: Record<NonNullable<BrandedTextLogoProps["size"]>, string> = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  }

  const taglineSizeClasses: Record<NonNullable<BrandedTextLogoProps["size"]>, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <h1 className={cn("font-bold text-gray-900", headingSizeClasses[size])}>
        {organization?.name || 'HelpOrbit'}
      </h1>
      {showTagline && (
        <p className={cn("mt-1 text-gray-600", taglineSizeClasses[size])}>
          {organization ? 'Support Portal' : 'Multi-tenant ticketing system'}
        </p>
      )}
    </div>
  )
}

interface LogoWithTextProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  orientation?: 'horizontal' | 'vertical'
  showTagline?: boolean
  className?: string
}

export function LogoWithText({ 
  size = 'md', 
  orientation = 'horizontal', 
  showTagline = false, 
  className 
}: LogoWithTextProps) {
  const flexDirection = orientation === 'vertical' ? 'flex-col' : 'flex-row'
  const spacing = orientation === 'vertical' ? 'space-y-2' : 'space-x-3'

  return (
    <div className={cn(`flex items-center ${flexDirection} ${spacing}`, className)}>
      <BrandedLogo size={size} />
      <BrandedTextLogo showTagline={showTagline} size={size} />
    </div>
  )
}
