import React, { useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn, getInitials, getUserRoleColor } from "@/lib/utils"
import { OrganizationData, MemberRole } from "@/types/auth-organization"
import { CreateOrganizationCard } from "@/components/auth/create-organization-card"
import Link from "next/link"

interface UserOrganization extends OrganizationData {
  role: MemberRole
  joinedAt: Date
}

interface OrganizationSelectionProps {
  organizations: UserOrganization[]
  onOrganizationSelect?: (org: UserOrganization) => void
  className?: string
  showCreateButton?: boolean
}

export function OrganizationSelection({
  organizations,
  className,
  showCreateButton = true,
}: OrganizationSelectionProps) {

  const maxReached = organizations.length >= 5

  const titleText = useMemo(
    () =>
      organizations.length > 0
        ? "Choose an Organization"
        : "No Organizations Found",
    [organizations.length]
  )

  const subtitleText = useMemo(
    () =>
      organizations.length > 0
        ? "Select one to continue"
        : "Create a new organization to get started",
    [organizations.length]
  )

  const createButtonText = useMemo(
    () =>
      organizations.length === 0
        ? "Create Organization"
        : "Add another organization",
    [organizations.length]
  )

  return (
    <div className={cn("w-full mx-auto px-4", className)}>
      <div className="space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{titleText}</h1>
          <p className="text-sm text-muted-foreground">{subtitleText}</p>
        </div>

        {/* Organizations + Create Card */}
        <div className="flex flex-wrap w-fit mx-auto justify-center gap-6">
          {organizations.map((org) => {
            const metadata = org.metadata || {}

            return (
              <Link
                href={`/org/${org.slug}/dashboard`}
                key={org.id}
                className={cn(
                  "bg-card p-6 cursor-pointer transition-all border shadow-md hover:shadow-lg rounded-2xl flex-shrink-0 w-56",
                )}
              >
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={org.logo} />
                    <AvatarFallback>{getInitials(org.name)}</AvatarFallback>
                  </Avatar>

                  <div className="text-center space-y-1">
                    <h3 className="font-semibold text-lg text-foreground">
                      {org.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {metadata.domain || `@${org.slug}`}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-2 py-0.5",
                      getUserRoleColor(org.role)
                    )}
                  >
                    {org.role}
                  </Badge>
                </div>
              </Link>
            )
          })}

          {/* Add/Create Organization Card */}
          {showCreateButton && (
            <CreateOrganizationCard 
              createButtonText={createButtonText}
              maxReached={maxReached}
            />
          )}
        </div>
      </div>
    </div>
  )
}
