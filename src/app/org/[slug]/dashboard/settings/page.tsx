import { OrganizationSettings } from "@/components/auth/organization-settings";
import { getOrganizationBySlug } from "@/server/db/queries";
import { notFound } from "next/navigation";
import type { OrganizationData } from "@/types/auth-organization";

export default async function OrganizationSettingsPage({
  params,
}: {
  params: { slug: string };
}) {

  const organization = await getOrganizationBySlug(params.slug);

  if (!organization) return notFound();

  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization settings and configuration.
          </p>
        </div>
        
        <OrganizationSettings 
          organization={organization as OrganizationData}
          currentUserRole="owner"
        />
      </div>
    </div>
  );
}