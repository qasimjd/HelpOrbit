"use client"

import React from 'react'
import { TicketAssigneeProvider } from '@/components/tickets/ticket-details-sidebar'
import TicketDetailsSidebar from '@/components/tickets/ticket-details-sidebar'
import TicketActionCard from '@/components/sheard/ticket-action-card'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag } from 'lucide-react'
import type { TicketWithDetails } from '@/types'

interface TicketClientWrapperProps {
  slug: string
  ticket: TicketWithDetails
  organizationId: string
  tags: string[]
}

export default function TicketClientWrapper({ 
  slug, 
  ticket, 
  organizationId, 
  tags 
}: TicketClientWrapperProps) {
  // Use the assignee's user ID instead of the member ID
  const initialAssigneeUserId = ticket.assignee?.userId || null
  
  return (
    <TicketAssigneeProvider 
      initialAssigneeId={initialAssigneeUserId}
      initialStatus={ticket.status}
    >
      <div className="space-y-6">
        {/* Ticket Details */}
        <TicketDetailsSidebar 
          slug={slug} 
          ticket={ticket} 
          organizationId={organizationId} 
        />

        {/* Tags */}
        {tags && tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <TicketActionCard 
          slug={slug} 
          ticketId={ticket.id} 
          organizationId={organizationId} 
          currentAssigneeId={initialAssigneeUserId}
          currentStatus={ticket.status}
        />
      </div>
    </TicketAssigneeProvider>
  )
}