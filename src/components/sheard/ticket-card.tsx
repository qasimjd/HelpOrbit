import React from 'react'
import {
    getStatusColor,
    getPriorityColor,
    formatDate,
    formatStatusText,
    formatPriorityText,
    formatTypeText,
    getTypeColor
} from '@/lib/ticket-utils'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { TicketWithDetails } from '@/types'
import { CalendarIcon } from 'lucide-react'
import UserAvatar from './user-avatar'


const TicketCard = ({ ticket, slug }: { ticket: TicketWithDetails, slug: string }) => {
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
                            <Badge
                                variant="secondary"
                                className={getTypeColor(ticket.type)}
                            >
                                {formatTypeText(ticket.type)}
                            </Badge>
                        </div>

                        <h3 className="font-medium mb-3 w-fit hover:text-brand-primary">
                            <Link href={`/org/${slug}/dashboard/tickets/${ticket.id}`}>
                                {ticket.title}
                            </Link>
                        </h3>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <UserAvatar user={ticket.requester} />
                                <span>Requester</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UserAvatar user={ticket.assignee ? {
                                    id: ticket.assignee.id,
                                    name: ticket.assignee.name ?? '',
                                    email: ticket.assignee.email ?? '',
                                    image: ticket.assignee.image ?? null,
                                    role: ticket.assignee.role
                                } : undefined} />
                                <span>{ticket.assignee?.name ?? 'Unassigned'}</span>
                            </div>
                            <div className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                {formatDate(ticket.createdAt)}
                            </div>
                        </div>

                        {/* Tags */}
                        {ticket.tags && ticket.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-4">
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
                            <UserAvatar size={44} user={ticket.assignee ? {
                                id: ticket.assignee.id,
                                name: ticket.assignee.name ?? '',
                                email: ticket.assignee.email ?? '',
                                image: ticket.assignee.image ?? null,
                                role: ticket.assignee.role
                            } : undefined} />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default TicketCard
