"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandedLogo } from '@/components/branding/branded-logo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LogoutButton } from '@/components/auth/logout-button'
import { cn } from '@/lib/utils'
import { useUser, useOrganizationPermissions } from '@/contexts/user-context'
import { 
  MAIN_NAVIGATION, 
  SETTINGS_NAVIGATION, 
  QUICK_ACTIONS,
  buildHref,
  isNavigationActive
} from '@/lib/navigation-constants'
import { Loading } from '@/components/sheard/loading'

interface SidebarProps {
  organizationSlug: string
  className?: string
}

export function Sidebar({ organizationSlug, className }: SidebarProps) {
  const pathname = usePathname()
  const { currentOrganization, isLoading } = useUser()
  const permissions = useOrganizationPermissions()

  // Filter navigation based on user permissions
  const filteredMainNavigation = MAIN_NAVIGATION.filter(item => {
    if (item.name === 'Users') {
      return permissions.canManageUsers
    }
    return true
  })

  const filteredSettingsNavigation = SETTINGS_NAVIGATION.filter(() => {
    return permissions.canManageSettings
  })

  if (isLoading) {
    return (
      <div className={cn(
        "flex h-full w-64 flex-col border-r",
        className
      )}>
        <Loading />
      </div>
    )
  }

  return (
    <div className={cn(
      "flex h-full w-64 flex-col border-r border-gray-200 bg-background",
      className
    )}>
      {/* Logo and Organization */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
        <Link 
          href={buildHref('/dashboard', organizationSlug)}
          className="flex items-center space-x-3 group"
        >
          <BrandedLogo size="sm" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">
              {currentOrganization?.name || 'Organization'}
            </span>
            <span className="text-xs text-gray-500">
              Support Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Action */}
      <div className="p-4">
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.name}
            asChild
            className="w-full btn-brand-primary"
          >
            <Link href={buildHref(action.href, organizationSlug)}>
              <action.icon className="w-4 h-4 mr-2" />
              {action.name}
            </Link>
          </Button>
        ))}
      </div>

      <Separator />

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {filteredMainNavigation.map((item) => {
          const href = buildHref(item.href, organizationSlug)
          const active = isNavigationActive(item.href, pathname, organizationSlug)
          
          return (
            <Link
              key={item.name}
              href={href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                active 
                  ? "nav-brand-active" 
                  : "text-gray-700 nav-brand-hover"
              )}
              title={item.description}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  active 
                    ? "text-brand-primary" 
                    : "text-gray-400 group-hover:text-brand-primary"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Settings & User Actions */}
      <div className="px-4 py-4 space-y-1">
        {filteredSettingsNavigation.map((item) => {
          const href = buildHref(item.href, organizationSlug)
          const active = isNavigationActive(item.href, pathname, organizationSlug)
          
          return (
            <Link
              key={item.name}
              href={href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                active 
                  ? "nav-brand-active" 
                  : "text-gray-700 nav-brand-hover"
              )}
              title={item.description}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  active 
                    ? "text-brand-primary" 
                    : "text-gray-400 group-hover:text-brand-primary"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
        
        {/* Logout Button */}
        <LogoutButton 
          variant="ghost"
          className="group justify-start w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
        />
      </div>
    </div>
  )
}