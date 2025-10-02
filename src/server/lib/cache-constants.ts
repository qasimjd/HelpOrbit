/**
 * Central cache tag management for the application
 */
export const CACHE_TAGS = {
  // User related
  USER: {
    profile: (userId: string) => `user:${userId}`,
    organizations: (userId: string) => `user-organizations:${userId}`,
    role: (userId: string, orgId: string) => `user-role:${userId}:${orgId}`,
  },
  
  // Organization related  
  ORGANIZATION: {
    all: 'organizations',
    byId: (orgId: string) => `organization:${orgId}`,
    bySlug: (slug: string) => `organization-slug:${slug}`,
    members: (orgId: string) => `organization-members:${orgId}`,
    settings: (orgId: string) => `organization-settings:${orgId}`,
  },
  
  // Ticket related
  TICKET: {
    all: 'all-tickets',
    byId: (ticketId: string) => `ticket:${ticketId}`,
    byOrganization: (orgId: string) => `tickets:${orgId}`,
    byAssignee: (assigneeId: string) => `assignee-tickets:${assigneeId}`,
    byRequester: (requesterId: string) => `requester-tickets:${requesterId}`,
    stats: (orgId: string) => `ticket-stats:${orgId}`,
    recent: (orgId: string) => `recent-tickets:${orgId}`,
  },
  
  // Member related
  MEMBER: {
    byUser: (userId: string, orgId: string) => `member:${userId}:${orgId}`,
    byOrganization: (orgId: string) => `members:${orgId}`,
    invitations: (orgId: string) => `member-invitations:${orgId}`,
  },
  
  // Invitation related
  INVITATION: {
    byOrganization: (orgId: string) => `invitations:${orgId}`,
  }
} as const

/**
 * Cache configuration presets
 */
export const CACHE_CONFIG = {
  // No cache for real-time data
  NONE: {
    revalidate: 0,
  },
  
  // Short cache for frequently changing data
  SHORT: {
    revalidate: 60, // 1 minute
  },
  
  // Medium cache for moderately changing data  
  MEDIUM: {
    revalidate: 300, // 5 minutes
  },
  
  // Long cache for rarely changing data
  LONG: {
    revalidate: 3600, // 1 hour
  },
  
  // Static cache for data that rarely changes
  STATIC: {
    revalidate: 86400, // 24 hours
  }
} as const