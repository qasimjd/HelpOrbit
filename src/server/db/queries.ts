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
/* eslint-disable @typescript-eslint/no-explicit-any */
import { and, desc, eq, or, count, asc } from "drizzle-orm"
import { parseTags, stringifyTags } from '@/lib/ticket-utils';

// Organization queries
export async function getOrganizations() {
  return await db.select().from(organization);
}

export async function getOrganizationBySlug(slug: string) {
  const result = await db.select().from(organization).where(eq(organization.slug, slug)).limit(1);
  return result[0] || null;
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

// Ticket queries
export async function getTicketsByOrganization(organizationId: string) {
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
    .where(eq(ticket.organizationId, organizationId))
    .orderBy(desc(ticket.createdAt));

  // Parse tags from JSON string or comma-separated string to array
  return results.map(ticket => ({
    ...ticket,
    tags: parseTags(ticket.tags)
  }));
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

// Dashboard statistics
export async function getTicketStats(organizationId: string) {
  try {
    console.log('Fetching ticket stats for organization:', organizationId)
    
    // Validate organization ID
    if (!organizationId || organizationId.trim() === '') {
      throw new Error('Organization ID is required')
    }

    const [
      openTickets,
      inProgressTickets,
      resolvedToday,
      urgentTickets
    ] = await Promise.all([
      db.select({ count: count() }).from(ticket).where(and(
        eq(ticket.organizationId, organizationId),
        eq(ticket.status, 'open')
      )),
      db.select({ count: count() }).from(ticket).where(and(
        eq(ticket.organizationId, organizationId),
        eq(ticket.status, 'in_progress')
      )),
      db.select({ count: count() }).from(ticket).where(and(
        eq(ticket.organizationId, organizationId),
        eq(ticket.status, 'resolved')
        // TODO: Add date filter for today
      )),
      db.select({ count: count() }).from(ticket).where(and(
        eq(ticket.organizationId, organizationId),
        eq(ticket.priority, 'urgent'),
        or(eq(ticket.status, 'open'), eq(ticket.status, 'in_progress'))
      ))
    ]);

    const stats = {
      openTickets: openTickets[0]?.count || 0,
      inProgressTickets: inProgressTickets[0]?.count || 0,
      resolvedToday: resolvedToday[0]?.count || 0,
      urgentTickets: urgentTickets[0]?.count || 0,
    };

    console.log('Ticket stats result:', stats)
    return stats
  } catch (error) {
    console.error('Error in getTicketStats:', error)
    console.error('Organization ID:', organizationId)
    throw error
  }
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

// User queries
export async function getUserById(userId: string) {
  const result = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  return result[0] || null;
}

export async function getUserByEmail(email: string) {
  const result = await db.select().from(user).where(eq(user.email, email)).limit(1);
  return result[0] || null;
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

export async function getUserOrganizations(userId: string) {
  return await db
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
    .orderBy(asc(member.createdAt));
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
  const updateData: any = { updatedAt: new Date() }
  
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