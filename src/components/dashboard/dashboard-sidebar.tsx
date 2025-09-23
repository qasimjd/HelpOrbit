"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  TicketIcon, 
  HomeIcon, 
  UsersIcon, 
  SettingsIcon,
  LogOutIcon,
  PlusIcon,
  ChevronUpIcon,
  MailIcon,
  BarChart3Icon,
  FileTextIcon,
  BuildingIcon,
  ChevronDownIcon
} from 'lucide-react'
import { BrandedLogo } from '@/components/branding/branded-logo'
import { useTheme } from '@/components/branding/theme-provider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
import { Badge } from '@/components/ui/badge'
import { OrganizationSelector } from '@/components/auth/organization-selector'
import { cn } from '@/lib/utils'

interface DashboardSidebarProps {
  organizationSlug: string
}

const navigation = [
  { 
    name: 'Overview', 
    href: '/dashboard', 
    icon: HomeIcon,
    description: 'Dashboard overview'
  },
  { 
    name: 'Tickets', 
    href: '/dashboard/tickets', 
    icon: TicketIcon,
    description: 'Support tickets'
  },
  { 
    name: 'Members', 
    href: '/dashboard/members', 
    icon: UsersIcon,
    description: 'Team members & invitations',
    badge: 'New'
  },
]

const organizationMenu = [
  { 
    name: 'Organization Settings', 
    href: '/dashboard/settings', 
    icon: BuildingIcon,
    description: 'Manage organization'
  },
  { 
    name: 'Reports', 
    href: '/dashboard/reports', 
    icon: BarChart3Icon,
    description: 'Analytics & insights'
  },
]

const quickActions = [
  {
    name: 'New Ticket',
    href: '/dashboard/tickets/new',
    icon: PlusIcon,
    description: 'Create support ticket'
  },
  {
    name: 'Invite Member',
    href: '/dashboard/members?invite=true',
    icon: MailIcon,
    description: 'Send invitation'
  },
]

// Mock user data - replace with real data from your auth system
const user = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "/avatars/john-doe.jpg",
}

export function DashboardSidebar({ organizationSlug }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { organization, branding } = useTheme()
  const { state } = useSidebar()
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false)

  const isCollapsed = state === "collapsed"

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === `/org/${organizationSlug}${href}`
    }
    return pathname.startsWith(`/org/${organizationSlug}${href}`)
  }

  const getNavHref = (href: string) => `/org/${organizationSlug}${href}`

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
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
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
                      <Link href={getNavHref(item.href)} className={cn(
                        "flex items-center gap-2 w-full h-full",
                        isCollapsed ? "justify-center" : ""
                      )}>
                        <Icon className={cn(
                          "flex-shrink-0",
                          isCollapsed ? "h-4 w-4" : "h-4 w-4"
                        )} />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </>
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
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <SidebarMenuItem key={action.name}>
                    <SidebarMenuButton 
                      asChild
                      tooltip={isCollapsed ? `${action.name} - ${action.description}` : action.description}
                      className={isCollapsed ? "!w-8 !h-8 !p-0 justify-center" : ""}
                    >
                      <Link href={getNavHref(action.href)} className={cn(
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
                const active = isActive(item.href)
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
                      <Link href={getNavHref(item.href)} className={cn(
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
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.name}</span>
                        <span className="truncate text-xs opacity-70">{user.email}</span>
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
                  <Link href={getNavHref('/dashboard/profile')}>
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/select-organization">
                    Switch Organization
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}