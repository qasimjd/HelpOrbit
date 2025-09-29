"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import type { 
  Ticket, 
  TicketWithDetails, 
  TicketStats, 
  TicketContextValue,
  CreateTicketData,
  UpdateTicketData,
  TicketFilters
} from '@/types'
import { useCurrentOrganization } from './user-context'
import { 
  getTicketsAction,
  getTicketStatsAction,
  getTicketByIdAction,
  createTicketAction,
  updateTicketAction,
  deleteTicketAction,
  assignTicketAction,
  changeTicketStatusAction
} from '@/server/actions/ticket-actions'

const TicketContext = createContext<TicketContextValue | null>(null)

interface TicketProviderProps {
  children: ReactNode
}

export function TicketProvider({ children }: TicketProviderProps) {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([])
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null)
  const [currentTicket, setCurrentTicket] = useState<TicketWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentOrganization = useCurrentOrganization()

  // Fetch tickets for the current organization
  const fetchTickets = useCallback(async (filters?: TicketFilters) => {
    if (!currentOrganization) return

    try {
      setIsLoading(true)
      setError(null)

      console.log('Fetching tickets for organization:', currentOrganization.id)
      const result = await getTicketsAction(currentOrganization.id, filters)
      
      if (result.success && result.data) {
        setTickets(result.data.tickets)
      } else {
        throw new Error(result.error || 'Failed to fetch tickets')
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch tickets')
      setTickets([])
    } finally {
      setIsLoading(false)
    }
  }, [currentOrganization])

  // Fetch ticket statistics
  const fetchTicketStats = useCallback(async () => {
    if (!currentOrganization) return

    try {
      console.log('Fetching ticket stats for organization:', currentOrganization.id)
      const result = await getTicketStatsAction(currentOrganization.id)
      
      if (result.success && result.data) {
        setTicketStats(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch ticket stats')
      }
    } catch (error) {
      console.error('Error fetching ticket stats:', error)
      // Don't set error state for stats, just log it
    }
  }, [currentOrganization])

  // Fetch a specific ticket
  const fetchTicketById = async (ticketId: string): Promise<TicketWithDetails | null> => {
    if (!currentOrganization) return null

    try {
      setIsLoading(true)
      setError(null)

      console.log('Fetching ticket:', ticketId)
      const result = await getTicketByIdAction(ticketId, currentOrganization.id)
      
      if (result.success && result.data) {
        setCurrentTicket(result.data)
        return result.data
      } else {
        throw new Error(result.error || 'Failed to fetch ticket')
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch ticket')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new ticket
  const createTicket = async (ticketData: CreateTicketData): Promise<Ticket | null> => {
    if (!currentOrganization) return null

    try {
      setIsLoading(true)
      setError(null)

      console.log('Creating ticket:', ticketData)
      const result = await createTicketAction(currentOrganization.id, ticketData)
      
      if (result.success && result.data) {
        // Refresh tickets and stats
        await Promise.all([
          fetchTickets(),
          fetchTicketStats()
        ])
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create ticket')
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      setError(error instanceof Error ? error.message : 'Failed to create ticket')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Update a ticket
  const updateTicket = async (ticketId: string, updates: UpdateTicketData): Promise<Ticket | null> => {
    if (!currentOrganization) return null

    try {
      setIsLoading(true)
      setError(null)

      console.log('Updating ticket:', ticketId, updates)
      const result = await updateTicketAction(ticketId, currentOrganization.id, updates)
      
      if (result.success && result.data) {
        // Update current ticket if it matches
        if (currentTicket?.id === ticketId) {
          setCurrentTicket(prev => prev ? { ...prev, ...updates } : null)
        }
        
        // Refresh tickets and stats
        await Promise.all([
          fetchTickets(),
          fetchTicketStats()
        ])
        return result.data
      } else {
        throw new Error(result.error || 'Failed to update ticket')
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
      setError(error instanceof Error ? error.message : 'Failed to update ticket')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a ticket
  const deleteTicket = async (ticketId: string): Promise<boolean> => {
    if (!currentOrganization) return false

    try {
      setIsLoading(true)
      setError(null)

      console.log('Deleting ticket:', ticketId)
      const result = await deleteTicketAction(ticketId, currentOrganization.id)
      
      if (result.success) {
        // Clear current ticket if it matches
        if (currentTicket?.id === ticketId) {
          setCurrentTicket(null)
        }
        
        // Refresh tickets and stats
        await Promise.all([
          fetchTickets(),
          fetchTicketStats()
        ])
        return true
      } else {
        throw new Error(result.error || 'Failed to delete ticket')
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete ticket')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Assign a ticket
  const assignTicket = async (ticketId: string, assigneeId: string | null): Promise<Ticket | null> => {
    if (!currentOrganization) return null

    try {
      setIsLoading(true)
      setError(null)

      console.log('Assigning ticket:', ticketId, 'to:', assigneeId)
      const result = await assignTicketAction(ticketId, currentOrganization.id, assigneeId)
      
      if (result.success && result.data) {
        // Update current ticket if it matches
        if (currentTicket?.id === ticketId) {
          setCurrentTicket(prev => prev ? { ...prev, assigneeId } : null)
        }
        
        // Refresh tickets and stats
        await Promise.all([
          fetchTickets(),
          fetchTicketStats()
        ])
        return result.data
      } else {
        throw new Error(result.error || 'Failed to assign ticket')
      }
    } catch (error) {
      console.error('Error assigning ticket:', error)
      setError(error instanceof Error ? error.message : 'Failed to assign ticket')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Change ticket status
  const changeTicketStatus = async (ticketId: string, status: Ticket['status']): Promise<Ticket | null> => {
    if (!currentOrganization) return null

    try {
      setIsLoading(true)
      setError(null)

      console.log('Changing ticket status:', ticketId, 'to:', status)
      const result = await changeTicketStatusAction(ticketId, currentOrganization.id, status)
      
      if (result.success && result.data) {
        // Update current ticket if it matches
        if (currentTicket?.id === ticketId) {
          setCurrentTicket(prev => prev ? { 
            ...prev, 
            status,
            resolvedAt: status === 'resolved' ? new Date() : prev.resolvedAt
          } : null)
        }
        
        // Refresh tickets and stats
        await Promise.all([
          fetchTickets(),
          fetchTicketStats()
        ])
        return result.data
      } else {
        throw new Error(result.error || 'Failed to change ticket status')
      }
    } catch (error) {
      console.error('Error changing ticket status:', error)
      setError(error instanceof Error ? error.message : 'Failed to change ticket status')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh all data
  const refreshData = useCallback(async (filters?: TicketFilters) => {
    if (!currentOrganization) return

    await Promise.all([
      fetchTickets(filters),
      fetchTicketStats()
    ])
  }, [currentOrganization, fetchTickets, fetchTicketStats])

  // Load initial data when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refreshData()
    } else {
      // Clear data when no organization
      setTickets([])
      setTicketStats(null)
      setCurrentTicket(null)
      setError(null)
    }
  }, [currentOrganization, refreshData])

  const contextValue: TicketContextValue = {
    // State
    tickets,
    ticketStats,
    currentTicket,
    isLoading,
    error,
    
    // Actions
    fetchTickets,
    fetchTicketStats,
    fetchTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
    assignTicket,
    changeTicketStatus,
    refreshData,
    
    // Setters
    setCurrentTicket,
    clearError: () => setError(null)
  }

  return (
    <TicketContext.Provider value={contextValue}>
      {children}
    </TicketContext.Provider>
  )
}

export function useTickets() {
  const context = useContext(TicketContext)
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider')
  }
  return context
}

export function useCurrentTicket() {
  const { currentTicket } = useTickets()
  return currentTicket
}

export function useTicketStats() {
  const { ticketStats } = useTickets()
  return ticketStats
}