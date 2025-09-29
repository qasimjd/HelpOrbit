"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession, useListOrganizations } from '@/lib/auth-client'
import type { 
  User, 
  Organization, 
  UserContextValue, 
  UserRole, 
  OrganizationPermissions 
} from '@/types'

const UserContext = createContext<UserContextValue | null>(null)

interface UserProviderProps {
  children: ReactNode
  initialOrganizationSlug?: string
}

function UserProviderContent({ children, initialOrganizationSlug }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrganization, setCurrentOrgState] = useState<Organization | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Use Better Auth hooks
  const { data: sessionData, isPending: sessionPending } = useSession()
  const { data: organizationsData, isPending: orgsPending, error: orgsError } = useListOrganizations()

  const isLoading = sessionPending || orgsPending

  // Update user data when session changes
  useEffect(() => {
    if (!sessionPending && sessionData?.user) {
      setUser({
        id: sessionData.user.id,
        name: sessionData.user.name,
        email: sessionData.user.email,
        image: sessionData.user.image,
        emailVerified: sessionData.user.emailVerified,
        createdAt: sessionData.user.createdAt ? new Date(sessionData.user.createdAt) : undefined,
      })
    } else if (!sessionPending && !sessionData?.user) {
      setUser(null)
    }
  }, [sessionData, sessionPending])

  // Update organizations when data changes
  useEffect(() => {
    if (!orgsPending && organizationsData) {
      const orgsData: Organization[] = organizationsData.map((org: { id: string; name: string; slug: string; logo?: string; role: string; metadata?: unknown }) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo,
        metadata: org.metadata
      }))
      
      setOrganizations(orgsData)
      
      // Set current organization based on initialOrganizationSlug or first org
      if (initialOrganizationSlug) {
        const foundOrg = orgsData.find(org => org.slug === initialOrganizationSlug)
        if (foundOrg) {
          setCurrentOrgState(foundOrg)
        } else if (orgsData.length > 0) {
          setCurrentOrgState(orgsData[0])
        }
      } else if (orgsData.length > 0) {
        setCurrentOrgState(orgsData[0])
      }
    } else if (!orgsPending && !organizationsData) {
      setOrganizations([])
      setCurrentOrgState(null)
    }
  }, [organizationsData, orgsPending, initialOrganizationSlug])

  // Handle errors
  useEffect(() => {
    if (orgsError) {
      console.error('Error fetching organizations:', orgsError)
      setError('Failed to fetch organizations')
    } else {
      setError(null)
    }
  }, [orgsError])

  // Debug logging
  useEffect(() => {
    console.log('UserProvider Debug:', {
      sessionPending,
      orgsPending,
      hasUser: !!sessionData?.user,
      userEmail: sessionData?.user?.email,
      orgsCount: organizationsData?.length || 0,
      currentOrg: currentOrganization?.slug,
      error: error || orgsError
    })
  }, [sessionPending, orgsPending, sessionData, organizationsData, currentOrganization, error, orgsError])

  // Clear data when user logs out
  useEffect(() => {
    if (!sessionPending && !sessionData?.user) {
      setUser(null)
      setOrganizations([])
      setCurrentOrgState(null)
      setError(null)
    }
  }, [sessionData, sessionPending])

  const refreshUser = async () => {
    // The hooks will automatically refresh when called
    // We don't need to manually refetch since the hooks handle it
    console.log('User context refresh requested - hooks will handle automatic updates')
  }

  const setCurrentOrganization = (org: Organization) => {
    setCurrentOrgState(org)
  }

  const value: UserContextValue = {
    user,
    currentOrganization,
    organizations,
    isLoading,
    error,
    refreshUser,
    setCurrentOrganization,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function UserProvider({ children, initialOrganizationSlug }: UserProviderProps) {
  return (
    <UserProviderContent initialOrganizationSlug={initialOrganizationSlug}>
      {children}
    </UserProviderContent>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Hook for getting current organization data
export function useCurrentOrganization() {
  const { currentOrganization } = useUser()
  return currentOrganization
}

// Hook for checking if user has specific role in current organization
export function useUserRole(): UserRole | null {
  const { user, currentOrganization } = useUser()
  
  // In a real app, you'd fetch the user's role for the current organization
  // For now, return a default role based on demo data
  if (!user || !currentOrganization) {
    return null
  }
  
  // This would typically come from your membership/role data
  return 'admin' // Default role for demo
}

// Hook for organization permissions
export function useOrganizationPermissions(): OrganizationPermissions {
  const role = useUserRole()
  
  return {
    canManageUsers: role === 'owner' || role === 'admin',
    canManageSettings: role === 'owner' || role === 'admin', 
    canCreateTickets: true, // All users can create tickets
    canManageTickets: role === 'owner' || role === 'admin',
    canDeleteOrganization: role === 'owner',
  }
}