import { db } from './index';
import { 
  user, 
  organization, 
  member, 
  invitation,
  ticket,
  ticketComment,
  ticketAttachment
} from './schema';
import { and, desc, eq, count, asc, inArray, gte, lte } from "drizzle-orm"
import { parseTags, stringifyTags } from '@/lib/ticket-utils';
import type { 
  User, 
  Organization, 
  UserRole, 
  TicketWithDetails, 
  TicketStats, 
  TicketFilters 
} from '@/types';

// User queries
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  
  return result[0] || null;
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  
  return result[0] || null;
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const results = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      metadata: organization.metadata,
      role: member.role,
      joinedAt: member.createdAt,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId))
    .orderBy(asc(organization.name));

  return results.map(org => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    logo: org.logo || undefined,
    metadata: org.metadata ? (typeof org.metadata === 'string' ? JSON.parse(org.metadata) : org.metadata) : undefined,
    role: org.role,
    joinedAt: org.joinedAt,
  }));
}

export async function getUserRole(userId: string, organizationId: string): Promise<UserRole | null> {
  const result = await db
    .select({
      role: member.role,
    })
    .from(member)
    .where(and(
      eq(member.userId, userId),
      eq(member.organizationId, organizationId)
    ))
    .limit(1);

  return result[0]?.role as UserRole || null;
}

export async function updateUserProfile(
  userId: string, 
  updates: { name?: string; image?: string }
): Promise<User> {
  const result = await db
    .update(user)
    .set(updates)
    .where(eq(user.id, userId))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    });

  return result[0];
}

// Organization queries
export async function getOrganizations(): Promise<Organization[]> {
  const results = await db.select().from(organization);
  return results.map(org => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    logo: org.logo || undefined,
    metadata: org.metadata ? (typeof org.metadata === 'string' ? JSON.parse(org.metadata) : org.metadata) : undefined,
  }));
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const result = await db
    .select()
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1);
  
  if (!result[0]) return null;
  
  return {
    id: result[0].id,
    name: result[0].name,
    slug: result[0].slug,
    logo: result[0].logo || undefined,
    metadata: result[0].metadata ? (typeof result[0].metadata === 'string' ? JSON.parse(result[0].metadata) : result[0].metadata) : undefined,
  };
}

export async function getOrganizationMembers(organizationId: string) {
  return await db
    .select({
      id: member.id,
      role: member.role,
      createdAt: member.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        lastActiveAt: user.lastActiveAt,
      }
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, organizationId))
    .orderBy(asc(member.createdAt));
}

// Ticket queries with filtering support
export async function getTicketsByOrganization(
  organizationId: string, 
  filters?: TicketFilters
): Promise<TicketWithDetails[]> {
  // Build where conditions
  const whereConditions = [eq(ticket.organizationId, organizationId)];
  
  if (filters) {
    // Filter by status
    if (filters.status && filters.status.length > 0) {
      whereConditions.push(inArray(ticket.status, filters.status));
    }
    
    // Filter by priority
    if (filters.priority && filters.priority.length > 0) {
      whereConditions.push(inArray(ticket.priority, filters.priority));
    }
    
    // Filter by assignee
    if (filters.assigneeId) {
      whereConditions.push(eq(ticket.assigneeId, filters.assigneeId));
    }
    
    // Filter by requester
    if (filters.requesterId) {
      whereConditions.push(eq(ticket.requesterId, filters.requesterId));
    }
    
    // Search filtering is handled in post-processing to avoid type issues
    
    // Filter by date range
    if (filters.dateRange) {
      if (filters.dateRange.from) {
        whereConditions.push(gte(ticket.createdAt, filters.dateRange.from));
      }
      if (filters.dateRange.to) {
        whereConditions.push(lte(ticket.createdAt, filters.dateRange.to));
      }
    }
  }

  // Execute the query
  const results = await db
    .select({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      tags: ticket.tags,
      organizationId: ticket.organizationId,
      requesterId: ticket.requesterId,
      assigneeId: ticket.assigneeId,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      resolvedAt: ticket.resolvedAt,
      requester: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      assignee: {
        id: member.id,
        userId: member.userId,
        role: member.role,
      }
    })
    .from(ticket)
    .leftJoin(user, eq(ticket.requesterId, user.id))
    .leftJoin(member, eq(ticket.assigneeId, member.id))
    .where(and(...whereConditions))
    .orderBy(desc(ticket.createdAt));

  // Parse tags and ensure proper typing
  let processedResults = results.map(ticketData => ({
    ...ticketData,
    tags: parseTags(ticketData.tags),
    assignee: ticketData.assignee?.id ? {
      id: ticketData.assignee.id,
      userId: ticketData.assignee.userId,
      role: ticketData.assignee.role,
    } : null,
  })) as TicketWithDetails[];

  // Filter by tags (post-processing since tags are stored as JSON/string)
  if (filters?.tags && filters.tags.length > 0) {
    processedResults = processedResults.filter(ticket => {
      if (!ticket.tags || ticket.tags.length === 0) return false;
      return filters.tags!.some(filterTag => 
        ticket.tags!.some(ticketTag => 
          ticketTag.toLowerCase().includes(filterTag.toLowerCase())
        )
      );
    });
  }

  // Handle search in description (post-processing)
  if (filters?.search) {
    processedResults = processedResults.filter(ticket => {
      const searchTerm = filters.search!.toLowerCase();
      return ticket.title.toLowerCase().includes(searchTerm) ||
             (ticket.description && ticket.description.toLowerCase().includes(searchTerm));
    });
  }

  // Handle pagination manually
  if (filters?.offset) {
    processedResults = processedResults.slice(filters.offset);
  }
  if (filters?.limit) {
    processedResults = processedResults.slice(0, filters.limit);
  }

  return processedResults;
}

export async function getTicketStats(organizationId: string): Promise<TicketStats> {
  const [totalResult, openResult, inProgressResult, resolvedResult] = await Promise.all([
    // Total count
    db
      .select({ count: count() })
      .from(ticket)
      .where(eq(ticket.organizationId, organizationId)),
    
    // Open count
    db
      .select({ count: count() })
      .from(ticket)
      .where(and(
        eq(ticket.organizationId, organizationId),
        eq(ticket.status, 'open')
      )),
    
    // In progress count
    db
      .select({ count: count() })
      .from(ticket)
      .where(and(
        eq(ticket.organizationId, organizationId),
        eq(ticket.status, 'in_progress')
      )),
    
    // Resolved count
    db
      .select({ count: count() })
      .from(ticket)
      .where(and(
        eq(ticket.organizationId, organizationId),
        eq(ticket.status, 'resolved')
      ))
  ]);

  return {
    total: totalResult[0].count,
    open: openResult[0].count,
    inProgress: inProgressResult[0].count,
    resolved: resolvedResult[0].count,
  };
}

export async function getTicketById(ticketId: string, organizationId: string) {
  const result = await db
    .select({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      tags: ticket.tags,
      organizationId: ticket.organizationId,
      requesterId: ticket.requesterId,
      assigneeId: ticket.assigneeId,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      resolvedAt: ticket.resolvedAt,
      requester: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      assignee: {
        id: member.id,
        userId: member.userId,
        role: member.role,
      }
    })
    .from(ticket)
    .leftJoin(user, eq(ticket.requesterId, user.id))
    .leftJoin(member, eq(ticket.assigneeId, member.id))
    .where(and(eq(ticket.id, ticketId), eq(ticket.organizationId, organizationId)))
    .limit(1);
  
  const ticketData = result[0];
  if (!ticketData) return null;

  // Parse tags from JSON string or comma-separated string to array
  return {
    ...ticketData,
    tags: parseTags(ticketData.tags)
  };
}

export async function getTicketComments(ticketId: string) {
  return await db
    .select({
      id: ticketComment.id,
      content: ticketComment.content,
      isInternal: ticketComment.isInternal,
      createdAt: ticketComment.createdAt,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      }
    })
    .from(ticketComment)
    .innerJoin(user, eq(ticketComment.authorId, user.id))
    .where(eq(ticketComment.ticketId, ticketId))
    .orderBy(asc(ticketComment.createdAt));
}

export async function getTicketAttachments(ticketId: string) {
  return await db
    .select()
    .from(ticketAttachment)
    .where(eq(ticketAttachment.ticketId, ticketId))
    .orderBy(asc(ticketAttachment.uploadedAt));
}



export async function getRecentTickets(organizationId: string, limit = 5) {
  return await db
    .select({
      id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      tags: ticket.tags,
      createdAt: ticket.createdAt,
      requester: {
        name: user.name,
        email: user.email,
      },
      assignee: {
        id: member.id,
        userId: member.userId,
      }
    })
    .from(ticket)
    .leftJoin(user, eq(ticket.requesterId, user.id))
    .leftJoin(member, eq(ticket.assigneeId, member.id))
    .where(eq(ticket.organizationId, organizationId))
    .orderBy(desc(ticket.createdAt))
    .limit(limit);
}

// Member queries
export async function getMemberByUserAndOrg(userId: string, organizationId: string) {
  const result = await db
    .select()
    .from(member)
    .where(and(
      eq(member.userId, userId),
      eq(member.organizationId, organizationId)
    ))
    .limit(1);
  
  return result[0] || null;
}

// Invitation queries
export async function getInvitations(organizationId: string) {
  return await db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      inviter: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    })
    .from(invitation)
    .innerJoin(member, eq(invitation.inviterId, member.id))
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(invitation.organizationId, organizationId))
    .orderBy(desc(invitation.createdAt));
}

// Ticket mutations
export async function createTicket(ticketData: {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  organizationId: string
  requesterId: string
  assigneeId?: string | null
  tags?: string[] | null
}) {
  const result = await db
    .insert(ticket)
    .values({
      id: ticketData.id,
      title: ticketData.title,
      description: ticketData.description,
      status: ticketData.status,
      priority: ticketData.priority,
      organizationId: ticketData.organizationId,
      requesterId: ticketData.requesterId,
      assigneeId: ticketData.assigneeId || null,
      tags: stringifyTags(ticketData.tags),
    })
    .returning()

  return result[0]
}

export async function updateTicket(
  ticketId: string, 
  organizationId: string,
  updates: {
    title?: string
    description?: string
    status?: 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    assigneeId?: string | null
    tags?: string[] | null
    resolvedAt?: Date | null
  }
) {
  const updateData: {
    updatedAt: Date
    title?: string
    description?: string
    status?: 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    assigneeId?: string | null
    tags?: string | null
    resolvedAt?: Date | null
  } = { updatedAt: new Date() }
  
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.priority !== undefined) updateData.priority = updates.priority
  if (updates.assigneeId !== undefined) updateData.assigneeId = updates.assigneeId
  if (updates.tags !== undefined) updateData.tags = stringifyTags(updates.tags)
  if (updates.resolvedAt !== undefined) updateData.resolvedAt = updates.resolvedAt

  const result = await db
    .update(ticket)
    .set(updateData)
    .where(and(
      eq(ticket.id, ticketId),
      eq(ticket.organizationId, organizationId)
    ))
    .returning()

  return result[0] || null
}

export async function deleteTicket(ticketId: string, organizationId: string) {
  const result = await db
    .delete(ticket)
    .where(and(
      eq(ticket.id, ticketId),
      eq(ticket.organizationId, organizationId)
    ))
    .returning()

  return result.length > 0
}