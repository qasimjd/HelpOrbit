import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateTicketForm } from '@/components/dashboard/create-ticket-form'

interface NewTicketPageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Create New Ticket - HelpOrbit',
  description: 'Create a new support ticket',
}

export default async function NewTicketPage({ params }: NewTicketPageProps) {
  const { slug } = await params

  return (
    <div className="p-6 mx-auto space-y-6">
      {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Ticket</h1>
          <p className="text-gray-600 mt-1">
            Submit a new support request or issue
          </p>
        </div>

      {/* Form */}
      <CreateTicketForm organizationSlug={slug} />
    </div>
  )
}