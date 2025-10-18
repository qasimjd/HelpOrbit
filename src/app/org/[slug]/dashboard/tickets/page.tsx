import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PlusIcon,
  SearchIcon,
  FilterIcon
} from 'lucide-react'
import { getOrganizationBySlug, getTicketsByOrganization } from '@/server/db/queries'
import { notFound } from 'next/navigation'
import TicketCard from '@/components/sheard/ticket-card'

interface TicketsPageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Tickets - HelpOrbit',
  description: 'Manage and track support tickets',
}

// Cached ticket data fetching
const getCachedTickets = (organizationId: string) => unstable_cache(
  async () => {
    return await getTicketsByOrganization(organizationId)
  },
  [`tickets-${organizationId}`],
  {
    tags: [`tickets-${organizationId}`],
    revalidate: 300, // Cache for 5 minutes
  }
)



export default async function TicketsPage({ params }: TicketsPageProps) {
  const { slug } = await params

  // Get organization
  const organization = await getOrganizationBySlug(slug)

  if (!organization) {
    notFound()
  }

  // Fetch tickets with caching
  const getCachedTicketsForOrg = getCachedTickets(organization.id)

  const tickets = await getCachedTicketsForOrg();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all support tickets
          </p>
        </div>
        <Button asChild className="btn-brand-primary">
          <Link href={`/org/${slug}/dashboard/tickets/new`}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Ticket
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              className="pl-10 input-brand"
            />
          </div>

          {/* Status Filter */}
          <Select>
            <SelectTrigger className="w-full md:w-[120px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="waiting_for_customer">Waiting</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select>
            <SelectTrigger className="w-full md:w-[120px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
            <Select>
            <SelectTrigger className="w-full md:w-[120px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature_request">Feature Request</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
            </Select>

          <Button variant="outline" size="sm">
            <FilterIcon className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <h3 className="text-lg font-medium mb-2 text-foreground">No tickets found</h3>
                <p className="mb-4">Create your first ticket to get started.</p>
                <Button asChild className='btn-brand-primary'>
                  <Link href={`/org/${slug}/dashboard/tickets/new`}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Ticket
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} slug={slug} />
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 py-4">
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
        <Button variant="outline" size="sm" className="bg-brand-primary">
          1
        </Button>
        <Button variant="outline" size="sm">
          2
        </Button>
        <Button variant="outline" size="sm">
          3
        </Button>
        <Button variant="outline" size="sm">
          Next
        </Button>
      </div>
    </div>
  )
}