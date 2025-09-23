"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  TicketIcon, 
  HomeIcon, 
  UsersIcon, 
  SettingsIcon,
  LogOutIcon,
  PlusIcon
} from 'lucide-react'
import { BrandedLogo } from '@/components/branding/branded-logo'
import { useTheme } from '@/components/branding/theme-provider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface SidebarProps {
  organizationSlug: string
  className?: string
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon 
  },
  { 
    name: 'Tickets', 
    href: '/dashboard/tickets', 
    icon: TicketIcon 
  },
  { 
    name: 'Users', 
    href: '/dashboard/users', 
    icon: UsersIcon 
  },
]

const settings = [
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: SettingsIcon 
  },
]

export function Sidebar({ organizationSlug, className }: SidebarProps) {
  const pathname = usePathname()
  const { organization } = useTheme()

  const isActive = (href: string) => {
    const fullHref = `/org/${organizationSlug}${href}`
    return pathname === fullHref || pathname.startsWith(fullHref + '/')
  }

  return (
    <div className={cn(
      "flex h-full w-64 flex-col border-r border-gray-200 bg-white",
      className
    )}>
      {/* Logo and Organization */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
        <Link 
          href={`/org/${organizationSlug}/dashboard`}
          className="flex items-center space-x-3 group"
        >
          <BrandedLogo size="sm" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">
              {organization?.name || 'Organization'}
            </span>
            <span className="text-xs text-gray-500">
              Support Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Action */}
      <div className="p-4">
        <Button
          asChild
          className="w-full btn-brand-primary"
        >
          <Link href={`/org/${organizationSlug}/dashboard/tickets/new`}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Ticket
          </Link>
        </Button>
      </div>

      <Separator />

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const href = `/org/${organizationSlug}${item.href}`
          const active = isActive(item.href)
          
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
        {settings.map((item) => {
          const href = `/org/${organizationSlug}${item.href}`
          const active = isActive(item.href)
          
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
        
        <button
          className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOutIcon
            className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-500"
            aria-hidden="true"
          />
          Sign out
        </button>
      </div>
    </div>
  )
}