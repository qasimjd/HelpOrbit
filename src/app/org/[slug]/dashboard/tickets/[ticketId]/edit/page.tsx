import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateTicketForm } from '@/components/dashboard/create-ticket-form'
import { getOrganizationBySlug } from '@/server/db/queries'
import { getUserRoleAction } from '@/server/actions/user-actions'
import { notFound } from 'next/navigation'

interface EditTicketPageProps {
  params: Promise<{ slug: string; ticketId: string }>
}

export const metadata: Metadata = {
  title: 'Edit Ticket - HelpOrbit',
  description: 'Edit an existing support ticket',
}

export default async function EditTicketPage({ params }: EditTicketPageProps) {
  const { slug, ticketId } = await params
  
  // Get organization data
  const organization = await getOrganizationBySlug(slug)
  
  if (!organization) {
    notFound()
  }

  // Get user role
  const res = await getUserRoleAction(organization.id)
  const userRole = res.data

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Ticket</h1>
          <p className="text-muted-foreground mt-1">
            Edit details for ticket #{ticketId}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/org/${slug}/dashboard/tickets`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Link>
        </Button>
      </div>

      {/* Form */}
      <CreateTicketForm 
        organizationSlug={slug} 
        organizationId={organization.id}
        userRole={userRole}
        ticketId={ticketId}
      />
    </div>
  )
}