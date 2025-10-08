import type { TicketStatus, TicketPriority, TicketType } from '@/types/ticket'

/**
 * Status color mappings for ticket status badges
 */
export const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  waiting_for_customer: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
} as const

/**
 * Type color mappings for ticket type badges
 */
export const typeColors = {
  general: 'bg-blue-100 text-blue-800',
  bug: 'bg-red-100 text-red-800',
  feature_request: 'bg-yellow-100 text-yellow-800',
  support: 'bg-green-100 text-green-800',
  billing: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800'
} as const

/**
 * Priority color mappings for ticket priority badges
 */
export const priorityColors = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
} as const

/**
 * Get CSS classes for ticket status badge
 */
export function getStatusColor(status: TicketStatus): string {
  return statusColors[status] || statusColors.open
}

/**
 * Get CSS classes for ticket status badge
 */
export function getTypeColor(type: TicketType): string {
  return typeColors[type] || typeColors.bug
}

/**
 * Get CSS classes for ticket priority badge
 */
export function getPriorityColor(priority: TicketPriority): string {
  return priorityColors[priority] || priorityColors.medium
}

/**
 * Format a date string for display in ticket lists and details
 */
export function formatTicketDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format a date for relative display (e.g., "2 hours ago", "yesterday")
 */
export function formatRelativeDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }
  
  return formatTicketDate(date)
}

/**
 * Format status text for display (replace underscores with spaces and capitalize)
 */
export function formatStatusText(status: TicketStatus): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Format status text for display (replace underscores with spaces and capitalize)
 */
export function formatTypeText(type: TicketType): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Format priority text for display (capitalize first letter)
 */
export function formatPriorityText(priority: TicketPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

/**
 * Generate a unique ticket ID
 */
export function generateTicketId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 7)
  return `ticket_${timestamp}_${randomStr}`
}

/**
 * Check if a ticket is overdue (open/in_progress for more than 7 days)
 */
export function isTicketOverdue(createdAt: string | Date, status: TicketStatus): boolean {
  if (status === 'resolved' || status === 'closed') {
    return false
  }
  
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const daysSinceCreated = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24))
  
  return daysSinceCreated > 7
}

/**
 * Get priority order for sorting (urgent = 1, high = 2, medium = 3, low = 4)
 */
export function getPriorityOrder(priority: TicketPriority): number {
  const priorityOrder = {
    urgent: 1,
    high: 2,
    medium: 3,
    low: 4
  }
  return priorityOrder[priority] || 3
}

/**
 * Get status order for sorting (open = 1, in_progress = 2, waiting_for_customer = 3, resolved = 4, closed = 5)
 */
export function getStatusOrder(status: TicketStatus): number {
  const statusOrder = {
    open: 1,
    in_progress: 2,
    waiting_for_customer: 3,
    resolved: 4,
    closed: 5
  }
  return statusOrder[status] || 1
}

/**
 * Parse tags from JSON string or comma-separated string, return empty array if invalid
 */
export function parseTags(tags: string | null): string[] {
  if (!tags) return []
  
  try {
    // First, try to parse as JSON (new format)
    return JSON.parse(tags)
  } catch {
    // If JSON parsing fails, try to parse as comma-separated string (legacy format)
    try {
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    } catch {
      return []
    }
  }
}

/**
 * Stringify tags array for database storage
 */
export function stringifyTags(tags: string[] | null | undefined): string | null {
  if (!tags || tags.length === 0) return null
  return JSON.stringify(tags)
}