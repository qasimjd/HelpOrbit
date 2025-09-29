import React from 'react'
import { Metadata } from 'next'
import { SplitOrganizationLayout } from '@/components/auth/split-organization-layout'
import { OrganizationFinder } from '@/components/auth/organization-finder'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Select Organization - HelpOrbit',
  description: 'Choose your organization to access your support portal',
}

export default function SelectOrganizationPage() {
  return (
    <SplitOrganizationLayout>
      {/* Organization Selection Card */}
      <Card className="border-2 shadow-lg lg:mt-28">
        <CardHeader className="text-center">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Find Your Organization
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your organization name or domain to access your support portal.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <OrganizationFinder />
        </CardContent>
      </Card>

      {/* Footer Links */}
      <div className="text-center mt-6 space-y-2 text-sm text-muted-foreground">
        <p>
          Don&apos;t see your organization? Contact your administrator for access.
        </p>
        <div className="flex justify-center space-x-6">
          <Button variant="link" className="p-0 text-muted-foreground text-xs">
            <Link href="/about">
              About HelpOrbit
            </Link>
          </Button>
          <Button variant="link" className="p-0 text-muted-foreground text-xs">
            <Link href="/privacy">
              Privacy Policy
            </Link>
          </Button>
          <Button variant="link" className="p-0 text-muted-foreground text-xs">
            <Link href="/support">
              Get Help
            </Link>
          </Button>
        </div>
      </div>
    </SplitOrganizationLayout>
  )
}