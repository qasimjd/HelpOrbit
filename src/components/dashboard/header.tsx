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
import { cn } from '@/lib/utils'
import NavigationHeader from '@/components/sheard/navigation-header'
import { SidebarTrigger } from '../ui/sidebar'
import { useUser } from '@/contexts/user-context'
import UserMenu from '@/components/sheard/user-menu'

interface HeaderProps {
  organizationSlug: string
  organizationName?: string
  className?: string
}

export function Header({ organizationSlug, organizationName, className }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false)
  const { currentOrganization } = useUser()


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
          <UserMenu />

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