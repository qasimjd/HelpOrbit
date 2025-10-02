import React from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TicketIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  TrendingUpIcon,
  PlusIcon,
  ClockIcon
} from 'lucide-react'
import Link from 'next/link'
import { getDashboardData } from '@/server/actions/dashboard-actions'
import { getOrganizationBySlug } from '@/server/db/queries'
import { statusColors } from '@/lib/ticket-utils'

interface DashboardPageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Dashboard - HelpOrbit',
  description: 'Overview of your support tickets and team performance',
}

// Map icon names to components
const iconMap = {
  TicketIcon,
  ClockIcon, 
  CheckCircleIcon,
  AlertCircleIcon
}


export default async function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = await params
  
  // Get organization data
  const organization = await getOrganizationBySlug(slug)
  if (!organization) {
    return <div>Organization not found</div>
  }

  // Get dashboard data
  const { stats, recentTickets } = await getDashboardData(organization.id)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your support tickets.
          </p>
        </div>
        <Button asChild className="btn-brand-primary">
          <Link href={`/org/${slug}/dashboard/tickets/new`}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Ticket
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const IconComponent = iconMap[stat.icon as keyof typeof iconMap]
          return (
            <Card key={stat.title} className="card-brand">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor} mr-4`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <span className="text-2xl font-bold">
                      {stat.value}
                    </span>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {stat.change}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tickets</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/org/${slug}/dashboard/tickets`}>
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <Link 
                        href={`/org/${slug}/dashboard/tickets/${ticket.id}`}
                        className="font-medium hover:text-brand-primary"
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
                        className={statusColors[ticket.priority as keyof typeof statusColors]}
                      >
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-900 mt-1 truncate">
                      {ticket.title}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>Customer: {ticket.customer}</span>
                      <span>Assignee: {ticket.assignee || 'Unassigned'}</span>
                      <span>{ticket.created}</span>
                    </div>
                  </div>
                </div>
              ))}
              {recentTickets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <TicketIcon className="w-12 h-12 mx-auto mb-4" />
                  <p>No tickets yet</p>
                  <p className="text-sm">Create your first ticket to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUpIcon className="w-5 h-5 mr-2 text-brand-primary" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg. Response Time</span>
              <span className="text-sm font-medium">2.4 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Resolution Rate</span>
              <span className="text-sm font-medium">89%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
              <span className="text-sm font-medium">4.8/5.0</span>
            </div>
            <div className="pt-2 border-t">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/org/${slug}/dashboard/analytics`}>
                  View Full Report
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}