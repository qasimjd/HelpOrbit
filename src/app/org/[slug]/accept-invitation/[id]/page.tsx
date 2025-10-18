import React from 'react'
import { Metadata } from 'next'
import { AcceptInvitationContent } from '@/components/invitation-membar/accept-invitation-content'
import { getInvitationAction } from '@/server/actions/invitation-actions'
import { getServerSession } from '@/lib/session'
import { InvitationErrorPage } from '@/components/invitation-membar/invitation-error-page'
import { getOrganizationBySlug } from '@/server/db/queries'
import type { InvitationData, MemberRole, InvitationStatus } from '@/types/auth-organization'

// Type for the raw invitation data returned by the API
interface RawInvitationData {
  id: string
  organizationId: string
  email: string
  role: string
  status: string
  expiresAt: string
  inviterId: string
  organizationName: string
  organizationSlug: string
  inviterEmail: string
  createdAt: string
  updatedAt: string
}

interface AcceptInvitePageProps {
  params: Promise<{ slug: string; id: string }>
}

export const metadata: Metadata = {
  title: 'Accept Invitation | HelpOrbit',
  description: 'Accept your organization invitation to join your team and start collaborating.',
}

export default async function AcceptInvitePage({ params }: AcceptInvitePageProps) {
  const { slug, id } = await params
  
  // Get current session first to check authentication
  const session = await getServerSession()
  
  // If no session, show login required error
  if (!session) {
    return (
      <InvitationErrorPage
        organizationSlug={slug}
        error={{
          type: 'needs-login',
          title: 'Login Required',
          message: 'Please sign in to view and accept this invitation.',
          action: {
            label: 'Login to Continue',
            href: `/login?from=${encodeURIComponent(`/org/${slug}/accept-invitation/${id}`)}`
          }
        }}
      />
    )
  }
  
  // Fetch invitation data on server side
  const invitationResult = await getInvitationAction(id)
  
  // If invitation not found or error, show error page
  if (!invitationResult.success || !invitationResult.data) {
    return (
      <InvitationErrorPage
        organizationSlug={slug}
        error={{
          type: 'not-found',
          title: 'Invitation Not Found',
          message: invitationResult.error || 'The invitation you\'re looking for doesn\'t exist or has expired.',
          action: {
            label: 'Go to Login',
            href: '/login'
          }
        }}
      />
    )
  }

  const rawInvitation = invitationResult.data as unknown as RawInvitationData
  
  // Fetch organization data to get the logo and other details
  const organization = await getOrganizationBySlug(rawInvitation.organizationSlug)
  
  // Transform flat invitation data to expected nested structure  
  const invitation: InvitationData = {
    id: rawInvitation.id,
    email: rawInvitation.email,
    inviterId: rawInvitation.inviterId,
    organizationId: rawInvitation.organizationId,
    role: rawInvitation.role as MemberRole,
    status: rawInvitation.status as InvitationStatus,
    organization: {
      id: rawInvitation.organizationId,
      name: rawInvitation.organizationName,
      slug: rawInvitation.organizationSlug,
      logo: organization?.logo || '', // Use actual organization logo
    },
    inviter: rawInvitation.inviterEmail ? {
      id: rawInvitation.inviterId,
      userId: rawInvitation.inviterId,
      organizationId: rawInvitation.organizationId,
      role: 'admin' as MemberRole,
      createdAt: new Date(rawInvitation.createdAt),
      updatedAt: new Date(rawInvitation.updatedAt),
      user: {
        id: rawInvitation.inviterId,
        email: rawInvitation.inviterEmail,
        name: rawInvitation.inviterEmail, // Use email as name if name not available
        emailVerified: true
      }
    } : undefined,
    expiresAt: new Date(rawInvitation.expiresAt),
    createdAt: new Date(rawInvitation.createdAt),
    updatedAt: new Date(rawInvitation.updatedAt),
  }
  
  // Check if invitation belongs to the correct organization
  if (invitation.organization?.slug !== slug) {
    return (
      <InvitationErrorPage
        organizationSlug={slug}
        error={{
          type: 'not-found',
          title: 'Organization Mismatch',
          message: 'This invitation does not belong to the requested organization.',
          action: {
            label: 'Go to Login',
            href: '/login'
          }
        }}
      />
    )
  }

  // Check various invitation states and user conditions
  const now = new Date()
  const isExpired = new Date(invitation.expiresAt) < now
  const isAlreadyProcessed = invitation.status !== 'pending'
  const isWrongUser = session && invitation.email !== session.user.email

  // Handle expired invitation
  if (isExpired) {
    return (
      <InvitationErrorPage
        organizationSlug={slug}
        invitation={invitation}
        error={{
          type: 'expired',
          title: 'Invitation Expired',
          message: `This invitation expired on ${new Date(invitation.expiresAt).toLocaleDateString()}. Please contact the organization administrator for a new invitation.`,
          action: {
            label: 'Go to Login',
            href: '/login'
          }
        }}
      />
    )
  }

  // Handle already processed invitation
  if (isAlreadyProcessed) {
    const statusMessages = {
      accepted: 'You have already accepted this invitation and should have access to the organization.',
      rejected: 'This invitation was declined and is no longer valid.',
      canceled: 'This invitation has been canceled by the organization administrator.'
    }

    return (
      <InvitationErrorPage
        organizationSlug={slug}
        invitation={invitation}
        error={{
          type: 'already-processed',
          title: `Invitation ${invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}`,
          message: statusMessages[invitation.status as keyof typeof statusMessages] || 'This invitation is no longer active.',
          action: invitation.status === 'accepted' ? {
            label: 'Go to Organization',
            href: `/org/${slug}/dashboard`
          } : {
            label: 'Go to Login',
            href: `/login?from=${encodeURIComponent(`/org/${slug}/accept-invitation/${id}`)}`
          }
        }}
      />
    )
  }

  // Handle wrong user (different email)
  if (isWrongUser) {
    return (
      <InvitationErrorPage
        organizationSlug={slug}
        invitation={invitation}
        session={session}
        error={{
          type: 'wrong-user',
          title: 'Wrong Account',
          message: `This invitation is for ${invitation.email}, but you're signed in as ${session.user.email}. Please sign in with the correct account or sign out and try again.`,
          action: {
            label: `Sign in as ${invitation.email}`,
            href: '/login'
          },
          secondaryAction: {
            label: 'Sign Out',
            href: '/api/auth/sign-out'
          }
        }}
      />
    )
  }

  // All checks passed, show the invitation acceptance component
  return (
    <AcceptInvitationContent 
      invitation={invitation}
      organizationSlug={slug}
      session={session}
    />
  )
}