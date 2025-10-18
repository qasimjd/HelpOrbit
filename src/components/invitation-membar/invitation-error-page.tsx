import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getInitials, cn, getRoleColorWithDarkMode } from '@/lib/utils'
import {
  AlertCircle,
  Clock,
  XCircle,
  Users,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  LogIn
} from 'lucide-react'
import type { InvitationData, MemberRole } from '@/types/auth-organization'
import type { Session } from '@/lib/auth'

interface InvitationError {
  type: 'not-found' | 'expired' | 'already-processed' | 'wrong-user' | 'needs-login'
  title: string
  message: string
  action: {
    label: string
    href: string
  }
  secondaryAction?: {
    label: string
    href: string
  }
}

interface InvitationErrorPageProps {
  organizationSlug: string
  invitation?: InvitationData
  session?: Session | null
  error: InvitationError
}

const errorIcons = {
  'not-found': AlertCircle,
  'expired': Clock,
  'already-processed': XCircle,
  'wrong-user': UserX,
  'needs-login': LogIn
}

const errorColors = {
  'not-found': 'text-red-600 dark:text-red-400',
  'expired': 'text-amber-600 dark:text-amber-400',
  'already-processed': 'text-blue-600 dark:text-blue-400',
  'wrong-user': 'text-orange-600 dark:text-orange-400',
  'needs-login': 'text-blue-600 dark:text-blue-400'
}

export function InvitationErrorPage({
  invitation,
  session,
  error
}: InvitationErrorPageProps) {
  const IconComponent = errorIcons[error.type]
  const iconColor = errorColors[error.type]

  return (
    <div className="min-h-screen bg-background flex-1 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <IconComponent className={cn("w-8 h-8", iconColor)} />
            </div>
            <CardTitle className="text-xl">{error.title}</CardTitle>
            <CardDescription className="text-base">
              {error.message}
            </CardDescription>
          </CardHeader>

          {/* Show invitation details if available */}
          {invitation && (
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="size-16 mx-auto mb-4 shadow-lg rounded-lg backdrop-blur-xl">
                    <AvatarImage src={invitation.organization?.logo} alt={invitation.organization?.name} />
                    <AvatarFallback className="text-lg">
                      {getInitials(invitation.organization?.name || 'Org')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{invitation.organization?.name}</p>
                    <p className="text-sm text-muted-foreground">Organization</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Invited Email</p>
                      <p className="font-medium truncate">{invitation.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Role</p>
                      <Badge className={cn("text-xs", getRoleColorWithDarkMode(invitation.role as MemberRole))}>
                        {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Expires</p>
                      <p className={cn(
                        "font-medium text-xs",
                        new Date(invitation.expiresAt) < new Date() && "text-red-500"
                      )}>
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium text-xs capitalize">{invitation.status}</p>
                    </div>
                  </div>
                </div>

                {invitation.inviter && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
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
                      <p className="text-xs text-muted-foreground">Invited you to join</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Current user info for wrong-user case */}
              {error.type === 'wrong-user' && session && (
                <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                  <UserX className="w-4 h-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    <div className="space-y-2">
                      <p className="font-medium">Currently signed in as:</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={session.user.image || undefined} alt={session.user.name || session.user.email} />
                          <AvatarFallback className="text-xs">
                            {getInitials(session.user.name || session.user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{session.user.name || session.user.email}</span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Login prompt for needs-login case */}
              {error.type === 'needs-login' && (
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                  <LogIn className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <div className="space-y-2">
                      <p className="font-medium">Sign in required</p>
                      <p className="text-sm">
                        Please sign in with <strong>{invitation.email}</strong> to accept this invitation.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          )}

          <CardFooter className="flex gap-3">
            <Button asChild className="flex-1">
              <Link href={error.action.href}>
                {error.action.label}
              </Link>
            </Button>

            {error.secondaryAction && (
              <Button asChild variant="outline" className="flex-1">
                <Link href={error.secondaryAction.href}>
                  {error.secondaryAction.label}
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}