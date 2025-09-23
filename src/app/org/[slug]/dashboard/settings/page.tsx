import { OrganizationSettings } from "@/components/auth/organization-settings";
import { useActiveOrganization } from "@/lib/auth-client";

export default function OrganizationSettingsPage({
  params,
}: {
  params: { slug: string };
}) {
  // For now, we'll create a demo organization data structure
  // In a real app, you'd fetch this based on the slug
  const demoOrganization = {
    id: "demo-org-id",
    name: "Demo Organization",
    slug: params.slug,
    logo: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      description: "This is a demo organization for testing"
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization settings and configuration.
          </p>
        </div>
        
        <OrganizationSettings 
          organization={demoOrganization}
          currentUserRole="owner"
        />
      </div>
    </div>
  );
}