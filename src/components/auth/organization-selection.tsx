"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn, getInitials, getRoleColor } from '@/lib/utils'
import { CreateOrganizationDialog } from '@/components/auth/create-organization-dialog'
import { AuthPromptDialog } from '@/components/auth/auth-prompt-dialog'
import { listUserOrganizationsAction } from '@/server/actions/organization-actions'
import { useSession } from '@/lib/auth-client'
import { OrganizationData, MemberRole } from '@/types/auth-organization'

interface UserOrganization extends OrganizationData {
    role: MemberRole
    joinedAt: Date
}

interface OrganizationSelectionProps {
    onOrganizationSelect?: (org: UserOrganization) => void
    className?: string
    showCreateButton?: boolean
}

export function OrganizationSelection({
    onOrganizationSelect,
    className,
    showCreateButton = true
}: OrganizationSelectionProps) {
    const router = useRouter()
    const [organizations, setOrganizations] = useState<UserOrganization[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showAuthPrompt, setShowAuthPrompt] = useState(false)
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

    const { data: session, isPending } = useSession()
    const isAuthenticated = !!session?.user

    useEffect(() => {
        async function fetchOrganizations() {
            if (!isAuthenticated || isPending) {
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                const result = await listUserOrganizationsAction()
                if (result.success && result.data) {
                    const userOrgs: UserOrganization[] = result.data.map(orgMember => ({
                        id: orgMember.id,
                        name: orgMember.name,
                        slug: orgMember.slug,
                        logo: orgMember.logo,
                        metadata: orgMember.metadata ? JSON.parse(orgMember.metadata) : {},
                        createdAt: new Date(orgMember.joinedAt),
                        updatedAt: new Date(orgMember.joinedAt),
                        role: orgMember.role as MemberRole,
                        joinedAt: new Date(orgMember.joinedAt)
                    }))
                    setOrganizations(userOrgs)
                } else {
                    setOrganizations([])
                }
            } catch (error) {
                console.error('Error fetching organizations:', error)
                setOrganizations([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrganizations()
    }, [isAuthenticated, isPending])

    const handleOrganizationSelect = (org: UserOrganization) => {
        setSelectedOrgId(org.id)
        if (onOrganizationSelect) {
            onOrganizationSelect(org)
        } else {
            router.push(`/org/${org.slug}/dashboard`)
        }
    }

    const handleCreateOrganization = () => {
        if (!isAuthenticated) {
            setShowAuthPrompt(true)
            return
        }
        setShowCreateDialog(true)
    }


    return (
        <div className={cn("w-full max-w-4xl mx-auto px-4", className)}>
            <div className="space-y-6">
                {/* Title */}
                <div className="text-center">
                    <h1 className="text-2xl font-semibold">{organizations.length > 0 ? "Choose an Organization" : "No Organizations Found"}</h1>
                    <p className="text-sm text-muted-foreground">{organizations.length > 0 ? "Select one to continue" : "Create a new organization to get started"}</p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                )}

                {/* Organizations + Create Card (centered, responsive) */}
                {!isLoading && (
                    <div className="flex flex-wrap w-fit mx-auto justify-center gap-6">
                        {organizations.map(org => {
                            const isSelected = selectedOrgId === org.id
                            const metadata = org.metadata || {}

                            return (
                                <Card
                                    key={org.id}
                                    onClick={() => handleOrganizationSelect(org)}
                                    className={cn(
                                        "p-6 cursor-pointer transition-all border hover:shadow-lg rounded-2xl flex-shrink-0 w-56",
                                        isSelected && "ring-2 ring-primary shadow-md"
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
                                            className={cn("text-xs px-2 py-0.5", getRoleColor(org.role))}
                                        >
                                            {org.role}
                                        </Badge>
                                    </div>
                                </Card>
                            )
                        })}

                        {/* Add/Create Organization Card */}
                        {showCreateButton && (
                            <Card
                                onClick={handleCreateOrganization}
                                className="p-6 cursor-pointer transition-all border hover:shadow-lg rounded-2xl flex items-center justify-center text-center flex-shrink-0 w-56 mx-auto"
                            >
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="h-16 w-16 flex bg-primary/5 items-center justify-center rounded-full border border-dashed border-muted-foreground/30">
                                        <Plus className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg text-foreground">
                                        {organizations.length === 0
                                            ? 'Create Organization'
                                            : 'Add another organization'}
                                    </h3>
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <CreateOrganizationDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={(organization) => {
                    if (organization?.slug) {
                        router.push(`/org/${organization.slug}/dashboard`)
                    }
                }}
            />

            <AuthPromptDialog
                open={showAuthPrompt}
                onOpenChange={setShowAuthPrompt}
                action="create-organization"
            />
        </div>
    )
}
