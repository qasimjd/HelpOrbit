import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogoutButton } from '@/components/auth/logout-button'
import { USER_MENU_ITEMS, buildHref } from '@/lib/navigation-constants'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useCurrentOrganization, useUser } from '@/contexts/user-context'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'


const UserMenu = () => {

    const { user, currentOrganization, isLoading } = useUser()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative size-8 rounded-full">
                    <Avatar className='ring-brand-primary'>
                        <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                        <AvatarFallback
                            className="bg-brand-surface ring-brand-primary text-brand-primary text-xs"
                        >
                            {user?.name ? getInitials(user.name) : 'U'}
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
                        {/* <Link
                            href={buildHref(item.href, organizationSlug)}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <item.icon className="h-4 w-4 text-brand-primary" />
                            {item.name}
                        </Link> */}
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
    )
}

export default UserMenu
