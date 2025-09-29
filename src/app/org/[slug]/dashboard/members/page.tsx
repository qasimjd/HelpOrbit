import { MemberManagement } from "@/components/auth/member-management";
import { InvitationManagement } from "@/components/auth/invitation-management";

export default function MembersPage() {
  const organizationId = "demo-org-id"; // In real app, fetch from params.slug
  const currentUserRole = "owner"; // In real app, get from auth context

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members & Invitations</h1>
          <p className="text-muted-foreground">
            Manage organization members and send invitations.
          </p>
        </div>
        
        {/* Member Management */}
        <MemberManagement 
          organizationId={organizationId}
          currentUserRole={currentUserRole}
        />
        
        {/* Invitation Management */}
        <InvitationManagement 
          organizationId={organizationId}
          currentUserRole={currentUserRole}
        />
      </div>
    </div>
  );
}