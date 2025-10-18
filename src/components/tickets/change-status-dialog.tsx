"use client"

import React, { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, AlertCircle, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { changeTicketStatusAction } from '@/server/actions/ticket-actions'
import { formatStatusText, getStatusColor } from '@/lib/ticket-utils'
import type { TicketStatus } from '@/types/ticket'

interface ChangeStatusDialogProps {
    ticketId: string
    organizationId: string
    currentStatus: TicketStatus
    open: boolean
    onOpenChange: (open: boolean) => void
    onStatusChange?: (newStatus: TicketStatus) => void
}

const statusOptions: { value: TicketStatus; label: string; description: string }[] = [
    {
        value: 'open',
        label: 'Open',
        description: 'Ticket is new and awaiting attention'
    },
    {
        value: 'in_progress',
        label: 'In Progress',
        description: 'Work has started on this ticket'
    },
    {
        value: 'waiting_for_customer',
        label: 'Waiting for Customer',
        description: 'Awaiting response or information from customer'
    },
    {
        value: 'resolved',
        label: 'Resolved',
        description: 'Issue has been fixed and is ready for review'
    },
    {
        value: 'closed',
        label: 'Closed',
        description: 'Ticket is complete and closed'
    }
]

export function ChangeStatusDialog({
    ticketId,
    organizationId,
    currentStatus,
    open,
    onOpenChange,
    onStatusChange
}: ChangeStatusDialogProps) {
    const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(currentStatus)
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const router = useRouter()

    // Reset selected status when current status changes or dialog opens
    useEffect(() => {
        setSelectedStatus(currentStatus)
    }, [currentStatus, open])

    const handleStatusChange = () => {
        if (selectedStatus === currentStatus) {
            onOpenChange(false)
            return
        }

        startTransition(async () => {
            try {
                const result = await changeTicketStatusAction(ticketId, organizationId, selectedStatus)

                if (result.success) {
                    // Update the context state first
                    onStatusChange?.(selectedStatus)
                    
                    toast({
                        title: "Status updated",
                        description: `Ticket status changed to ${formatStatusText(selectedStatus)}`,
                    })
                    
                    onOpenChange(false)
                    
                    // Add a small delay to ensure context state is updated before refresh
                    setTimeout(() => {
                        router.refresh()
                    }, 100)
                } else {
                    toast({
                        title: "Error",
                        description: result.error || "Failed to update ticket status",
                        variant: "destructive",
                    })
                }
            } catch (error) {
                console.error('Error changing ticket status:', error)
                toast({
                    title: "Error",
                    description: "An unexpected error occurred",
                    variant: "destructive",
                })
            }
        })
    }

    const currentStatusOption = statusOptions.find(option => option.value === currentStatus)
    const selectedStatusOption = statusOptions.find(option => option.value === selectedStatus)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Change Ticket Status</DialogTitle>
                    <DialogDescription>
                        Update the status of this ticket to reflect its current state.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Current Status */}
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium">
                            Current Status
                        </label>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={getStatusColor(currentStatus)}>
                                {currentStatusOption?.label}
                            </Badge>
                            <span className="text-sm">
                                {currentStatusOption?.description}
                            </span>
                        </div>
                    </div>

                    {/* New Status Selection */}
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium">
                            New Status
                        </label>
                        <Select
                            value={selectedStatus}
                            onValueChange={(value: TicketStatus) => setSelectedStatus(value)}
                            disabled={isPending}
                        >
                            <SelectTrigger className='p-0 outline-none'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option, idx) => (
                                    <React.Fragment key={option.value}>
                                        <SelectItem value={option.value} className="py-2">
                                            <div className="flex items-start gap-3 w-full">
                                                <Badge
                                                    variant="secondary"
                                                    className={`${getStatusColor(option.value)} text-xs shrink-0`}
                                                >
                                                    {option.label}
                                                </Badge>
                                                <div className="flex-1">
                                                    <div className="text-sm">{option.description}</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        {idx < statusOptions.length - 1 && <Separator />}
                                    </React.Fragment>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Change Preview */}
                    {selectedStatus !== currentStatus && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4 text-blue-500" />
                                <span>
                                    Status will change from{' '}
                                    <Badge variant="secondary" className={`${getStatusColor(currentStatus)} text-xs`}>
                                        {formatStatusText(currentStatus)}
                                    </Badge>{' '}
                                    to{' '}
                                    <Badge variant="secondary" className={`${getStatusColor(selectedStatus)} text-xs`}>
                                        {formatStatusText(selectedStatus)}
                                    </Badge>
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {selectedStatusOption?.description}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleStatusChange}
                        disabled={isPending || selectedStatus === currentStatus}
                        className='btn-brand-primary'
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Update Status
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}