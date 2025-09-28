"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ArrowRight, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { searchOrganizations } from '@/server/actions/organization-actions'
import Image from 'next/image'
import { Loading } from '@/components/sheard/loading'

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
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, handleSearch])



  const handleOrganizationSelect = useCallback(async (org: OrganizationResult) => {
    setIsLoading(true)
    try {
      if (onOrganizationSelect) {
        onOrganizationSelect(org)
      } else {
        router.push(`/org/${org.slug}/login`)
      }
    } catch (error) {
      console.error('Failed to select organization:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onOrganizationSelect, router])


  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Enter organization name or domain..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-3 text-lg border-2 transition-colors"
          disabled={isLoading}
        />
      </div>

      {/* Create New Organization Button */}
      {!searchTerm.trim() && (
        <Link href="/org">
          <Button
            variant="outline"
            className="flex items-center gap-2 w-full"
          >
            <Plus className="w-4 h-4" />
            Create New Organization
          </Button>
        </Link>
      )}

      {/* Search Results */}
      {searchTerm.trim() && (
        <div className="space-y-3">
          {searchLoading ? (
            <div className="flex flex-col items-center py-8">
              <Loading text="Searching organizations..." />
            </div>
          ) : organizations.length > 0 ? (
            <>
              <h3 className="text-base font-semibold mb-2 text-foreground">
                Select your organization
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {organizations.map((org: OrganizationResult) => (
                  <Card
                    key={org.id}
                    className="cursor-pointer transition-all shadow-xl border hover:shadow-lg rounded-2xl"
                    onClick={() => handleOrganizationSelect(org)}
                  >
                    <CardContent className="px-4 py-2 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 relative rounded-full overflow-hidden border">
                            <Image
                              src={org.logoUrl ?? '/logos/helporbit-logo.svg'}
                              alt={org.name + ' logo'}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground leading-tight">
                              {org.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {org.domain || `@${org.slug}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {org.isPublic && (
                            <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full">
                              Public
                            </Badge>
                          )}
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-8 space-y-5 bg-muted/50 rounded-xl border">
              <div className="text-center">
                <h3 className="text-base font-semibold text-foreground mb-1">
                  No organizations found
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Can't find your organization? Try entering the exact organization code.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}