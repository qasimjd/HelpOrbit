export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  assigneeId?: string
  requesterId: string
  organizationId: string
  tags: string[]
  attachments: TicketAttachment[]
  comments: TicketComment[]
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

export interface TicketComment {
  id: string
  ticketId: string
  authorId: string
  content: string
  isInternal: boolean
  attachments: TicketAttachment[]
  createdAt: Date
  updatedAt: Date
}

export interface TicketAttachment {
  id: string
  filename: string
  url: string
  size: number
  contentType: string
  uploadedBy: string
  uploadedAt: Date
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface CreateTicketData {
  title: string
  description: string
  priority: TicketPriority
  tags?: string[]
  attachments?: File[]
}

export interface UpdateTicketData {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  assigneeId?: string
  tags?: string[]
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
}