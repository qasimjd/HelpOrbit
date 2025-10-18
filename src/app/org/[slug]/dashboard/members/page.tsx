import { MemberManagement } from "@/components/invitation-membar/member-management";
import { InvitationManagement } from "@/components/invitation-membar/invitation-management";
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

  const organization = await getOrganizationBySlug(slug)

  if (!organization) {
    notFound()
  }

  const session = await requireServerSession();

  let initialMembers: MemberData[] = [];
  let initialInvitations: InvitationData[] = [];

  try {
    const [membersResult, invitationsResult] = await Promise.all([
      listMembersAction({ organizationId: organization.id, sortBy: 'createdAt', sortDirection: 'desc', limit: 50 }),
      listInvitationsAction({ organizationId: organization.id, sortBy: 'createdAt', sortDirection: 'desc', limit: 3, }),
    ]);

    if (membersResult.success && membersResult.data) {
      initialMembers = membersResult.data.members;
    }

    if (invitationsResult.success && invitationsResult.data) {
      initialInvitations = invitationsResult.data.invitations;
    }
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    // Error handling will be done on the client side
  }

  const memberPermissions = {
    canManageMembers: true, 
    canRemoveMembers: true,
    canUpdateRoles: true,
    canInviteMembers: true,
  };

  const invitationPermissions = {
    canManageInvitations: true,
    canCancelInvitations: true,
  };

  return (
    <div className="container mx-auto">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members & Invitations</h1>
          <p className="text-muted-foreground">
            Manage organization members and send invitations.
          </p>
        </div>

        {/* Member Management */}
        <MemberManagement
          organizationId={organization.id}
          initialData={initialMembers}
          initialPermissions={memberPermissions}
          currentUserId={session.user.id}
        />

        {/* Invitation Management */}
        <InvitationManagement
          organizationId={organization.id}
          initialData={initialInvitations}
          initialPermissions={invitationPermissions}
        />
      </div>
    </div>
  );
}