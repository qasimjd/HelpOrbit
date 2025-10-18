import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getOrganizationBySlug, getTicketById } from '@/server/db/queries'
import {
  getStatusColor,
  getPriorityColor,
  formatStatusText,
  formatPriorityText,
  getTypeColor,
  formatTypeText
} from '@/lib/ticket-utils'
import TicketClientWrapper from '@/components/tickets/ticket-client-wrapper'

interface TicketDetailPageProps {
  params: Promise<{ slug: string; ticketId: string }>
}

export async function generateMetadata({ params }: TicketDetailPageProps): Promise<Metadata> {
  const { ticketId } = await params

  return {
    title: `Ticket #${ticketId} - HelpOrbit`,
    description: 'View ticket details and manage support requests',
  }
}

// Cached ticket fetching
const getCachedTicketById = (ticketId: string, organizationId: string) => unstable_cache(
  async () => {
    return await getTicketById(ticketId, organizationId)
  },
  [`ticket-${ticketId}-${organizationId}`],
  {
    tags: [`ticket:${ticketId}`, `tickets:${organizationId}`],
    revalidate: 60, // Cache for 1 minute
  }
)



export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { slug, ticketId } = await params

  // Get organization
  const organization = await getOrganizationBySlug(slug)

  if (!organization) {
    notFound()
  }

  // Fetch ticket with caching
  const getCachedTicket = getCachedTicketById(ticketId, organization.id)
  const ticket = await getCachedTicket()

  if (!ticket) {
    notFound()
  }

  // Tags are already parsed by the database query
  const tags = ticket.tags || []

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">
                #{ticket.id}
              </h1>
              <Badge
                variant="secondary"
                className={getStatusColor(ticket.status)}
              >
                {formatStatusText(ticket.status)}
              </Badge>
              <Badge
                variant="outline"
                className={getPriorityColor(ticket.priority)}
              >
                {formatPriorityText(ticket.priority)}
              </Badge>
              <Badge
                variant="secondary"
                className={getTypeColor(ticket.type)}
              >
                {formatTypeText(ticket.type)}
              </Badge>
            </div>
            <p className="text-foreground mt-1">
              {ticket.title}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href={`/org/${slug}/dashboard/tickets`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {ticket.description || 'No description provided.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section - Placeholder for future implementation */}
          <Card>
            <CardHeader>
              <CardTitle>Comments & Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Comments functionality will be implemented here.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <TicketClientWrapper 
          slug={slug} 
          ticket={ticket} 
          organizationId={organization.id} 
          tags={tags} 
        />
      </div>
    </div>
  )
}