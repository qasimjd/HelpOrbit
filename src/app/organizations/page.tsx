import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { OrganizationSelection } from '@/components/auth/organization-selection'
import { BrandedLogo } from '@/components/branding/branded-logo'
import { getServerSession } from '@/lib/session'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Organizations - HelpOrbit',
  description: 'Select your organization to continue',
}

export default async function OrganizationsPage() {
  // Check if user is authenticated
  const session = await getServerSession()

  if (!session?.user) {
    // Redirect to auth if not authenticated
    redirect('/auth?intent=organizations')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        {/* Logo */}
        <div className="mb-8">
          <BrandedLogo />
        </div>

        {/* Organization Selection */}
        <OrganizationSelection className="w-full max-w-md" />

        {/* Additional Options */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Looking for a specific organization?
          </p>
          <Link href="/select-organization?mode=finder">
            <Button variant="link" className="text-sm">
              Search organizations
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Need help? <a href="/support" className="text-primary hover:underline">Contact support</a>
          </p>
          <div className="flex justify-center space-x-6 text-xs">
            <Link href="/about" className="text-muted-foreground hover:underline">
              About HelpOrbit
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}