"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SwitchOrganizationButtonProps {
  className?: string
  children?: React.ReactNode
  href?: string
  asChild?: boolean
  variant?: 'link' | 'button'
}

export function SwitchOrganizationButton({ 
  className, 
  children = "Switch organization",
  href = "/select-organization",
  asChild = false,
  variant = 'link'
}: SwitchOrganizationButtonProps) {
  const router = useRouter()

  const handleSwitchOrganization = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Clear local storage to reset theme back to HelpOrbit default
    if (typeof window !== 'undefined') {
      // Clear all organization-related theme data from localStorage
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (
          key.includes('theme') || 
          key.includes('organization') || 
          key.includes('branding') ||
          key.includes('org-')
        )) {
          keysToRemove.push(key)
        }
      }
      
      // Remove all organization-related keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
      
      // Also clear sessionStorage if needed
      sessionStorage.removeItem('current-organization')
      sessionStorage.removeItem('organization-theme')
    }
    
    // Navigate to select organization page
    router.push(href)
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleSwitchOrganization}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "h-10 px-4 py-2",
          className
        )}
      >
        {children}
      </button>
    )
  }

  // Default link variant
  return (
    <Link
      href={href}
      onClick={handleSwitchOrganization}
      className={cn("", className)}
    >
      {children}
    </Link>
  )
}