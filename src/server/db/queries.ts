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
import { eq, and, desc, asc, count, or } from 'drizzle-orm';

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
  return await db
    .select({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      tags: ticket.tags,
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
  
  return result[0] || null;
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

  return {
    openTickets: openTickets[0].count,
    inProgressTickets: inProgressTickets[0].count,
    resolvedToday: resolvedToday[0].count,
    urgentTickets: urgentTickets[0].count,
  };
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