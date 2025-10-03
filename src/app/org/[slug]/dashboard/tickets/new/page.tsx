import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateTicketForm } from '@/components/dashboard/create-ticket-form'
import { getOrganizationBySlug } from '@/server/db/queries'
import { notFound } from 'next/navigation'

interface NewTicketPageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Create New Ticket - HelpOrbit',
  description: 'Create a new support ticket',
}

export default async function NewTicketPage({ params }: NewTicketPageProps) {
  const { slug } = await params
  
  // Get organization data
  const organization = await getOrganizationBySlug(slug)
  
  if (!organization) {
    notFound()
  }

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Ticket</h1>
          <p className="text-muted-foreground mt-1">
            Submit a new support request or issue
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
      />
    </div>
  )
}