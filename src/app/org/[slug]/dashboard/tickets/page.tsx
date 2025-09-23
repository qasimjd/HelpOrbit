import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  FilterIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon
} from 'lucide-react'

interface TicketsPageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Tickets - HelpOrbit',
  description: 'Manage and track support tickets',
}

// Mock ticket data
const tickets = [
  {
    id: '1234',
    title: 'Login issues with SSO authentication',
    status: 'urgent',
    priority: 'urgent',
    customer: { name: 'Sarah Wilson', email: 'sarah@example.com' },
    assignee: { name: 'John Doe', avatar: 'JD' },
    created: '2024-01-20T10:30:00Z',
    updated: '2024-01-20T14:15:00Z',
    tags: ['sso', 'authentication']
  },
  {
    id: '1233',
    title: 'Payment processing error on checkout',
    status: 'in_progress',
    priority: 'high',
    customer: { name: 'Mike Johnson', email: 'mike@company.com' },
    assignee: { name: 'Jane Smith', avatar: 'JS' },
    created: '2024-01-20T08:45:00Z',
    updated: '2024-01-20T12:20:00Z',
    tags: ['payment', 'checkout']
  },
  {
    id: '1232',
    title: 'Feature request: Dark mode support',
    status: 'open',
    priority: 'medium',
    customer: { name: 'Alex Chen', email: 'alex@startup.io' },
    assignee: null,
    created: '2024-01-19T16:20:00Z',
    updated: '2024-01-19T16:20:00Z',
    tags: ['feature-request', 'ui']
  },
  {
    id: '1231',
    title: 'Mobile app crashing on startup',
    status: 'waiting_for_customer',
    priority: 'high',
    customer: { name: 'Emma Davis', email: 'emma@mobile-user.com' },
    assignee: { name: 'John Doe', avatar: 'JD' },
    created: '2024-01-19T14:10:00Z',
    updated: '2024-01-20T09:30:00Z',
    tags: ['mobile', 'bug']
  }
]

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  waiting_for_customer: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
}

const priorityColors = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default async function TicketsPage({ params }: TicketsPageProps) {
  const { slug } = await params

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600 mt-1">
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
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            {/* Search */}
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                className="pl-10 input-brand"
              />
            </div>
            
            {/* Status Filter */}
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
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
              <SelectTrigger className="w-full md:w-[180px]">
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

            <Button variant="outline" size="sm">
              <FilterIcon className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <Link
                      href={`/org/${slug}/dashboard/tickets/${ticket.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-brand-primary"
                    >
                      #{ticket.id}
                    </Link>
                    <Badge 
                      variant="secondary" 
                      className={statusColors[ticket.status as keyof typeof statusColors]}
                    >
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={priorityColors[ticket.priority as keyof typeof priorityColors]}
                    >
                      {ticket.priority}
                    </Badge>
                  </div>
                  
                  <h3 className="text-gray-900 font-medium mb-3 hover:text-brand-primary">
                    <Link href={`/org/${slug}/dashboard/tickets/${ticket.id}`}>
                      {ticket.title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      {ticket.customer.name}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      Assignee: {ticket.assignee?.name || 'Unassigned'}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Created {formatDate(ticket.created)}
                    </div>
                  </div>

                  {/* Tags */}
                  {ticket.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {ticket.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assignee Avatar */}
                <div className="ml-4 flex-shrink-0">
                  {ticket.assignee && (
                    <div className="w-10 h-10 bg-brand-primary-100 text-brand-primary rounded-full flex items-center justify-center text-sm font-medium">
                      {ticket.assignee.avatar}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 py-4">
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
        <Button variant="outline" size="sm" className="bg-brand-primary text-white">
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