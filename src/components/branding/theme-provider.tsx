"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Organization, OrganizationBranding, defaultBranding } from '@/types/organization'

interface ThemeContextValue {
  organization: Organization | null
  branding: OrganizationBranding
  setOrganization: (org: Organization | null) => void
  updateBranding: (branding: Partial<OrganizationBranding>) => void
  // Manual theme management
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  initialOrganization?: Organization | null
}

// Main component that handles organization branding with manual theme management
function BrandingProvider({ children, initialOrganization = null }: ThemeProviderProps) {
  // Initialize theme from localStorage
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('helporbit-theme-mode')
      return (saved as 'light' | 'dark') || 'light'
    }
    return 'light'
  }
  
  const [theme, setManualTheme] = useState<'light' | 'dark'>(getInitialTheme)
  
  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setManualTheme(newTheme)
    // Apply theme class immediately
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
    // Save to localStorage for persistence
    localStorage.setItem('helporbit-theme-mode', newTheme)
  }, [])
  
  // Apply theme class on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }, [theme])
  // Initialize with saved branding if available
  const getInitialBranding = (): OrganizationBranding => {
    if (typeof window !== 'undefined') {
      const savedPrimaryColor = localStorage.getItem('helporbit-primary-color')
      const savedThemeMode = localStorage.getItem('helporbit-theme-mode')
      
      if (savedPrimaryColor) {
        return {
          primaryColor: savedPrimaryColor,
          themeMode: (savedThemeMode as 'light' | 'dark' | 'auto') || 'light',
          logoUrl: localStorage.getItem('helporbit-org-logo') || undefined,
        }
      }
    }
    return defaultBranding
  }

  const [organization, setOrganization] = useState<Organization | null>(initialOrganization)
  const [branding, setBranding] = useState<OrganizationBranding>(getInitialBranding)
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

  // Sync organization theme mode with our manual theme system
  useEffect(() => {
    if (branding.themeMode && branding.themeMode !== 'auto') {
      setTheme(branding.themeMode as 'light' | 'dark')
    }
  }, [branding.themeMode, setTheme])

  // Apply organization primary color when branding or theme changes
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
        // Use next-themes to detect dark mode
        const isDark = theme === 'dark'
        
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
  }, [branding, theme])

  const updateBranding = (updates: Partial<OrganizationBranding>) => {
    setBranding(current => ({ ...current, ...updates }))
  }

  const contextValue: ThemeContextValue = {
    organization,
    branding,
    setOrganization,
    updateBranding,
    theme,
    setTheme,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Main ThemeProvider with organization branding and manual theme management
export function ThemeProvider({ children, initialOrganization = null }: ThemeProviderProps) {
  return (
    <BrandingProvider initialOrganization={initialOrganization}>
      {children}
    </BrandingProvider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}