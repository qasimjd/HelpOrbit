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
}

export function OrganizationFinder({ onOrganizationSelect, className }: OrganizationFinderProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<OrganizationResult | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [organizations, setOrganizations] = useState<OrganizationResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

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
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Searching organizations...</p>
            </div>
          ) : organizations.length > 0 ? (
            <>
              <h3 className="text-sm font-medium text-gray-700">
                Select your organization:
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {organizations.map((org: OrganizationResult) => (
                  <Card 
                    key={org.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md border-2 hover:border-gray-300",
                      selectedOrg?.id === org.id && "ring-2 ring-blue-500 border-blue-500"
                    )}
                    onClick={() => handleOrganizationSelect(org)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: org.primaryColor }}
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {org.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {org.domain || `@${org.slug}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {org.isPublic && (
                            <Badge variant="secondary" className="text-xs">
                              Public
                            </Badge>
                          )}
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Building className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  No organizations found
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Can't find your organization? Try entering the exact organization code.
                </p>
                <Button
                  onClick={handleDirectEntry}
                  disabled={isLoading || !searchTerm.trim()}
                  className="btn-brand-primary"
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

      {/* Create Organization Dialog */}
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