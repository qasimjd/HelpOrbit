"use client"

import React, { useState, useCallback, useMemo, createContext, useContext } from 'react'
import { User, Clock, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatRelativeDate } from '@/lib/ticket-utils'
import UserAvatar from '@/components/sheard/user-avatar'
import { useAssignableMembers } from '@/hooks/use-members'
import type { TicketWithDetails, TicketStatus } from '@/types'

interface AssigneeData {
    id: string
    name: string
    email: string
    image: string | null
    role?: string
}

// Context for managing ticket updates
interface TicketContextType {
    currentAssigneeId: string | null
    currentStatus: TicketStatus
    updateAssignee: (assigneeId: string | null, assigneeName: string | null) => void
    updateStatus: (status: TicketStatus) => void
}

const TicketContext = createContext<TicketContextType | null>(null)

export const useTicketAssignee = () => {
    const context = useContext(TicketContext)
    if (!context) {
        throw new Error('useTicketAssignee must be used within TicketAssigneeProvider')
    }
    return context
}

export const useTicketStatus = () => {
    const context = useContext(TicketContext)
    if (!context) {
        throw new Error('useTicketStatus must be used within TicketAssigneeProvider')
    }
    return context
}

// Provider component
interface TicketAssigneeProviderProps {
    children: React.ReactNode
    initialAssigneeId: string | null
    initialStatus: TicketStatus
}

export function TicketAssigneeProvider({ children, initialAssigneeId, initialStatus }: TicketAssigneeProviderProps) {
    const [currentAssigneeId, setCurrentAssigneeId] = useState<string | null>(initialAssigneeId)
    const [currentStatus, setCurrentStatus] = useState<TicketStatus>(initialStatus)

    const updateAssignee = useCallback((assigneeId: string | null) => {
        setCurrentAssigneeId(assigneeId)
    }, [])

    const updateStatus = useCallback((status: TicketStatus) => {
        setCurrentStatus(status)
    }, [])

    return (
        <TicketContext.Provider value={{ currentAssigneeId, currentStatus, updateAssignee, updateStatus }}>
            {children}
        </TicketContext.Provider>
    )
}

// Sidebar component that uses the context
interface TicketDetailsSidebarProps {
    slug: string
    ticket: TicketWithDetails
    organizationId: string
}

export default function TicketDetailsSidebar({
    ticket,
    organizationId
}: TicketDetailsSidebarProps) {
    const { currentAssigneeId } = useTicketAssignee()

    // Fetch assignable members to get updated assignee info
    const { assignableMembers } = useAssignableMembers(organizationId, true)

    // Find current assignee from members list or fallback to ticket data
    const currentAssignee: AssigneeData | null = useMemo(() => {
        if (!currentAssigneeId) return null

        // Try to find from members list first (most up-to-date)
        const memberAssignee = assignableMembers.find(member => member.userId === currentAssigneeId)
        if (memberAssignee?.user) {
            return {
                id: memberAssignee.userId,
                name: memberAssignee.user.name,
                email: memberAssignee.user.email,
                image: memberAssignee.user.image || null,
                role: memberAssignee.role
            }
        }

        // Fallback to original ticket data
        if (ticket.assignee && ticket.assignee.userId === currentAssigneeId) {
            return {
                id: ticket.assignee.userId,
                name: ticket.assignee.name ?? '',
                email: ticket.assignee.email ?? '',
                image: ticket.assignee.image ?? null,
                role: ticket.assignee.role
            }
        }

        return null
    }, [currentAssigneeId, assignableMembers, ticket.assignee])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Requester
                    </span>
                    <div className="font-medium flex items-center gap-2">
                        <UserAvatar size={24} user={ticket.requester} showRole />
                        <p>{ticket.requester?.name}</p>
                    </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Assignee
                    </span>
                    {currentAssignee ? (
                        <div className="font-medium flex items-center gap-2">
                            <UserAvatar size={24} user={currentAssignee} />
                            <p>{currentAssignee.name}</p>
                        </div>
                    ) : (
                        <span className="font-medium">Unassigned</span>
                    )}
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Created
                    </span>
                    <span className="font-medium">
                        {formatDate(ticket.createdAt)}
                    </span>
                </div>

                {ticket.updatedAt && ticket.createdAt && new Date(ticket.updatedAt).getTime() !== new Date(ticket.createdAt).getTime() && (
                    <>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Updated
                            </span>
                            <span className="font-medium">
                                {formatRelativeDate(ticket.updatedAt)}
                            </span>
                        </div>
                    </>
                )}

                {ticket.resolvedAt && (
                    <>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Resolved
                            </span>
                            <span className="font-medium">
                                {formatDate(ticket.resolvedAt)}
                            </span>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}