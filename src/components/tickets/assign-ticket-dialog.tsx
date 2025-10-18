"use client"

import React, { useState, useEffect, memo, useMemo } from 'react'
import { useTransition } from 'react'
import { User, UserCheck, UserX, Search, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { assignTicketAction } from '@/server/actions/ticket-actions'
import { useAssignableMembers, getMemberDisplayName, getMemberInitials, getRoleBadgeColor, invalidateMembersCache } from '@/hooks/use-members'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth-client'
import { useDebounce } from '@/hooks/use-debounce'

interface AssignTicketDialogProps {
  ticketId: string
  organizationId: string
  currentAssigneeId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssignmentChange?: (assigneeId: string | null, assigneeName: string | null) => void
}

export const AssignTicketDialog = memo<AssignTicketDialogProps>(({
  ticketId,
  organizationId,
  currentAssigneeId,
  open,
  onOpenChange,
  onAssignmentChange
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isPending, startTransition] = useTransition()
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(currentAssigneeId || null)
  
  // Get current user session
  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  // Debounce search term to improve performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Use the custom hook to fetch assignable members only when dialog is open
  const { assignableMembers, loading: isLoading, error } = useAssignableMembers(organizationId, open)

  // Show error toast if loading members fails
  useEffect(() => {
    if (error && open) {
      toast.error('Failed to load team members')
    }
  }, [error, open])

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedAssigneeId(currentAssigneeId || null)
      setSearchTerm('')
    }
  }, [open, currentAssigneeId])

  // Filter members based on search term with memoization
  const filteredMembers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return assignableMembers
    
    const searchLower = debouncedSearchTerm.toLowerCase()
    return assignableMembers.filter(member =>
      member.user?.name?.toLowerCase().includes(searchLower) ||
      member.user?.email?.toLowerCase().includes(searchLower)
    )
  }, [assignableMembers, debouncedSearchTerm])

  const handleAssign = async () => {
    startTransition(async () => {
      try {
        const result = await assignTicketAction(ticketId, organizationId, selectedAssigneeId)
        
        if (result.success) {
          const assigneeName = selectedAssigneeId 
            ? assignableMembers.find(m => m.userId === selectedAssigneeId)?.user?.name || 'Unknown'
            : null
          
          // Invalidate the members cache to ensure fresh data
          invalidateMembersCache(organizationId)
          
          toast.success(
            selectedAssigneeId 
              ? `Ticket assigned to ${assigneeName}` 
              : 'Ticket unassigned successfully'
          )
          
          // Notify parent component about the assignment change
          onAssignmentChange?.(selectedAssigneeId, assigneeName)
          onOpenChange(false)
        } else {
          toast.error(result.error || 'Failed to assign ticket')
        }
      } catch (error) {
        console.error('Error assigning ticket:', error)
        toast.error('An error occurred while assigning the ticket')
      }
    })
  }

  // Memoized member item component to prevent unnecessary re-renders
  const MemberItem = memo(({ member }: { member: typeof assignableMembers[0] }) => (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
        selectedAssigneeId === member.userId && "border-brand-primary bg-brand-primary/5"
      )}
      onClick={() => setSelectedAssigneeId(member.userId)}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={member.user?.image} alt={member.user?.name} />
          <AvatarFallback>
            {getMemberInitials(member)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">
              {getMemberDisplayName(member)}
            </p>
            {currentUserId && member.userId === currentUserId && (
              <Badge>
                You
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className={cn("text-xs", getRoleBadgeColor(member.role))}
            >
              {member.role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {member.user?.email}
          </p>
        </div>
      </div>
      {selectedAssigneeId === member.userId && (
        <div className="w-2 h-2 rounded-full bg-brand-primary" />
      )}
    </div>
  ))
  
  MemberItem.displayName = 'MemberItem'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Assign Ticket
          </DialogTitle>
          <DialogDescription>
            Select a team member to assign this ticket to, or unassign it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>

          {/* Unassign Option */}
          <div 
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
              selectedAssigneeId === null && "border-brand-primary bg-brand-primary/5"
            )}
            onClick={() => setSelectedAssigneeId(null)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <UserX className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="font-medium">Unassigned</p>
                <p className="text-sm text-muted-foreground">Remove current assignee</p>
              </div>
            </div>
            {selectedAssigneeId === null && (
              <div className="w-2 h-2 rounded-full bg-brand-primary" />
            )}
          </div>

          <Separator />

          {/* Members List */}
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading team members...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchTerm ? 'No members found matching your search.' : 'No assignable members found.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <MemberItem key={member.id} member={member} />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={isPending || isLoading}
              className="btn-brand-primary min-w-[100px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                selectedAssigneeId ? 'Assign' : 'Unassign'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

AssignTicketDialog.displayName = 'AssignTicketDialog'