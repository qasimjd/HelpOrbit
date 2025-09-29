import { 
  TicketIcon, 
  HomeIcon, 
  UsersIcon, 
  SettingsIcon,
  PlusIcon,
  UserIcon,
  BellIcon
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  description?: string
}

export interface NavigationSection {
  title?: string
  items: NavigationItem[]
}

// Main navigation items
export const MAIN_NAVIGATION: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon,
    description: 'Overview and statistics'
  },
  { 
    name: 'Tickets', 
    href: '/dashboard/tickets', 
    icon: TicketIcon,
    description: 'Manage support tickets'
  },
  { 
    name: 'Members', 
    href: '/dashboard/members', 
    icon: UsersIcon,
    description: 'Members management'
  },
]

// Settings navigation items
export const SETTINGS_NAVIGATION: NavigationItem[] = [
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: SettingsIcon,
    description: 'Organization settings'
  },
]

// Quick actions
export const QUICK_ACTIONS: NavigationItem[] = [
  {
    name: 'New Ticket',
    href: '/dashboard/tickets/new',
    icon: PlusIcon,
    description: 'Create a new support ticket'
  }
]

// User menu items (for dropdowns)
export const USER_MENU_ITEMS: NavigationItem[] = [
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: UserIcon,
    description: 'View and edit your profile'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: SettingsIcon,
    description: 'Account settings'
  }
]

// Header action items
export const HEADER_ACTIONS: NavigationItem[] = [
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: BellIcon,
    description: 'View notifications'
  }
]

// Complete navigation structure
export const NAVIGATION_STRUCTURE: NavigationSection[] = [
  {
    title: 'Main',
    items: MAIN_NAVIGATION
  },
  {
    title: 'Settings',
    items: SETTINGS_NAVIGATION
  }
]

// Helper function to build full href with organization slug
export const buildHref = (baseHref: string, organizationSlug: string): string => {
  return `/org/${organizationSlug}${baseHref}`
}

// Helper function to check if a navigation item is active
export const isNavigationActive = (
  itemHref: string, 
  currentPath: string, 
  organizationSlug: string
): boolean => {
  const fullHref = buildHref(itemHref, organizationSlug)
  return currentPath === fullHref || currentPath.startsWith(fullHref + '/')
}

// Role-based navigation filtering
export const filterNavigationByRole = (
  items: NavigationItem[]
): NavigationItem[] => {
  // Add role-based filtering logic here if needed
  // For now, return all items
  return items
}