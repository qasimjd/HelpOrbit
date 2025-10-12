import { MemberManagement } from "@/components/auth/member-management";
import { InvitationManagement } from "@/components/auth/invitation-management";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrganizationBySlug } from "@/server/db/queries";
import { listMembersAction } from "@/server/actions/member-actions";
import { listInvitationsAction } from "@/server/actions/invitation-actions";
import { requireServerSession } from "@/lib/session";
import type { MemberData, InvitationData } from "@/types/auth-organization";


interface TicketsPageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Members - HelpOrbit',
  description: 'Manage organization members and invitations',
}


export default async function MembersPage({ params }: TicketsPageProps) {
  const { slug } = await params

  // Get organization
  const organization = await getOrganizationBySlug(slug)

  if (!organization) {
    notFound()
  }

  // Get current session and check permissions
  const session = await requireServerSession();

  // Fetch initial data server-side - simple approach
  let initialMembers: MemberData[] = [];
  let initialInvitations: InvitationData[] = [];

  try {
    const [membersResult, invitationsResult] = await Promise.all([
      listMembersAction({ organizationId: organization.id, sortBy: 'createdAt', sortDirection: 'desc' }),
      listInvitationsAction({ organizationId: organization.id, sortBy: 'createdAt', sortDirection: 'desc' }),
    ]);

    if (membersResult.success && membersResult.data) {
      initialMembers = membersResult.data.members;
    }

    if (invitationsResult.success && invitationsResult.data) {
      initialInvitations = invitationsResult.data.invitations;
    }
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    // Continue without initial data - components will fetch on client side
  }

  // Simple permission defaults - let client components handle permissions
  const defaultPermissions = {
    canManageMembers: true, // Default to true, real permissions checked on client
    canRemoveMembers: true,
    canUpdateRoles: true,
    canInviteMembers: true,
    canCreateInvitations: true,
    canCancelInvitations: true,
    canManageInvitations: true,
  };

  return (
    <div className="container mx-auto">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members & Invitations</h1>
          <p className="text-muted-foreground">
            Manage organization members and send invitations.
          </p>
        </div>

        {/* Member Management */}
        <MemberManagement
          organizationId={organization.id}
          initialData={initialMembers}
          initialPermissions={defaultPermissions}
          currentUserId={session.user.id}
        />

        {/* Invitation Management */}
        <InvitationManagement
          organizationId={organization.id}
          initialData={initialInvitations}
          initialPermissions={defaultPermissions}
        />
      </div>
    </div>
  );
}