"use client"

import React, { useState } from 'react'
import { useTickets } from '@/contexts/ticket-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TicketPriority, CreateTicketData } from '@/types'

export function TicketExample() {
  const { 
    tickets, 
    ticketStats, 
    isLoading, 
    error, 
    createTicket, 
    updateTicket, 
    deleteTicket,
    fetchTickets,
    clearError
  } = useTickets()

  const [newTicket, setNewTicket] = useState<CreateTicketData>({
    title: '',
    description: '',
    priority: 'medium'
  })

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTicket.title.trim()) return

    const success = await createTicket(newTicket)
    if (success) {
      setNewTicket({
        title: '',
        description: '',
        priority: 'medium'
      })
    }
  }

  const handleDeleteTicket = async (ticketId: string) => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      await deleteTicket(ticketId)
    }
  }

  const handleStatusChange = async (ticketId: string, status: string) => {
    await updateTicket(ticketId, { status: status as any })
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-red-700">{error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearError}
            className="text-red-700 hover:bg-red-100"
          >
            ×
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      {ticketStats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.openTickets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.inProgressTickets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.resolvedToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Urgent Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.urgentTickets}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Ticket Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={newTicket.title}
                onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter ticket title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter ticket description"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <Select 
                value={newTicket.priority} 
                onValueChange={(value: TicketPriority) => setNewTicket(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading || !newTicket.title.trim()}>
              {isLoading ? 'Creating...' : 'Create Ticket'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tickets ({tickets.length})</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchTickets()}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tickets found</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{ticket.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {ticket.priority}
                      </Badge>
                      <Select 
                        value={ticket.status} 
                        onValueChange={(status) => handleStatusChange(ticket.id, status)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="waiting_for_customer">Waiting for Customer</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteTicket(ticket.id)}
                        disabled={isLoading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  {ticket.description && (
                    <p className="text-gray-600 text-sm">{ticket.description}</p>
                  )}
                  <div className="text-xs text-gray-500">
                    Created: {ticket.createdAt.toLocaleDateString()}
                    {ticket.assigneeId && ` • Assigned to: ${ticket.assigneeId}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}