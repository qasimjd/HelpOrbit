import type { User } from './user'

// Core ticket interface
export interface Ticket {
  id: string
  title: string
  description?: string | null
  status: TicketStatus
  priority: TicketPriority
  tags?: string[] | null
  organizationId: string
  requesterId?: string | null
  assigneeId?: string | null
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date | null
}

// Ticket with populated relations
export interface TicketWithDetails extends Ticket {
  requester?: User | null
  assignee?: {
    id: string
    userId: string
    role: string
  } | null
  comments?: TicketComment[]
  attachments?: TicketAttachment[]
}

export interface TicketComment {
  id: string
  ticketId: string
  userId: string
  content: string
  isInternal?: boolean
  createdAt: Date
  updatedAt?: Date
  user?: User
}

export interface TicketAttachment {
  id: string
  ticketId: string
  userId: string
  fileName: string
  fileSize: number
  fileType: string
  fileUrl: string
  createdAt: Date
  user?: User
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type TicketStatus = 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface CreateTicketData {
  title: string
  description?: string
  priority: TicketPriority
  tags?: string[]
  attachments?: File[]
}

export interface UpdateTicketData {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  assigneeId?: string | null
  tags?: string[]
  resolvedAt?: Date | null
}

// API Response type
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface TicketFilters {
  status?: TicketStatus[]
  priority?: TicketPriority[]
  assigneeId?: string
  requesterId?: string
  tags?: string[]
  search?: string
  dateRange?: {
    from: Date
    to: Date
  }
  limit?: number
  offset?: number
}

// Ticket statistics
export interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
}

// Ticket context value
export interface TicketContextValue {
  // State
  tickets: TicketWithDetails[]
  ticketStats: TicketStats | null
  currentTicket: TicketWithDetails | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchTickets: (filters?: TicketFilters) => Promise<void>
  fetchTicketStats: () => Promise<void>
  fetchTicketById: (ticketId: string) => Promise<TicketWithDetails | null>
  createTicket: (ticketData: CreateTicketData) => Promise<Ticket | null>
  updateTicket: (ticketId: string, updates: UpdateTicketData) => Promise<Ticket | null>
  deleteTicket: (ticketId: string) => Promise<boolean>
  assignTicket: (ticketId: string, assigneeId: string | null) => Promise<Ticket | null>
  changeTicketStatus: (ticketId: string, status: TicketStatus) => Promise<Ticket | null>
  refreshData: (filters?: TicketFilters) => Promise<void>
  
  // Setters
  setCurrentTicket: (ticket: TicketWithDetails | null) => void
  clearError: () => void
}