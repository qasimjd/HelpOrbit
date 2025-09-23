import React from 'react'
import { Metadata } from 'next'
import { SplitOrganizationLayout } from '@/components/auth/split-organization-layout'
import { OrganizationFinder } from '@/components/auth/organization-finder'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { LogoWithText } from '@/components/branding/branded-logo'

export const metadata: Metadata = {
  title: 'Select Organization - HelpOrbit',
  description: 'Choose your organization to access your support portal',
}

export default function SelectOrganizationPage() {
  return (
    <SplitOrganizationLayout>
      {/* <div className="relative z-10 max-w-md">
        Logo and Organization Info
        <div className="mb-8">
          <div className="space-y-6">
            <LogoWithText
              size="md"
              orientation="horizontal"
              showTagline={true}
              className="items-center"
            />
          </div>
        </div>
      </div> */}
      {/* Organization Selection Card */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="text-center pb-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Find Your Organization
          </h1>
          <p className="text-gray-600">
            Enter your organization name or domain to access your support portal.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <OrganizationFinder />
        </CardContent>
      </Card>

      {/* Footer Links */}
      <div className="text-center mt-8 space-y-4 text-sm text-gray-500">
        <p>
          Don't see your organization? Contact your administrator for access.
        </p>
        <div className="flex justify-center space-x-6">
          <a href="/about" className="link-brand hover:text-blue-600">
            About HelpOrbit
          </a>
          <a href="/privacy" className="link-brand hover:text-blue-600">
            Privacy Policy
          </a>
          <a href="/support" className="link-brand hover:text-blue-600">
            Get Help
          </a>
        </div>
      </div>
    </SplitOrganizationLayout>
  )
}