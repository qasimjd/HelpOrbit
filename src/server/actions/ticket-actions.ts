'use server'

import { revalidatePath } from 'next/cache'
import { 
  getTicketsByOrganization, 
  getTicketStats, 
  getTicketById
} from '@/server/db/queries'
import { requireServerSession } from '@/lib/session'
import type { 
  Ticket, 
  TicketWithDetails, 
  TicketStats, 
  CreateTicketData, 
  UpdateTicketData,
  TicketFilters,
  ApiResponse
} from '@/types'

// Get tickets for an organization with optional filters
export async function getTicketsAction(
  organizationId: string, 
  filters?: TicketFilters
): Promise<ApiResponse<{ tickets: TicketWithDetails[]; total: number }>> {
  try {
    // Require authentication
    await requireServerSession()
    
    if (!organizationId) {
      return {
        success: false,
        error: 'Organization ID is required'
      }
    }

    const tickets = await getTicketsByOrganization(organizationId)
    
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

// Get ticket statistics for an organization
export async function getTicketStatsAction(
  organizationId: string
): Promise<ApiResponse<TicketStats>> {
  try {
    // Require authentication
    await requireServerSession()
    
    if (!organizationId) {
      return {
        success: false,
        error: 'Organization ID is required'
      }
    }

    const stats = await getTicketStats(organizationId)
    
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

// Get a single ticket by ID
export async function getTicketByIdAction(
  ticketId: string,
  organizationId: string
): Promise<ApiResponse<TicketWithDetails>> {
  try {
    // Require authentication
    await requireServerSession()
    
    if (!ticketId || !organizationId) {
      return {
        success: false,
        error: 'Ticket ID and Organization ID are required'
      }
    }

    const ticket = await getTicketById(ticketId, organizationId)
    
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
    // Require authentication
    const session = await requireServerSession()
    
    if (!organizationId) {
      return {
        success: false,
        error: 'Organization ID is required'
      }
    }

    if (!ticketData.title?.trim()) {
      return {
        success: false,
        error: 'Ticket title is required'
      }
    }

    // Create ticket data
    const newTicketData = {
      title: ticketData.title.trim(),
      description: ticketData.description?.trim() || null,
      priority: ticketData.priority,
      tags: ticketData.tags || null,
      organizationId,
      requesterId: session.user.id,
      assigneeId: null, // Will be assigned later
      status: 'open' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null
    }

    // TODO: Implement actual database insertion
    // const ticket = await dbCreateTicket(newTicketData)
    
    // For now, return mock data
    const ticket: Ticket = {
      id: `ticket_${Date.now()}`,
      ...newTicketData
    }

    // Revalidate relevant paths
    revalidatePath(`/org/*/dashboard`)
    revalidatePath(`/org/*/dashboard/tickets`)

    return {
      success: true,
      data: ticket,
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
    // Require authentication
    await requireServerSession()
    
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

    // TODO: Implement actual database update
    // const ticket = await dbUpdateTicket(ticketId, organizationId, updates)
    
    // For now, return mock data
    const ticket: Ticket = {
      id: ticketId,
      title: updates.title || 'Updated Ticket',
      description: updates.description || null,
      status: updates.status || 'open',
      priority: updates.priority || 'medium',
      tags: updates.tags || null,
      organizationId,
      requesterId: null,
      assigneeId: updates.assigneeId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: updates.status === 'resolved' ? new Date() : null
    }

    // Revalidate relevant paths
    revalidatePath(`/org/*/dashboard`)
    revalidatePath(`/org/*/dashboard/tickets`)
    revalidatePath(`/org/*/dashboard/tickets/${ticketId}`)

    return {
      success: true,
      data: ticket,
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
    // Require authentication
    await requireServerSession()
    
    if (!ticketId || !organizationId) {
      return {
        success: false,
        error: 'Ticket ID and Organization ID are required'
      }
    }

    // TODO: Implement actual database deletion
    // const result = await dbDeleteTicket(ticketId, organizationId)
    
    // For now, return success
    const result = true

    if (!result) {
      return {
        success: false,
        error: 'Ticket not found or cannot be deleted'
      }
    }

    // Revalidate relevant paths
    revalidatePath(`/org/*/dashboard`)
    revalidatePath(`/org/*/dashboard/tickets`)

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
    return await updateTicketAction(ticketId, organizationId, { assigneeId })
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
    return await updateTicketAction(ticketId, organizationId, { status })
  } catch (error) {
    console.error('Error in changeTicketStatusAction:', error)
    return {
      success: false,
      error: 'Failed to change ticket status'
    }
  }
}