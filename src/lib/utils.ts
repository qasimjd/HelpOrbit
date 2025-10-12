import { MemberRole } from "@/types/auth-organization"
import { clsx, type ClassValue } from "clsx"
import { CheckCircle, Clock, Crown, Shield, ShieldCheck, Users, XCircle } from "lucide-react"
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
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // spaces → hyphen
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .slice(0, 50); // enforce max length
}

export function generateId(): string {
  // Generate a random ID using crypto API
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}


export const inviteStatusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  accepted: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  cancelled: "bg-gray-100 text-gray-800 border-gray-300",
};

export const inviteStatusIcons = {
  pending: Clock,
  accepted: CheckCircle,
  rejected: XCircle,
  cancelled: XCircle,
}; 
