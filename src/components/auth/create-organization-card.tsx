"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { CreateOrganizationDialog } from "@/components/auth/create-organization-dialog"

interface CreateOrganizationCardProps {
    createButtonText: string
    maxReached: boolean
}

export function CreateOrganizationCard({ createButtonText, maxReached }: CreateOrganizationCardProps) {
    const router = useRouter()
    const [showCreateDialog, setShowCreateDialog] = useState(false)

    const handleCreateOrganization = () => {
        if (!maxReached) {
            setShowCreateDialog(true)
        }
    }

    return (
        <>
            <Card
                onClick={handleCreateOrganization}
                className={`p-6 transition-all border rounded-2xl shadow-md flex items-center justify-center text-center flex-shrink-0 w-56 mr-auto ${
                    maxReached
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:shadow-lg"
                }`}
                tabIndex={maxReached ? -1 : 0}
                aria-disabled={maxReached}
            >
                <div className="flex flex-col items-center space-y-3">
                    <div className="h-16 w-16 flex bg-primary/5 items-center justify-center rounded-full border border-dashed border-muted-foreground/30">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground">
                        {maxReached ? "Maximum reached" : createButtonText}
                    </h3>
                </div>
            </Card>

            {/* Create Organization Dialog */}
            <CreateOrganizationDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={() => {
                    router.refresh()
                }}
            />
        </>
    )
}