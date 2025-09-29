import React from 'react'
import {
  getStatusColor,
  getPriorityColor,
  formatTicketDate,
  formatStatusText,
  formatPriorityText
} from '@/lib/ticket-utils'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { TicketWithDetails } from '@/types'
import { CalendarIcon, ClockIcon, UserIcon } from 'lucide-react'


const TicketCard = ({ticket, slug}: {ticket: TicketWithDetails, slug: string}) => {
    return (
        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardContent className="py-1 px-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                            <Link
                                href={`/org/${slug}/dashboard/tickets/${ticket.id}`}
                                className="text-lg font-semibold text-foreground hover:text-brand-primary"
                            >
                                #{ticket.id}
                            </Link>
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
                        </div>

                        <h3 className="text-gray-900 font-medium mb-3 hover:text-brand-primary">
                            <Link href={`/org/${slug}/dashboard/tickets/${ticket.id}`}>
                                {ticket.title}
                            </Link>
                        </h3>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center">
                                <UserIcon className="w-4 h-4 mr-1" />
                                {ticket.requester?.name || 'Unknown User'}
                            </div>
                            <div className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                Assignee: {ticket.assignee ? 'Assigned' : 'Unassigned'}
                            </div>
                            <div className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                Created {formatTicketDate(ticket.createdAt)}
                            </div>
                        </div>

                        {/* Tags */}
                        {ticket.tags && ticket.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                                {ticket.tags.map((tag: string) => (
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
                                AS
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default TicketCard
