import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ticket } from '@/types'

const TicketActionCard = ({ slug, ticketId }: { slug: string; ticketId: string; }) => {
  return (
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
        <Button variant="outline" size="sm"  className="w-full">
          Change Status
        </Button>
        <Button variant="outline" size="sm"  className="w-full">
          Assign Ticket
        </Button>
      </CardContent>
    </Card>
  )
}

export default TicketActionCard
