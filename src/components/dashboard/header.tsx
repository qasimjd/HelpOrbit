"use client"

import React, { useState } from 'react'
import { BellIcon, SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogoutButton } from '@/components/auth/logout-button'
import { cn } from '@/lib/utils'
import NavigationHeader from '@/components/sheard/navigation-header'
import { SidebarTrigger } from '../ui/sidebar'
import { useUser } from '@/contexts/user-context'
import { USER_MENU_ITEMS, buildHref } from '@/lib/navigation-constants'
import Link from 'next/link'

interface HeaderProps {
  organizationSlug: string
  organizationName?: string
  className?: string
}

export function Header({ organizationSlug, organizationName, className }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false)
  const { user, currentOrganization, isLoading } = useUser()

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
    <div className="border-b">

      {/* Main Header with Search and Actions */}
      <header
        className={cn(
          "flex h-12 items-center justify-between px-4",
          className
        )}
      >

        {/* Left side - Search */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger />

          {/* Search - Desktop */}
          <div className="hidden md:block">
            <div className="relative">
              <SearchIcon
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 text-brand-primary"
              />
              <Input
                placeholder="Search tickets..."
                className="w-80 pl-10 bg-brand-card"
              />
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Search - Mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-brand-primary"
            onClick={() => setShowSearch(!showSearch)}
          >
            <SearchIcon className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative"
              >
                <BellIcon className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-brand-primary"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4 text-sm font-medium">
                Notifications
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">New ticket assigned</p>
                  <p className="text-xs opacity-70">Ticket #1234 needs your attention</p>
                  <p className="text-xs opacity-50">2 minutes ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Customer replied</p>
                  <p className="text-xs opacity-70">New reply on ticket #1233</p>
                  <p className="text-xs opacity-50">15 minutes ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Ticket resolved</p>
                  <p className="text-xs opacity-70">Ticket #1232 has been resolved</p>
                  <p className="text-xs opacity-50">1 hour ago</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-6 w-6 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                  <AvatarFallback
                    className="bg-brand-surface text-brand-primary text-xs ring-2"
                  >
                    {user?.name ? getUserInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className='w-56'>
              {/* User Info */}
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                  <AvatarFallback
                    className="bg-brand-surface text-brand-primary text-xs"
                  >
                    {user?.name ? getUserInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user?.name || 'Unknown User'}
                  </p>
                  <p className="opacity-70 truncate text-xs">
                    {user?.email || 'No email'}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              
              {/* Menu Items */}
              {USER_MENU_ITEMS.map((item) => (
                <DropdownMenuItem key={item.name} asChild>
                  <Link 
                    href={buildHref(item.href, organizationSlug)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <item.icon className="h-4 w-4 text-brand-primary" />
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              {/* Logout */}
              <DropdownMenuItem asChild>
                <div className="w-full">
                  <LogoutButton 
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 h-auto p-2"
                  />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Search Overlay */}
        {showSearch && (
          <div
            className="absolute top-16 left-0 right-0 z-50 border-b p-4 md:hidden bg-brand-background border-brand-text-10"
          >
            <div className="relative">
              <SearchIcon
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 text-brand-primary"
              />
              <Input
                placeholder="Search tickets..."
                className="pl-10 pr-12 bg-brand-card border-brand-text-20 text-brand-primary"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-primary"
                onClick={() => setShowSearch(false)}
              >
                ×
              </Button>
            </div>
          </div>
        )}
      </header>
      {/* Navigation Header with Breadcrumb */}
      <NavigationHeader
        organizationSlug={organizationSlug}
        organizationName={currentOrganization?.name || organizationName}
      />

    </div>
  )
}