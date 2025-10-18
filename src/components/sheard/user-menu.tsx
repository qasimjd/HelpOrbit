import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogoutButton } from '@/components/auth/logout-button'
import { USER_MENU_ITEMS, buildHref } from '@/lib/navigation-constants'
import { getCurrentUser } from '@/server/actions/user-actions'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import type { User } from '@/types'

interface UserMenuProps {
    user?: User | null
    organizationId?: string
}

// Server component version that fetches user data
export async function ServerUserMenu({ organizationId }: { organizationId?: string }) {
    try {
        const userResponse = await getCurrentUser()
        
        if (!userResponse.success || !userResponse.data) {
            return null
        }

        const user = userResponse.data
        return <UserMenu user={user} organizationId={organizationId} />
    } catch (error) {
        console.error('Error loading user menu:', error)
        return null
    }
}

// Client component for when user data is already available
export const UserMenu = ({ user, organizationId }: UserMenuProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" asChild className="relative size-8 rounded-full">
                    <Avatar>
                        <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                        <AvatarFallback
                            className="bg-brand-surface text-brand-primary text-xs"
                        >
                            {user?.name ? getInitials(user.name) : 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className='w-56'>
                {/* User Info */}
                <div className="flex items-center gap-2 p-2">
                    <Avatar className="size-9">
                        <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                        <AvatarFallback
                            className="bg-brand-surface text-brand-primary text-xs"
                        >
                            {user?.name ? getInitials(user.name) : 'U'}
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
                            href={organizationId ? buildHref(item.href, organizationId) : item.href}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                {/* Theme Switcher */}
                <div className="p-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Theme</span>
                        <ThemeSwitcher />
                    </div>
                </div>

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
    )
}

export default UserMenu
