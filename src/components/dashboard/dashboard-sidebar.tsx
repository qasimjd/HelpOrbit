"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChevronUpIcon,
  MailIcon,
  BarChart3Icon,
  BuildingIcon
} from 'lucide-react'
import { BrandedLogo } from '@/components/branding/branded-logo'
import { useTheme } from '@/components/branding/theme-provider'
import { SwitchOrganizationButton } from '@/components/auth/switch-organization-button'
import { LogoutButton } from '@/components/auth/logout-button'
import { Separator } from '@/components/ui/separator'
import { useUser, useOrganizationPermissions } from '@/contexts/user-context'
import { 
  MAIN_NAVIGATION, 
  QUICK_ACTIONS,
  buildHref,
  isNavigationActive
} from '@/lib/navigation-constants'
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface DashboardSidebarProps {
  organizationSlug: string
}

// Additional navigation items specific to the dashboard sidebar
const organizationMenu = [
  { 
    name: 'Reports', 
    href: '/dashboard/reports', 
    icon: BarChart3Icon,
    description: 'Analytics & insights'
  },
  {
    name: 'Invite Member',
    href: '/dashboard/members?invite=true',
    icon: MailIcon,
    description: 'Send invitation'
  },
  { 
    name: 'Billing', 
    href: '/dashboard/billing',
    icon: BuildingIcon,
    description: 'Manage billing and subscriptions'
  },
]

export function DashboardSidebar({ organizationSlug }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { organization } = useTheme()
  const { state } = useSidebar()
  const { user } = useUser()
  const permissions = useOrganizationPermissions()

  const isCollapsed = state === "collapsed"

  // Filter navigation based on permissions
  const filteredMainNavigation = MAIN_NAVIGATION.filter(item => {
    if (item.name === 'Users') {
      return permissions.canManageUsers
    }
    return true
  })

  // Helper function to get user initials
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar 
      variant="inset"
      collapsible="icon"
      className="bg-brand-background border-brand-text-10"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className={cn(
          "flex items-center gap-2 px-2 py-2",
          isCollapsed ? "justify-center" : ""
        )}>
          <BrandedLogo size="sm" />
          {!isCollapsed && organization && (
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">
                {organization.name}
              </span>
            </div>
          )}
        </div>
        
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainNavigation.map((item) => {
                const Icon = item.icon
                const active = isNavigationActive(item.href, pathname, organizationSlug)
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild
                      isActive={active}
                      tooltip={isCollapsed ? `${item.name} - ${item.description}` : item.description}
                      className={cn(
                        active ? "bg-brand-surface text-muted-foreground" : "",
                        isCollapsed ? "!w-8 !h-8 !p-0 justify-center" : ""
                      )}
                    >
                      <Link href={buildHref(item.href, organizationSlug)} className={cn(
                        "flex items-center gap-2 w-full h-full",
                        isCollapsed ? "justify-center" : ""
                      )}>
                        <Icon className={cn(
                          "flex-shrink-0",
                          isCollapsed ? "h-4 w-4" : "h-4 w-4"
                        )} />
                        {!isCollapsed && (
                          <span className="flex-1">{item.name}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Quick Actions */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <SidebarMenuItem key={action.name}>
                    <SidebarMenuButton 
                      asChild
                      tooltip={isCollapsed ? `${action.name} - ${action.description}` : action.description}
                      className={isCollapsed ? "!w-8 !h-8 !p-0 justify-center" : ""}
                    >
                      <Link href={buildHref(action.href, organizationSlug)} className={cn(
                        "flex items-center gap-2 w-full h-full",
                        isCollapsed ? "justify-center" : ""
                      )}>
                        <Icon className={cn(
                          "flex-shrink-0",
                          isCollapsed ? "h-4 w-4" : "h-4 w-4"
                        )} />
                        {!isCollapsed && <span>{action.name}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Organization Management */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel>Organization</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {organizationMenu.map((item) => {
                const Icon = item.icon
                const active = isNavigationActive(item.href, pathname, organizationSlug)
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild
                      isActive={active}
                      tooltip={isCollapsed ? `${item.name} - ${item.description}` : item.description}
                      className={cn(
                        active ? "bg-brand-surface" : "",
                        isCollapsed ? "!w-8 !h-8 !p-0 justify-center" : ""
                      )}
                    >
                      <Link href={buildHref(item.href, organizationSlug)} className={cn(
                        "flex items-center gap-2 w-full h-full",
                        isCollapsed ? "justify-center" : ""
                      )}>
                        <Icon className={cn(
                          "flex-shrink-0",
                          isCollapsed ? "h-4 w-4" : "h-4 w-4"
                        )} />
                        {!isCollapsed && <span>{item.name}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className={cn(
                    "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                    isCollapsed ? "!w-8 !h-8 !p-0 justify-center" : ""
                  )}
                >
                  <Avatar className={cn(
                    "rounded-lg flex-shrink-0",
                    isCollapsed ? "h-6 w-6" : "h-8 w-8"
                  )}>
                    <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                    <AvatarFallback className="rounded-lg">
                      {user?.name ? getUserInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user?.name || 'Unknown User'}</span>
                        <span className="truncate text-xs opacity-70">{user?.email || 'No email'}</span>
                      </div>
                      <ChevronUpIcon className="ml-auto size-4 flex-shrink-0" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isCollapsed ? "right" : "bottom"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href={buildHref('/dashboard/profile', organizationSlug)}>
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <SwitchOrganizationButton className="w-full">
                    Switch Organization
                  </SwitchOrganizationButton>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <LogoutButton 
                      variant="ghost"
                      className="w-full justify-start h-auto p-0"
                    />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}