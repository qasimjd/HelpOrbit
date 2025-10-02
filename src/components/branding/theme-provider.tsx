"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Organization, OrganizationBranding, defaultBranding } from '@/types/organization'

interface BrandingContextValue {
  organization: Organization | null
  branding: OrganizationBranding
  setOrganization: (org: Organization | null) => void
  updateBranding: (branding: Partial<OrganizationBranding>) => void
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined)

interface BrandingProviderProps {
  children: React.ReactNode
  initialOrganization?: Organization | null
}

// Main component that handles organization branding only (no theme management)
function BrandingProvider({ children, initialOrganization = null }: BrandingProviderProps) {
  // Initialize with saved branding if available
  const getInitialBranding = (): OrganizationBranding => {
    if (typeof window !== 'undefined') {
      const savedPrimaryColor = localStorage.getItem('helporbit-primary-color')
      
      if (savedPrimaryColor) {
        return {
          primaryColor: savedPrimaryColor,
          logoUrl: localStorage.getItem('helporbit-org-logo') || undefined,
        }
      }
    }
    return defaultBranding
  }

  const [organization, setOrganization] = useState<Organization | null>(initialOrganization)
  const [branding, setBranding] = useState<OrganizationBranding>(getInitialBranding)
  const [isClient, setIsClient] = useState(false)

  // Initialize client state and load persisted organization
  useEffect(() => {
    setIsClient(true)
    
    // Try to restore organization from localStorage
    const savedOrgId = localStorage.getItem('helporbit-selected-organization')
    const savedPrimaryColor = localStorage.getItem('helporbit-primary-color')
    
    if (savedOrgId && savedPrimaryColor && !initialOrganization) {
      // Reconstruct organization from saved data
      const restoredOrg: Organization = {
        id: savedOrgId,
        name: localStorage.getItem('helporbit-org-name') || 'Unknown Organization',
        slug: localStorage.getItem('helporbit-org-slug') || savedOrgId,
        primaryColor: savedPrimaryColor,
        logoUrl: localStorage.getItem('helporbit-org-logo') || undefined,
        settings: {
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
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setOrganization(restoredOrg)
    }

    // Listen for storage changes to update organization branding
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'helporbit-primary-color' && e.newValue) {
        // Reload organization data from localStorage
        const orgId = localStorage.getItem('helporbit-selected-organization')
        const primaryColor = e.newValue
        
        if (orgId && primaryColor) {
          const updatedOrg: Organization = {
            id: orgId,
            name: localStorage.getItem('helporbit-org-name') || 'Unknown Organization',
            slug: localStorage.getItem('helporbit-org-slug') || orgId,
            primaryColor: primaryColor,
            logoUrl: localStorage.getItem('helporbit-org-logo') || undefined,
            settings: {
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
            createdAt: new Date(),
            updatedAt: new Date()
          }
          setOrganization(updatedOrg)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [initialOrganization])

  // Persist organization data when it changes
  useEffect(() => {
    if (!isClient) return
    
    if (organization) {
      localStorage.setItem('helporbit-selected-organization', organization.id)
      localStorage.setItem('helporbit-org-name', organization.name)
      localStorage.setItem('helporbit-org-slug', organization.slug)
      localStorage.setItem('helporbit-primary-color', organization.primaryColor)
      if (organization.logoUrl) {
        localStorage.setItem('helporbit-org-logo', organization.logoUrl)
      }
    } else {
      // Clear stored data when no organization is selected
      localStorage.removeItem('helporbit-selected-organization')
      localStorage.removeItem('helporbit-org-name')
      localStorage.removeItem('helporbit-org-slug')
      localStorage.removeItem('helporbit-primary-color')
      localStorage.removeItem('helporbit-org-logo')
    }
  }, [organization, isClient])

  // Update branding when organization changes
  useEffect(() => {
    if (organization) {
      setBranding({
        logoUrl: organization.logoUrl,
        primaryColor: organization.primaryColor,
      })
    } else {
      setBranding(defaultBranding)
    }
  }, [organization])

  // Apply organization primary color when branding changes
  useEffect(() => {
    const root = document.documentElement
    
    // Check if color is already correctly set (to avoid flash)
    const currentPrimaryColor = getComputedStyle(root).getPropertyValue('--brand-primary').trim()
    const targetPrimaryColor = branding.primaryColor
    
    // Only apply changes if different from current values
    if (currentPrimaryColor !== targetPrimaryColor) {
      // Set the primary color - this is the only organization-specific color
      root.style.setProperty('--brand-primary', branding.primaryColor)

      // Generate color variations for different UI states
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null
      }

      const rgb = hexToRgb(branding.primaryColor)
      if (rgb) {
        // Check if we're in dark mode by looking at document classes
        const isDark = document.documentElement.classList.contains('dark')
        
        // Set RGB values for use in CSS custom properties
        root.style.setProperty('--brand-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
        
        // Generate transparency variations (these will be used by light/dark mode CSS)
        root.style.setProperty('--brand-primary-50', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDark ? 0.1 : 0.05})`)
        root.style.setProperty('--brand-primary-100', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDark ? 0.15 : 0.1})`)
        root.style.setProperty('--brand-primary-200', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDark ? 0.25 : 0.2})`)
        root.style.setProperty('--brand-primary-300', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDark ? 0.35 : 0.3})`)
        root.style.setProperty('--brand-primary-500', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`)
        root.style.setProperty('--brand-primary-700', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`)
        root.style.setProperty('--brand-primary-900', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`)
        
        // Generate accent color (darker version of primary for better contrast)
        const darkerR = Math.max(0, Math.floor(rgb.r * 0.8))
        const darkerG = Math.max(0, Math.floor(rgb.g * 0.8))
        const darkerB = Math.max(0, Math.floor(rgb.b * 0.8))
        root.style.setProperty('--brand-accent', `rgb(${darkerR}, ${darkerG}, ${darkerB})`)
      }
    }
  }, [branding])

  const updateBranding = (updates: Partial<OrganizationBranding>) => {
    setBranding(current => ({ ...current, ...updates }))
  }

  const contextValue: BrandingContextValue = {
    organization,
    branding,
    setOrganization,
    updateBranding,
  }

  return (
    <BrandingContext.Provider value={contextValue}>
      {children}
    </BrandingContext.Provider>
  )
}

// Main BrandingProvider export
export function ThemeProvider({ children, initialOrganization = null }: BrandingProviderProps) {
  return (
    <BrandingProvider initialOrganization={initialOrganization}>
      {children}
    </BrandingProvider>
  )
}

export const useTheme = () => {
  const context = useContext(BrandingContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Utility function to update organization theme from anywhere in the app
export const updateOrganizationTheme = (organizationData: {
  id: string
  name: string
  slug: string
  primaryColor: string
  logoUrl?: string
}) => {
  if (typeof window !== 'undefined') {
    // Update localStorage with the correct organization data
    localStorage.setItem('helporbit-selected-organization', organizationData.id)
    localStorage.setItem('helporbit-org-name', organizationData.name)
    localStorage.setItem('helporbit-org-slug', organizationData.slug)
    localStorage.setItem('helporbit-primary-color', organizationData.primaryColor)
    if (organizationData.logoUrl) {
      localStorage.setItem('helporbit-org-logo', organizationData.logoUrl)
    }

    // Trigger a storage event to update the theme provider
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'helporbit-primary-color',
      newValue: organizationData.primaryColor
    }))
  }
}