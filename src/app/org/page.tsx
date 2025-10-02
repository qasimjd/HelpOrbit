import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getServerSession } from '@/lib/session'
import { OrganizationSelection } from '@/components/auth/organization-selection'
import { BrandedLogo } from '@/components/branding/branded-logo'
import { SwitchOrganizationButton } from '@/components/auth/switch-organization-button'
import { EmailNotVerifiedAlert } from '@/components/auth/email-not-verified-alert'
import { listUserOrganizationsAction } from '@/server/actions/organization-actions'
import { MemberRole, OrganizationData } from '@/types/auth-organization'
import { LogoutButton } from '@/components/auth/logout-button'

export const metadata: Metadata = {
  title: 'Create Organization - HelpOrbit',
  description: 'Create a new organization to get started with HelpOrbit',
}

interface UserOrganization extends OrganizationData {
  role: MemberRole
  joinedAt: Date
}

export default async function OrgPage() {
  const session = await getServerSession()
  const user = session?.user

  if (!user) {
    redirect('/login?from=org')
  }

  // Fetch organizations server-side
  let organizations: UserOrganization[] = []

  if (user.emailVerified) {
    try {
      const result = await listUserOrganizationsAction()
      if (result.success && result.data) {
        organizations = result.data.map((orgMember) => ({
          id: orgMember.id,
          name: orgMember.name,
          slug: orgMember.slug,
          logo: orgMember.logo,
          metadata: orgMember.metadata || {},
          createdAt: new Date(orgMember.joinedAt),
          updatedAt: new Date(orgMember.joinedAt),
          role: orgMember.role as MemberRole,
          joinedAt: new Date(orgMember.joinedAt),
        }))
      }
    } catch (error) {
      console.error("Error fetching organizations:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center space-y-8 py-12">
        <BrandedLogo size="lg" helpOrbit />

        {user.emailVerified ? (
          <div className="w-full">
            <OrganizationSelection organizations={organizations} />
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            <EmailNotVerifiedAlert userEmail={user.email} />
          </div>
        )}

        <div className="w-full text-center mt-6">
          <p className="text-sm text-muted-foreground mb-2">
            Looking for a different organization?
          </p>
          <SwitchOrganizationButton>Back to find organization</SwitchOrganizationButton>
          <div className="flex items-center justify-center mx-auto my-4">
            <span className="h-px flex-1 bg-muted-foreground/30" />
            <span className="px-3 text-xs text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-muted-foreground/30" />
          </div>
          <div className="text-xs text-muted-foreground">
            <LogoutButton variant="outline" className="hover:text-destructive" afterLogoutRedirect="/login" />
          </div>
        </div>
        </div>
      </div>
  )
}
