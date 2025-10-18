import { MemberRole, InvitationStatus } from "@/types/auth-organization"
import { clsx, type ClassValue } from "clsx"
import { CheckCircle, Clock, Crown, Shield, ShieldCheck, User, Users, XCircle, AlertCircle } from "lucide-react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getUserRoleColor = (role: MemberRole) => {
  switch (role) {
    case 'owner':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'admin':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'member':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'guest':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getRoleIcon = (role: MemberRole) => {
  switch (role) {
    case "owner":
      return Crown;
    case "admin":
      return Shield;
    case "member":
      return ShieldCheck;
    default:
      return User;
  }
};

export const userRoleIcons = {
  owner: Crown,
  admin: ShieldCheck,
  member: Shield,
  guest: Users,
};


export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const generateDefaultLogo = () => {
  const gradientSets = [
    ['#6366f1', '#8b5cf6', '#ec4899'],                // Indigo → Violet → Pink
    ['#06b6d4', '#3b82f6', '#8b5cf6', '#6366f1'],     // Cyan → Blue → Violet → Indigo
    ['#10b981', '#84cc16', '#f59e0b', '#f97316'],     // Emerald → Lime → Amber → Orange
    ['#ef4444', '#f43f5e', '#ec4899', '#8b5cf6'],     // Red → Rose → Pink → Violet
    ['#14b8a6', '#06b6d4', '#3b82f6', '#6366f1'],     // Teal → Cyan → Blue → Indigo
  ]

  const colors = gradientSets[Math.floor(Math.random() * gradientSets.length)]

  const stops = colors
    .map((color, i) => {
      const offset = (i / (colors.length - 1)) * 100
      return `<stop offset="${offset}%" stop-color="${color}"/>`
    })
    .join('')

  const svg = `
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          ${stops}
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#grad)"/>
      <text x="60" y="60" font-family="system-ui, -apple-system, sans-serif" 
            font-size="36" font-weight="600" fill="white" 
            text-anchor="middle" dominant-baseline="central">
      </text>
    </svg>
  `
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(svg)}`
  return svgDataUrl
}


export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-") 
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function generateId(): string {
  // Generate a random ID using crypto API
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Get role color classes with dark mode support for badges
 */
export const getRoleColorWithDarkMode = (role: MemberRole) => {
  switch (role) {
    case 'owner':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'admin':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'member':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'guest':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

/**
 * Get status icon component and color class for invitations
 */
export const getInvitationStatusIcon = (status: InvitationStatus) => {
  switch (status) {
    case 'pending':
      return { icon: Clock, colorClass: "text-amber-500" }
    case 'accepted':
      return { icon: CheckCircle, colorClass: "text-green-500" }
    case 'rejected':
      return { icon: XCircle, colorClass: "text-red-500" }
    case 'canceled':
      return { icon: XCircle, colorClass: "text-gray-500" }
    default:
      return { icon: AlertCircle, colorClass: "text-gray-500" }
  }
} 
