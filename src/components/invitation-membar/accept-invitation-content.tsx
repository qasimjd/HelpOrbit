"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { acceptInvitationAction, rejectInvitationAction } from '@/server/actions/invitation-actions'
import { getInitials, cn, getRoleColorWithDarkMode, getUserRoleColor, userRoleIcons } from '@/lib/utils'
import { CheckCircle, AlertCircle, Mail, Calendar, UserCheck, Loader2, PartyPopper } from 'lucide-react'
import type { InvitationData, MemberRole } from '@/types/auth-organization'
import type { Session } from '@/lib/auth'
import { formatDate } from '@/lib/ticket-utils'

interface AcceptInvitationContentProps {
  invitation: InvitationData
  organizationSlug: string
  session: Session
}

export function AcceptInvitationContent({ invitation, organizationSlug, session }: AcceptInvitationContentProps) {
  const [processing, setProcessing] = useState(false)
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const router = useRouter()

  const handleAcceptInvitation = async () => {
    try {
      setProcessing(true)
      setActionResult(null)

      const result = await acceptInvitationAction(invitation.id)

      if (result.success) {
        setActionResult({
          type: 'success',
          message: 'Welcome to the team! You have successfully joined the organization. Redirecting to your dashboard...'
        })

        // Redirect to organization dashboard after a short delay
        setTimeout(() => {
          router.push(`/org/${organizationSlug}/dashboard`)
        }, 2500)
      } else {
        setActionResult({
          type: 'error',
          message: result.error || 'Unable to accept invitation. Please try again or contact support.'
        })
      }
    } catch (err) {
      setActionResult({
        type: 'error',
        message: 'Something went wrong while processing your request. Please try again.'
      })
      console.error('Error accepting invitation:', err)
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectInvitation = async () => {
    try {
      setProcessing(true)
      setActionResult(null)

      const result = await rejectInvitationAction(invitation.id)

      if (result.success) {
        setActionResult({
          type: 'success',
          message: 'Invitation declined successfully. You can now close this page.'
        })
      } else {
        setActionResult({
          type: 'error',
          message: result.error || 'Unable to decline invitation. Please try again.'
        })
      }
    } catch (err) {
      setActionResult({
        type: 'error',
        message: 'Something went wrong while processing your request. Please try again.'
      })
      console.error('Error rejecting invitation:', err)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex-1 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto">
        <Card className='shadow-xl backdrop-blur-xl'>
          <CardHeader className="text-center">
            <Avatar className="size-16 mx-auto mb-4 shadow-lg rounded-lg backdrop-blur-xl">
              <AvatarImage src={invitation.organization?.logo} alt={invitation.organization?.name} />
              <AvatarFallback className="text-lg">
                {getInitials(invitation.organization?.name || 'Org')}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">Join Your Team</CardTitle>
            <CardDescription>
              You&apos;ve been invited to join <strong>{invitation.organization?.name}</strong> as a{' '}
              <Badge className={cn("mx-1", getRoleColorWithDarkMode(invitation.role as MemberRole))}>
                {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
              </Badge>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Invitation Details Grid */}
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email</span>
                </div>
                <span className="font-medium truncate max-w-48 text-right">{invitation.email}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Role</span>
                </div>
                <Badge
                  variant="outline"
                  className={`${getUserRoleColor(invitation.role)} flex items-center gap-1`}
                >
                  {userRoleIcons[invitation.role] && React.createElement(userRoleIcons[invitation.role], { className: "w-4 h-4" })}
                  {invitation.role}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expires</span>
                </div>
                <span className="font-medium text-xs">
                  {formatDate(invitation.expiresAt)}
                </span>
              </div>
            </div>

            {/* Inviter Information */}
            {invitation.inviter && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={invitation.inviter.user?.image} alt={invitation.inviter.user?.name} />
                  <AvatarFallback className="text-xs">
                    {getInitials(invitation.inviter.user?.name || invitation.inviter.user?.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {invitation.inviter.user?.name || invitation.inviter.user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">invited you to join the team</p>
                </div>
              </div>
            )}

            {/* Current User Confirmation */}
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <Avatar className="w-8 h-8">
                <AvatarImage src={session.user.image || undefined} alt={session.user.name || session.user.email} />
                <AvatarFallback className="text-xs">
                  {getInitials(session.user.name || session.user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user.name || session.user.email}
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">Signed in and ready to join</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>

            {/* Action Result Alert */}
            {actionResult && (
              <Alert className={cn(
                actionResult.type === 'success'
                  ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800'
                  : 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800'
              )}>
                <div className="flex items-center gap-2">
                  {actionResult.type === 'success'
                    ? <PartyPopper className="w-4 h-4 text-green-600" />
                    : <AlertCircle className="w-4 h-4 text-red-600" />
                  }
                  <AlertDescription className={cn(
                    actionResult.type === 'success'
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  )}>
                    {actionResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button
              onClick={handleAcceptInvitation}
              disabled={processing}
              className="flex-1"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining Team...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept & Join Team
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleRejectInvitation}
              disabled={processing}
              size="lg"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Decline'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}