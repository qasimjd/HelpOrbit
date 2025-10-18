import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { listMembersAction } from '@/server/actions/member-actions'
import type { MemberData } from '@/types/auth-organization'

interface UseMembersOptions {
  organizationId?: string
  includeRoles?: string[]
  autoFetch?: boolean
}

interface UseMembersReturn {
  members: MemberData[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getAssignableMembers: () => MemberData[]
  getMemberById: (id: string) => MemberData | undefined
  getMemberByUserId: (userId: string) => MemberData | undefined
}

// Cache for storing members data by organization ID
const membersCache = new Map<string, { 
  data: MemberData[], 
  timestamp: number, 
  expiry: number 
}>()

// Cache TTL (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

// Helper function to check if cache is valid
const isCacheValid = (cacheEntry: { timestamp: number, expiry: number }) => {
  return Date.now() - cacheEntry.timestamp < cacheEntry.expiry
}

// Helper function to get cached data
const getCachedMembers = (organizationId: string): MemberData[] | null => {
  const cached = membersCache.get(organizationId)
  if (cached && isCacheValid(cached)) {
    return cached.data
  }
  return null
}

// Helper function to set cache
const setCachedMembers = (organizationId: string, data: MemberData[]) => {
  membersCache.set(organizationId, {
    data,
    timestamp: Date.now(),
    expiry: CACHE_TTL
  })
}

// Helper function to invalidate cache for an organization
export const invalidateMembersCache = (organizationId: string) => {
  membersCache.delete(organizationId)
}

// Helper function to clear all cache
export const clearMembersCache = () => {
  membersCache.clear()
}

/**
 * Custom hook for fetching and managing organization members
 * Provides utilities for member selection and assignment with caching
 */
export function useMembers({
  organizationId,
  includeRoles = ['member', 'admin', 'owner'],
  autoFetch = true
}: UseMembersOptions = {}): UseMembersReturn {
  const [members, setMembers] = useState<MemberData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Memoize includeRoles to avoid infinite re-renders
  const includeRolesString = JSON.stringify(includeRoles)
  const memoizedIncludeRoles = useMemo(() => includeRoles, [includeRolesString])

  const fetchMembers = useCallback(async (forceRefresh = false) => {
    if (!organizationId) {
      setMembers([])
      return
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = getCachedMembers(organizationId)
      if (cachedData) {
        const filteredMembers = cachedData.filter(member =>
          memoizedIncludeRoles.includes(member.role)
        )
        setMembers(filteredMembers)
        setError(null)
        return
      }
    }

    setLoading(true)
    setError(null)

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const result = await listMembersAction({
        organizationId,
        limit: 100,
        sortBy: 'createdAt',
        sortDirection: 'asc'
      })

      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return
      }

      if (result.success && result.data?.members) {
        // Cache the full member list
        setCachedMembers(organizationId, result.data.members)
        
        // Filter members by included roles
        const filteredMembers = result.data.members.filter(member =>
          memoizedIncludeRoles.includes(member.role)
        )
        setMembers(filteredMembers)
      } else {
        setError(result.error || 'Failed to fetch members')
        setMembers([])
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(errorMessage)
        setMembers([])
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false)
      }
    }
  }, [organizationId, memoizedIncludeRoles])

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && organizationId) {
      fetchMembers()
    }

    // Cleanup function to abort requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [autoFetch, organizationId, fetchMembers])

  // Reset state when organizationId changes
  useEffect(() => {
    if (!organizationId) {
      setMembers([])
      setError(null)
    }
  }, [organizationId])

  // Get members that can be assigned to tickets
  const getAssignableMembers = useCallback(() => {
    return members.filter(member => 
      ['member', 'admin', 'owner'].includes(member.role)
    )
  }, [members])

  // Get member by ID
  const getMemberById = useCallback((id: string) => {
    return members.find(member => member.id === id)
  }, [members])

  // Get member by user ID
  const getMemberByUserId = useCallback((userId: string) => {
    return members.find(member => member.userId === userId)
  }, [members])

  return {
    members,
    loading,
    error,
    refetch: () => fetchMembers(true), // Force refresh when manually refetching
    getAssignableMembers,
    getMemberById,
    getMemberByUserId
  }
}

/**
 * Hook specifically for getting assignable members (for ticket assignment)
 * Optimized with better caching and performance for frequent dialog usage
 */
export function useAssignableMembers(organizationId?: string, shouldFetch = true) {
  const {
    members,
    loading,
    error,
    refetch,
    getMemberById,
    getMemberByUserId
  } = useMembers({
    organizationId,
    includeRoles: ['member', 'admin', 'owner'],
    autoFetch: shouldFetch && !!organizationId
  })

  // Memoize assignable members to prevent unnecessary re-renders
  const assignableMembers = useMemo(() => {
    return members.filter(member => 
      ['member', 'admin', 'owner'].includes(member.role)
    )
  }, [members])

  return {
    assignableMembers,
    loading,
    error,
    refetch,
    getMemberById,
    getMemberByUserId
  }
}

/**
 * Utility function to get member display name with fallback
 */
export function getMemberDisplayName(member: MemberData): string {
  return member.user?.name || member.user?.email || 'Unknown User'
}

/**
 * Utility function to get member initials for avatars
 */
export function getMemberInitials(member: MemberData): string {
  const name = member.user?.name
  if (!name) return 'UN'
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Utility function to get role badge color
 */
export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case 'owner':
      return 'bg-purple-100 text-purple-800 border-purple-300'
    case 'admin':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'member':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'guest':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}