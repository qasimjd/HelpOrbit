'use server'

import { unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireServerSession } from '@/lib/session'
import { 
  getUserByEmail,
  getUserOrganizations,
  getUserRole,
  updateUserProfile
} from '@/server/db/queries'
import { CACHE_TAGS, CACHE_CONFIG } from '@/server/lib/cache-constants'
import { revalidateUserCache } from '@/server/lib/cache'
import type { ApiResponse, User, Organization, UserRole } from '@/types'

/**
 * Get current user session with caching
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  try {
    const session = await requireServerSession()
    
    const getCachedUser = unstable_cache(
      async () => {
        const user = await getUserByEmail(session.user.email)
        return user
      },
      [`user-${session.user.id}`],
      {
        tags: [CACHE_TAGS.USER.profile(session.user.id)],
        ...CACHE_CONFIG.MEDIUM
      }
    )

    const user = await getCachedUser()

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    return {
      success: true,
      data: user
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return {
      success: false,
      error: 'Failed to get user information'
    }
  }
}

/**
 * Get user's organizations with caching
 */
export async function getUserOrganizationsAction(): Promise<ApiResponse<Organization[]>> {
  try {
    const session = await requireServerSession()
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    const getCachedOrganizations = unstable_cache(
      async () => {
        return await getUserOrganizations(session.user.id)
      },
      [`user-organizations-${session.user.id}`],
      {
        tags: [CACHE_TAGS.USER.organizations(session.user.id), CACHE_TAGS.ORGANIZATION.all],
        ...CACHE_CONFIG.MEDIUM
      }
    )

    const organizations = await getCachedOrganizations()

    return {
      success: true,
      data: organizations
    }
  } catch (error) {
    console.error('Error getting user organizations:', error)
    return {
      success: false,
      error: 'Failed to get organizations'
    }
  }
}

/**
 * Get user's role in a specific organization with caching
 */
export async function getUserRoleAction(organizationId: string): Promise<ApiResponse<UserRole>> {
  try {
    const session = await requireServerSession()
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    const getCachedUserRole = unstable_cache(
      async () => {
        return await getUserRole(session.user.id, organizationId)
      },
      [`user-role-${session.user.id}-${organizationId}`],
      {
        tags: [CACHE_TAGS.USER.role(session.user.id, organizationId)],
        ...CACHE_CONFIG.MEDIUM
      }
    )

    const role = await getCachedUserRole()

    return {
      success: true,
      data: role || undefined
    }
  } catch (error) {
    console.error('Error getting user role:', error)
    return {
      success: false,
      error: 'Failed to get user role'
    }
  }
}

/**
 * Update user profile
 */
export async function updateUserProfileAction(
  userData: { name?: string; image?: string }
): Promise<ApiResponse<User>> {
  try {
    const session = await requireServerSession()
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    const updatedUser = await updateUserProfile(session.user.id, userData)

    // Revalidate user cache
    await revalidateUserCache(session.user.id)

    return {
      success: true,
      data: updatedUser
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return {
      success: false,
      error: 'Failed to update profile'
    }
  }
}

/**
 * Check if user has permission for a specific action in an organization
 */
export async function checkUserPermission(
  organizationId: string, 
  permission: 'manage_users' | 'manage_settings' | 'create_tickets' | 'manage_tickets' | 'delete_organization'
): Promise<boolean> {
  try {
    const roleResponse = await getUserRoleAction(organizationId)
    
    if (!roleResponse.success || !roleResponse.data) {
      return false
    }

    const role = roleResponse.data

    switch (permission) {
      case 'manage_users':
      case 'manage_settings':
      case 'manage_tickets':
        return role === 'owner' || role === 'admin'
      case 'delete_organization':
        return role === 'owner'
      case 'create_tickets':
        return true // All members can create tickets
      default:
        return false
    }
  } catch (error) {
    console.error('Error checking user permission:', error)
    return false
  }
}

/**
 * Require user to be authenticated and optionally check organization access
 */
export async function requireUserAccess(organizationId?: string): Promise<{ userId: string; organizationId?: string }> {
  const session = await requireServerSession()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  if (organizationId) {
    // Check if user has access to the organization
    const roleResponse = await getUserRoleAction(organizationId)
    if (!roleResponse.success) {
      redirect('/select-organization')
    }
  }

  return {
    userId: session.user.id,
    organizationId
  }
}

