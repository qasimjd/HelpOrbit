"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Building, ArrowRight, Loader2, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CreateOrganizationDialog } from '@/components/auth/create-organization-dialog'
import { searchOrganizations } from '@/server/actions/organization-actions'
import Image from 'next/image'

interface OrganizationResult {
  id: string
  slug: string
  name: string
  domain?: string
  logoUrl?: string
  primaryColor: string
  isPublic: boolean
}

interface OrganizationFinderProps {
  onOrganizationSelect?: (org: OrganizationResult) => void
  className?: string
  autoCreate?: boolean // Whether to auto-open create dialog for authenticated users
}

export function OrganizationFinder({ onOrganizationSelect, className, autoCreate }: OrganizationFinderProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<OrganizationResult | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [organizations, setOrganizations] = useState<OrganizationResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Auto-open create dialog if autoCreate is true and user comes from auth flow
  React.useEffect(() => {
    if (autoCreate) {
      setShowCreateDialog(true)
    }
  }, [autoCreate])

  // Fetch organizations based on search term
  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setOrganizations([])
      return
    }

    setSearchLoading(true)
    try {
      const results = await searchOrganizations(term)
      // Fix type compatibility
      const formattedResults = results.map(org => ({
        ...org,
        logoUrl: org.logoUrl || undefined
      }))
      setOrganizations(formattedResults)
    } catch (error) {
      console.error('Error searching organizations:', error)
      setOrganizations([])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  // Debounced search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, handleSearch])

  const handleOrganizationSelect = useCallback(async (org: OrganizationResult) => {
    setSelectedOrg(org)
    setIsLoading(true)

    try {
      // In real app, this would validate the organization and set session/context
      if (onOrganizationSelect) {
        onOrganizationSelect(org)
      } else {
        // Navigate to organization login
        router.push(`/org/${org.slug}/login`)
      }
    } catch (error) {
      console.error('Failed to select organization:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onOrganizationSelect, router])

  const handleDirectEntry = useCallback(async () => {
    const slug = searchTerm.trim().toLowerCase()
    if (!slug) return

    setIsLoading(true)

    try {
      // In real app, this would validate the slug exists
      router.push(`/org/${slug}/login`)
    } catch (error) {
      console.error('Failed to navigate to organization:', error)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, router])

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Enter organization name or domain..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 transition-colors"
          disabled={isLoading}
        />
      </div>

      {/* Create New Organization Button */}
      <div className="text-center">
        <Button
          onClick={() => setShowCreateDialog(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Organization
        </Button>
      </div>

      {/* Search Results */}
      {searchTerm.trim() && (
        <div className="space-y-3">
          {searchLoading ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
              <p className="text-base text-gray-500 font-medium">Searching organizations...</p>
            </div>
          ) : organizations.length > 0 ? (
            <>
              <h3 className="text-base font-semibold mb-2">
                Select your organization
              </h3>
              <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                {organizations.map((org: OrganizationResult) => (
                  <Card
                    key={org.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg border-2 hover:border",
                      selectedOrg?.id === org.id && `ring-2 ring-${org.primaryColor} border-${org.primaryColor}`
                    )}
                    onClick={() => handleOrganizationSelect(org)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: org.primaryColor }}
                          />
                          <div className="w-10 h-10 relative rounded-full overflow-hidden border">
                            <Image
                              src={org.logoUrl ?? '/logos/helporbit-logo.svg'}
                              alt={org.name + ' logo'}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 leading-tight">
                              {org.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {org.domain || `@${org.slug}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {org.isPublic && (
                            <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                              Public
                            </Badge>
                          )}
                          <ArrowRight className="w-5 h-5 text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-8 space-y-5 bg-blue-50 rounded-xl border border-blue-100">
              <Building className="w-14 h-14 text-blue-300 mb-2" />
              <div className="text-center">
                <h3 className="text-base font-semibold text-blue-700 mb-1">
                  No organizations found
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Can't find your organization? Try entering the exact organization code.
                </p>
                <Button
                  onClick={handleDirectEntry}
                  disabled={isLoading || !searchTerm.trim()}
                  className="btn-brand-primary px-6 py-2 text-base font-semibold rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Continue with "{searchTerm.trim()}"
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={(organization) => {
          // Handle successful organization creation
          console.log('Organization created:', organization);
          // Optionally navigate to the new organization
          if (organization?.slug) {
            router.push(`/org/${organization.slug}/dashboard`);
          }
        }}
      />
    </div>
  )
}