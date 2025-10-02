'use server'

import { revalidateTag, revalidatePath } from 'next/cache'
import { CACHE_TAGS } from './cache-constants'

/**
 * Revalidate all cache tags related to a user
 */
export async function revalidateUserCache(userId: string): Promise<void> {
  revalidateTag(CACHE_TAGS.USER.profile(userId))
  revalidateTag(CACHE_TAGS.USER.organizations(userId))
  
  // We don't know all organizations, so we'll revalidate the general org cache
  revalidateTag(CACHE_TAGS.ORGANIZATION.all)
}

/**
 * Revalidate all cache tags related to an organization
 */
export async function revalidateOrganizationCache(organizationId: string, slug?: string): Promise<void> {
  revalidateTag(CACHE_TAGS.ORGANIZATION.byId(organizationId))
  revalidateTag(CACHE_TAGS.ORGANIZATION.members(organizationId))
  revalidateTag(CACHE_TAGS.ORGANIZATION.all)
  
  if (slug) {
    revalidateTag(CACHE_TAGS.ORGANIZATION.bySlug(slug))
  }
  
  // Also revalidate tickets and members for this org
  revalidateTag(CACHE_TAGS.TICKET.byOrganization(organizationId))
  revalidateTag(CACHE_TAGS.TICKET.stats(organizationId))
  revalidateTag(CACHE_TAGS.MEMBER.byOrganization(organizationId))
  revalidateTag(CACHE_TAGS.INVITATION.byOrganization(organizationId))
}

/**
 * Revalidate all cache tags related to tickets in an organization
 */
export async function revalidateTicketCache(organizationId: string, ticketId?: string): Promise<void> {
  revalidateTag(CACHE_TAGS.TICKET.byOrganization(organizationId))
  revalidateTag(CACHE_TAGS.TICKET.stats(organizationId))
  revalidateTag(CACHE_TAGS.TICKET.all)
  
  if (ticketId) {
    revalidateTag(CACHE_TAGS.TICKET.byId(ticketId))
  }
}

/**
 * Revalidate all cache tags related to members in an organization
 */
export async function revalidateMemberCache(organizationId: string, userId?: string): Promise<void> {
  revalidateTag(CACHE_TAGS.MEMBER.byOrganization(organizationId))
  revalidateTag(CACHE_TAGS.ORGANIZATION.members(organizationId))
  
  if (userId) {
    revalidateTag(CACHE_TAGS.MEMBER.byUser(userId, organizationId))
    revalidateTag(CACHE_TAGS.USER.organizations(userId))
    // Revalidate user role cache for all orgs (we don't know which ones)
    revalidateTag(CACHE_TAGS.USER.role(userId, organizationId))
  }
}

/**
 * Revalidate paths commonly used in the application
 */
export async function revalidateCommonPaths(organizationSlug?: string): Promise<void> {
  // Dashboard pages
  if (organizationSlug) {
    revalidatePath(`/org/${organizationSlug}`)
    revalidatePath(`/org/${organizationSlug}/dashboard`)
    revalidatePath(`/org/${organizationSlug}/dashboard/tickets`)
    revalidatePath(`/org/${organizationSlug}/dashboard/members`)
    revalidatePath(`/org/${organizationSlug}/dashboard/settings`)
  }
  
  // General pages
  revalidatePath('/select-organization')
  revalidatePath('/org/[slug]', 'page')
  revalidatePath('/org/[slug]/dashboard', 'page') 
  revalidatePath('/org/[slug]/dashboard/tickets', 'page')
}

/**
 * Complete cache invalidation for major changes (use sparingly)
 */
export async function revalidateAllCache(): Promise<void> {
  revalidateTag(CACHE_TAGS.USER.profile('*'))
  revalidateTag(CACHE_TAGS.ORGANIZATION.all)
  revalidateTag(CACHE_TAGS.TICKET.all)
  revalidatePath('/', 'layout')
}

