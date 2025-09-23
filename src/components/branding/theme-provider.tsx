"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Organization, OrganizationBranding, defaultBranding } from '@/types/organization'

interface ThemeContextValue {
  organization: Organization | null
  branding: OrganizationBranding
  setOrganization: (org: Organization | null) => void
  updateBranding: (branding: Partial<OrganizationBranding>) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  initialOrganization?: Organization | null
}

export function ThemeProvider({ children, initialOrganization = null }: ThemeProviderProps) {
  const [organization, setOrganization] = useState<Organization | null>(initialOrganization)
  const [branding, setBranding] = useState<OrganizationBranding>(defaultBranding)
  const [isClient, setIsClient] = useState(false)

  // Initialize client state and load persisted theme
  useEffect(() => {
    setIsClient(true)
    
    // Try to restore organization from localStorage
    const savedOrgId = localStorage.getItem('helporbit-selected-organization')
    const savedThemeMode = localStorage.getItem('helporbit-theme-mode')
    const savedPrimaryColor = localStorage.getItem('helporbit-primary-color')
    
    if (savedOrgId && savedPrimaryColor && !initialOrganization) {
      // Reconstruct organization from saved data
      const restoredOrg: Organization = {
        id: savedOrgId,
        name: localStorage.getItem('helporbit-org-name') || 'Unknown Organization',
        slug: localStorage.getItem('helporbit-org-slug') || savedOrgId,
        primaryColor: savedPrimaryColor,
        themeMode: (savedThemeMode as 'light' | 'dark' | 'auto') || 'light',
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
  }, [initialOrganization])

  // Persist organization data when it changes
  useEffect(() => {
    if (!isClient) return
    
    if (organization) {
      localStorage.setItem('helporbit-selected-organization', organization.id)
      localStorage.setItem('helporbit-org-name', organization.name)
      localStorage.setItem('helporbit-org-slug', organization.slug)
      localStorage.setItem('helporbit-primary-color', organization.primaryColor)
      localStorage.setItem('helporbit-theme-mode', organization.themeMode || 'light')
      if (organization.logoUrl) {
        localStorage.setItem('helporbit-org-logo', organization.logoUrl)
      }
    } else {
      // Clear stored data when no organization is selected
      localStorage.removeItem('helporbit-selected-organization')
      localStorage.removeItem('helporbit-org-name')
      localStorage.removeItem('helporbit-org-slug')
      localStorage.removeItem('helporbit-primary-color')
      localStorage.removeItem('helporbit-theme-mode')
      localStorage.removeItem('helporbit-org-logo')
    }
  }, [organization, isClient])

  // Update branding when organization changes
  useEffect(() => {
    if (organization) {
      const themeMode = organization.themeMode || 'light'
      setBranding({
        logoUrl: organization.logoUrl,
        primaryColor: organization.primaryColor,
        themeMode: themeMode,
      })
    } else {
      setBranding(defaultBranding)
    }
  }, [organization])

  // Apply CSS custom properties when branding changes
  useEffect(() => {
    const root = document.documentElement
    const isDark = branding.themeMode === 'dark'
    
    // Apply theme class to body
    if (isDark) {
      document.body.classList.add('dark')
      document.body.classList.remove('light')
    } else {
      document.body.classList.add('light')
      document.body.classList.remove('dark')
    }
    
    root.style.setProperty('--brand-primary', branding.primaryColor)
    root.style.setProperty('--brand-text', isDark ? '#f8fafc' : '#0f172a')
    root.style.setProperty('--brand-background', isDark ? '#0f172a' : '#ffffff')
    root.style.setProperty('--brand-card', isDark ? '#1e293b' : '#f8fafc')

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
  }, [branding])

  const updateBranding = (updates: Partial<OrganizationBranding>) => {
    setBranding(current => ({ ...current, ...updates }))
  }

  const contextValue: ThemeContextValue = {
    organization,
    branding,
    setOrganization,
    updateBranding,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}