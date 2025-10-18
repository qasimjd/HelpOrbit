"use client"

import React, { useState, memo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCheck, Activity } from 'lucide-react'
import { AssignTicketDialog } from '@/components/tickets/assign-ticket-dialog'
import { ChangeStatusDialog } from '@/components/tickets/change-status-dialog'
import { useTicketAssignee, useTicketStatus } from '@/components/tickets/ticket-details-sidebar'
import type { TicketStatus } from '@/types/ticket'

interface TicketActionCardProps {
  slug: string
  ticketId: string
  organizationId: string
  currentAssigneeId?: string | null
  currentStatus?: TicketStatus
}

const TicketActionCard = memo<TicketActionCardProps>(({ 
  slug, 
  ticketId, 
  organizationId, 
  currentAssigneeId,
  currentStatus = 'open'
}) => {
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const { currentAssigneeId: contextAssigneeId, updateAssignee } = useTicketAssignee()
  const { currentStatus: contextStatus, updateStatus } = useTicketStatus()

  // Use the context values if available, otherwise fallback to props
  const effectiveAssigneeId = contextAssigneeId ?? currentAssigneeId
  const effectiveStatus = contextStatus ?? currentStatus

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href={`/org/${slug}/dashboard/tickets/${ticketId}/edit`}>
              Edit Ticket
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setShowStatusDialog(true)}
          >
            <Activity className="w-4 h-4 mr-2" />
            Change Status
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setShowAssignDialog(true)}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            {effectiveAssigneeId ? 'Reassign Ticket' : 'Assign Ticket'}
          </Button>
        </CardContent>
      </Card>

      <AssignTicketDialog
        ticketId={ticketId}
        organizationId={organizationId}
        currentAssigneeId={effectiveAssigneeId}
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        onAssignmentChange={updateAssignee}
      />

      <ChangeStatusDialog
        ticketId={ticketId}
        organizationId={organizationId}
        currentStatus={effectiveStatus}
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        onStatusChange={updateStatus}
      />
    </>
  )
})

TicketActionCard.displayName = 'TicketActionCard'

export default TicketActionCard
