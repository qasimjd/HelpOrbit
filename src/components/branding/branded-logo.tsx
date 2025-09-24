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
  const [imageError, setImageError] = React.useState(false)

  const logoUrl = branding.logoUrl || organization?.logoUrl || '/logos/helporbit-logo.svg'
  const altText = organization?.name ? `${organization.name} logo` : 'HelpOrbit logo'
  
  // Reset error state when logoUrl changes
  React.useEffect(() => {
    setImageError(false)
  }, [logoUrl])

  const shouldShowFallback = !logoUrl || imageError

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {!shouldShowFallback ? (
        <Image
          src={logoUrl}
          alt={altText}
          fill
          className="object-contain rounded-lg"
          priority={size === 'lg' || size === 'xl'}
          onError={() => {
            setImageError(true)
            if (logoUrl !== '/logos/helporbit-logo.svg') {
              console.warn('Failed to load organization logo, falling back to default')
            }
          }}
        />
      ) : (
        showFallback && (
          <div 
            className={cn(
              "flex items-center justify-center rounded-lg text-white font-semibold bg-brand-primary shadow-sm",
              sizeClasses[size]
            )}
            style={{
              backgroundColor: organization?.primaryColor || branding.primaryColor || 'hsl(221.2 83.2% 53.3%)'
            }}
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
  showLogo?: boolean
  interactive?: boolean
  className?: string
  onClick?: () => void
}

export function LogoWithText({ 
  size = 'md', 
  orientation = 'horizontal', 
  showTagline = false,
  showLogo = true,
  interactive = false,
  className,
  onClick
}: LogoWithTextProps) {
  const { organization } = useTheme()
  
  const isVertical = orientation === 'vertical'
  const baseClasses = cn(
    "flex items-center",
    isVertical ? "flex-col space-y-2" : "flex-row space-x-3",
    interactive && "cursor-pointer transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded-md",
    className
  )

  const content = (
    <>
      {showLogo && <BrandedLogo size={size} />}
      <BrandedTextLogo showTagline={showTagline} size={size} />
    </>
  )

  if (interactive || onClick) {
    return (
      <button
        className={baseClasses}
        onClick={onClick}
        type="button"
        aria-label={`${organization?.name || 'HelpOrbit'} logo`}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={baseClasses}>
      {content}
    </div>
  )
}

// Convenience component for organization logo with text
export function OrgLogoWithText(props: Omit<LogoWithTextProps, 'showLogo'>) {
  return <LogoWithText {...props} showLogo={true} />
}

// Compact variant for headers/navigation
export function CompactOrgLogo({ 
  className,
  onClick 
}: Pick<LogoWithTextProps, 'className' | 'onClick'>) {
  return (
    <LogoWithText
      size="sm"
      orientation="horizontal"
      showTagline={false}
      interactive={!!onClick}
      onClick={onClick}
      className={className}
    />
  )
}

// Full branding variant for landing pages
export function FullBrandingLogo({ 
  className 
}: Pick<LogoWithTextProps, 'className'>) {
  return (
    <LogoWithText
      size="xl"
      orientation="vertical"
      showTagline={true}
      className={className}
    />
  )
}
