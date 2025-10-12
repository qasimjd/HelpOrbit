'use server'
import { unstable_cache } from 'next/cache'
import { 
  getTicketsByOrganization, 
  getTicketStats, 
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
} from '@/server/db/queries'
import { requireUserAccess } from './user-actions'
import { generateTicketId, parseTags } from '@/lib/ticket-utils'
import { CACHE_TAGS, CACHE_CONFIG } from '@/server/lib/cache-constants'
import { revalidateTicketCache, revalidateCommonPaths } from '@/server/lib/cache'
import type { 
  Ticket, 
  TicketWithDetails, 
  TicketStats, 
  CreateTicketData, 
  UpdateTicketData,
  TicketFilters,
  ApiResponse,
  TicketPriority,
  TicketType
} from '@/types'

// Define valid values for validation
const VALID_PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'urgent']
const VALID_TYPES: TicketType[] = ['general', 'bug', 'feature_request', 'support', 'billing', 'other']


/**
 * Get tickets for an organization with optional filters and caching
 */
export async function getTicketsAction(
  organizationId: string, 
  filters?: TicketFilters
): Promise<ApiResponse<{ tickets: TicketWithDetails[]; total: number }>> {
  try {
    // Require authentication and organization access
    await requireUserAccess(organizationId)
    
    if (!organizationId) {
      return {
        success: false,
        error: 'Organization ID is required'
      }
    }

    // Create cache key that includes filters
    const filterKey = filters ? JSON.stringify(filters) : 'all'
    
    // Use cached function for tickets
    const getCachedTickets = unstable_cache(
      async () => {
        return await getTicketsByOrganization(organizationId, filters)
      },
      [`tickets-${organizationId}-${filterKey}`],
      {
        tags: [CACHE_TAGS.TICKET.byOrganization(organizationId), CACHE_TAGS.TICKET.all],
        ...CACHE_CONFIG.SHORT
      }
    )

    const tickets = await getCachedTickets()
    
    // Apply filters
    let filteredTickets = tickets
    
    if (filters?.status?.length) {
      filteredTickets = filteredTickets.filter(ticket => 
        filters.status!.includes(ticket.status)
      )
    }
    
    if (filters?.priority?.length) {
      filteredTickets = filteredTickets.filter(ticket => 
        filters.priority!.includes(ticket.priority)
      )
    }
    
    if (filters?.assigneeId) {
      filteredTickets = filteredTickets.filter(ticket => 
        ticket.assignee?.id === filters.assigneeId
      )
    }
    
    if (filters?.requesterId) {
      filteredTickets = filteredTickets.filter(ticket => 
        ticket.requester?.id === filters.requesterId
      )
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      filteredTickets = filteredTickets.filter(ticket => 
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description?.toLowerCase().includes(searchLower)
      )
    }

    return {
      success: true,
      data: {
        tickets: filteredTickets,
        total: filteredTickets.length
      }
    }
  } catch (error) {
    console.error('Error in getTicketsAction:', error)
    return {
      success: false,
      error: 'Failed to fetch tickets'
    }
  }
}

// Get ticket statistics for an organization (with caching)
export async function getTicketStatsAction(
  organizationId: string
): Promise<ApiResponse<TicketStats>> {
  try {
    // Require authentication and organization access
    await requireUserAccess(organizationId)
    
    if (!organizationId) {
      return {
        success: false,
        error: 'Organization ID is required'
      }
    }

    // Use cached function for stats
    const getCachedStats = unstable_cache(
      async () => {
        return await getTicketStats(organizationId)
      },
      [`ticket-stats-${organizationId}`],
      {
        tags: [`ticket-stats-${organizationId}`],
        revalidate: 300, // Cache for 5 minutes
      }
    )

    const stats = await getCachedStats()
    
    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error('Error in getTicketStatsAction:', error)
    return {
      success: false,
      error: 'Failed to fetch ticket statistics'
    }
  }
}

// Get a single ticket by ID (with caching)
export async function getTicketByIdAction(
  ticketId: string,
  organizationId: string
): Promise<ApiResponse<TicketWithDetails>> {
  try {
    // Require authentication and organization access
    await requireUserAccess(organizationId)
    
    if (!ticketId || !organizationId) {
      return {
        success: false,
        error: 'Ticket ID and Organization ID are required'
      }
    }

    // Use cached function for individual ticket
    const getCachedTicket = unstable_cache(
      async () => {
        return await getTicketById(ticketId, organizationId)
      },
      [`ticket-${ticketId}-${organizationId}`],
      {
        tags: [`ticket-${ticketId}`, `tickets-${organizationId}`],
        revalidate: 60, // Cache for 1 minute
      }
    )

    const ticket = await getCachedTicket()
    
    if (!ticket) {
      return {
        success: false,
        error: 'Ticket not found'
      }
    }

    return {
      success: true,
      data: ticket
    }
  } catch (error) {
    console.error('Error in getTicketByIdAction:', error)
    return {
      success: false,
      error: 'Failed to fetch ticket'
    }
  }
}

// Create a new ticket
export async function createTicketAction(
  organizationId: string,
  ticketData: CreateTicketData
): Promise<ApiResponse<Ticket>> {
  try {
    // Require authentication and organization access
    const { userId } = await requireUserAccess(organizationId)
    
    if (!organizationId) {
      return {
        success: false,
        error: 'Organization ID is required'
      }
    }

    // Validate input data
    if (!ticketData.title?.trim()) {
      return {
        success: false,
        error: 'Ticket title is required'
      }
    }

    if (ticketData.title.trim().length < 3) {
      return {
        success: false,
        error: 'Ticket title must be at least 3 characters'
      }
    }

    if (!ticketData.description?.trim()) {
      return {
        success: false,
        error: 'Ticket description is required'
      }
    }

    if (ticketData.description.trim().length < 10) {
      return {
        success: false,
        error: 'Ticket description must be at least 10 characters'
      }
    }

    if (!VALID_PRIORITIES.includes(ticketData.priority)) {
      return {
        success: false,
        error: 'Valid priority is required'
      }
    }

    if (!VALID_TYPES.includes(ticketData.type)) {
      return {
        success: false,
        error: 'Valid type is required'
      }
    }

    // Generate unique ticket ID
    const ticketId = generateTicketId()

    // Create ticket data
    const newTicketData = {
      id: ticketId,
      title: ticketData.title.trim(),
      description: ticketData.description.trim(),
      priority: ticketData.priority,
      type: ticketData.type,
      tags: ticketData.tags && ticketData.tags.length > 0 ? ticketData.tags : null,
      dueDate: ticketData.dueDate || null,
      organizationId,
      requesterId: userId,
      assigneeId: null, // Will be assigned later
      status: 'open' as const
    }

    // Insert into database
    const ticket = await createTicket(newTicketData)

    if (!ticket) {
      return {
        success: false,
        error: 'Failed to create ticket in database'
      }
    }

    // Revalidate cache tags and paths
    await revalidateTicketCache(organizationId)
    await revalidateCommonPaths()

    return {
      success: true,
      data: {
        ...ticket,
        tags: parseTags(ticket.tags)
      } as Ticket,
      message: 'Ticket created successfully'
    }
  } catch (error) {
    console.error('Error in createTicketAction:', error)
    return {
      success: false,
      error: 'Failed to create ticket'
    }
  }
}

// Update an existing ticket
export async function updateTicketAction(
  ticketId: string,
  organizationId: string,
  updates: UpdateTicketData
): Promise<ApiResponse<Ticket>> {
  try {
    // Require authentication and organization access
    await requireUserAccess(organizationId)
    
    if (!ticketId || !organizationId) {
      return {
        success: false,
        error: 'Ticket ID and Organization ID are required'
      }
    }

    // Validate updates
    if (updates.title !== undefined && !updates.title?.trim()) {
      return {
        success: false,
        error: 'Ticket title cannot be empty'
      }
    }

    if (updates.title && updates.title.trim().length < 3) {
      return {
        success: false,
        error: 'Ticket title must be at least 3 characters'
      }
    }

    if (updates.description && updates.description.trim().length < 10) {
      return {
        success: false,
        error: 'Ticket description must be at least 10 characters'
      }
    }

    // Prepare update data
    const updateData: UpdateTicketData = {}
    if (updates.title !== undefined) updateData.title = updates.title.trim()
    if (updates.description !== undefined) updateData.description = updates.description.trim()
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.dueDate !== undefined) updateData.dueDate = updates.dueDate
    if (updates.assigneeId !== undefined) updateData.assigneeId = updates.assigneeId
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.status === 'resolved') updateData.resolvedAt = new Date()

    // Update in database
    const ticket = await updateTicket(ticketId, organizationId, updateData)

    if (!ticket) {
      return {
        success: false,
        error: 'Ticket not found or update failed'
      }
    }

    // Revalidate cache tags and paths
    await revalidateTicketCache(organizationId, ticketId)
    await revalidateCommonPaths()

    return {
      success: true,
      data: {
        ...ticket,
        tags: parseTags(ticket.tags)
      } as Ticket,
      message: 'Ticket updated successfully'
    }
  } catch (error) {
    console.error('Error in updateTicketAction:', error)
    return {
      success: false,
      error: 'Failed to update ticket'
    }
  }
}

// Delete a ticket
export async function deleteTicketAction(
  ticketId: string,
  organizationId: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  try {
    // Require authentication and organization access
    await requireUserAccess(organizationId)
    
    if (!ticketId || !organizationId) {
      return {
        success: false,
        error: 'Ticket ID and Organization ID are required'
      }
    }

    // Delete from database
    const result = await deleteTicket(ticketId, organizationId)

    if (!result) {
      return {
        success: false,
        error: 'Ticket not found or cannot be deleted'
      }
    }

    // Revalidate cache tags and paths
    await revalidateTicketCache(organizationId, ticketId)
    await revalidateCommonPaths()

    return {
      success: true,
      data: { deleted: true },
      message: 'Ticket deleted successfully'
    }
  } catch (error) {
    console.error('Error in deleteTicketAction:', error)
    return {
      success: false,
      error: 'Failed to delete ticket'
    }
  }
}

// Assign a ticket to a user
export async function assignTicketAction(
  ticketId: string,
  organizationId: string,
  assigneeId: string | null
): Promise<ApiResponse<Ticket>> {
  try {
    // Get the current ticket to preserve its type
    const currentTicket = await getTicketByIdAction(ticketId, organizationId)
    if (!currentTicket.success || !currentTicket.data) {
      return {
        success: false,
        error: 'Ticket not found'
      }
    }
    
    return await updateTicketAction(ticketId, organizationId, { 
      assigneeId,
      type: currentTicket.data.type
    })
  } catch (error) {
    console.error('Error in assignTicketAction:', error)
    return {
      success: false,
      error: 'Failed to assign ticket'
    }
  }
}

// Change ticket status
export async function changeTicketStatusAction(
  ticketId: string,
  organizationId: string,
  status: Ticket['status']
): Promise<ApiResponse<Ticket>> {
  try {
    // Get the current ticket to preserve its type
    const currentTicket = await getTicketByIdAction(ticketId, organizationId)
    if (!currentTicket.success || !currentTicket.data) {
      return {
        success: false,
        error: 'Ticket not found'
      }
    }
    
    return await updateTicketAction(ticketId, organizationId, { 
      status,
      type: currentTicket.data.type
    })
  } catch (error) {
    console.error('Error in changeTicketStatusAction:', error)
    return {
      success: false,
      error: 'Failed to change ticket status'
    }
  }
}



