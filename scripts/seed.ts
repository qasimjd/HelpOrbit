import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { 
  user, 
  organization, 
  member, 
  invitation,
  ticket,
  ticketComment,
  ticketAttachment
} from '@/server/db/schema';

const db = drizzle(process.env.DATABASE_URL!);

// Generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (in reverse order due to foreign keys)
    console.log('🧹 Clearing existing data...');
    await db.delete(ticketAttachment);
    await db.delete(ticketComment);
    await db.delete(ticket);
    await db.delete(invitation);
    await db.delete(member);
    await db.delete(organization);
    await db.delete(user);

    // Seed Users
    console.log('👤 Seeding users...');
    const users = [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@acme.com',
        emailVerified: true,
        image: 'https://avatar.vercel.sh/john-doe',
        role: 'admin' as const,
        status: 'active' as const,
        location: 'New York, USA',
        loginCount: 45,
        twoFactorEnabled: true,
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane.smith@acme.com',
        emailVerified: true,
        image: 'https://avatar.vercel.sh/jane-smith',
        role: 'user' as const,
        status: 'active' as const,
        location: 'San Francisco, USA',
        loginCount: 32,
        twoFactorEnabled: false,
      },
      {
        id: 'user-3',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        emailVerified: true,
        image: 'https://avatar.vercel.sh/sarah-wilson',
        role: 'user' as const,
        status: 'active' as const,
        location: 'London, UK',
        loginCount: 12,
        twoFactorEnabled: false,
      },
      {
        id: 'user-4',
        name: 'Mike Johnson',
        email: 'mike@company.com',
        emailVerified: true,
        image: 'https://avatar.vercel.sh/mike-johnson',
        role: 'user' as const,
        status: 'active' as const,
        location: 'Toronto, Canada',
        loginCount: 28,
        twoFactorEnabled: true,
      },
      {
        id: 'user-5',
        name: 'Alex Chen',
        email: 'alex@startup.io',
        emailVerified: true,
        image: 'https://avatar.vercel.sh/alex-chen',
        role: 'user' as const,
        status: 'active' as const,
        location: 'Singapore',
        loginCount: 8,
        twoFactorEnabled: false,
      },
      {
        id: 'user-6',
        name: 'Emma Davis',
        email: 'emma@mobile-user.com',
        emailVerified: true,
        image: 'https://avatar.vercel.sh/emma-davis',
        role: 'user' as const,
        status: 'active' as const,
        location: 'Sydney, Australia',
        loginCount: 18,
        twoFactorEnabled: false,
      },
      {
        id: 'user-7',
        name: 'David Brown',
        email: 'david.brown@techstart.io',
        emailVerified: true,
        image: 'https://avatar.vercel.sh/david-brown',
        role: 'admin' as const,
        status: 'active' as const,
        location: 'Berlin, Germany',
        loginCount: 67,
        twoFactorEnabled: true,
      },
      {
        id: 'user-8',
        name: 'Lisa Martinez',
        email: 'lisa@globalsolutions.com',
        emailVerified: true,
        image: 'https://avatar.vercel.sh/lisa-martinez',
        role: 'user' as const,
        status: 'active' as const,
        location: 'Madrid, Spain',
        loginCount: 23,
        twoFactorEnabled: false,
      },
    ];

    await db.insert(user).values(users);

    // Seed Organizations
    console.log('🏢 Seeding organizations...');
    const organizations = [
      {
        id: 'org-1',
        name: 'ACME Corporation',
        slug: 'acme-corp',
        logo: 'https://avatar.vercel.sh/acme-corp',
        metadata: JSON.stringify({
          domain: 'acme.com',
          primaryColor: '#dc2626',
          isPublic: true,
          industry: 'Technology',
          size: 'Large'
        }),
      },
      {
        id: 'org-2',
        name: 'TechStart Inc',
        slug: 'techstart-inc',
        logo: 'https://avatar.vercel.sh/techstart-inc',
        metadata: JSON.stringify({
          domain: 'techstart.io',
          primaryColor: '#7c3aed',
          isPublic: true,
          industry: 'Software',
          size: 'Medium'
        }),
      },
      {
        id: 'org-3',
        name: 'Global Solutions Ltd',
        slug: 'global-solutions',
        logo: 'https://avatar.vercel.sh/global-solutions',
        metadata: JSON.stringify({
          domain: 'globalsolutions.com',
          primaryColor: '#059669',
          isPublic: true,
          industry: 'Consulting',
          size: 'Large'
        }),
      },
      {
        id: 'org-4',
        name: 'StartupHub',
        slug: 'startuphub',
        logo: 'https://avatar.vercel.sh/startuphub',
        metadata: JSON.stringify({
          domain: 'startuphub.co',
          primaryColor: '#ea580c',
          isPublic: false,
          industry: 'Incubator',
          size: 'Small'
        }),
      },
      {
        id: 'org-5',
        name: 'Qasim Javed Organization',
        slug: 'qasim-javed',
        logo: 'https://avatar.vercel.sh/qasim-javed',
        metadata: JSON.stringify({
          domain: 'qasimjaved.com',
          primaryColor: '#16a34a',
          isPublic: true,
          industry: 'Technology',
          size: 'Medium'
        }),
      },
    ];

    await db.insert(organization).values(organizations);

    // Seed Members
    console.log('👥 Seeding members...');
    const members = [
      {
        id: 'member-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'owner' as const,
      },
      {
        id: 'member-2',
        userId: 'user-2',
        organizationId: 'org-1',
        role: 'admin' as const,
      },
      {
        id: 'member-3',
        userId: 'user-7',
        organizationId: 'org-2',
        role: 'owner' as const,
      },
      {
        id: 'member-4',
        userId: 'user-1',
        organizationId: 'org-2',
        role: 'member' as const,
      },
      {
        id: 'member-5',
        userId: 'user-8',
        organizationId: 'org-3',
        role: 'owner' as const,
      },
      {
        id: 'member-6',
        userId: 'user-2',
        organizationId: 'org-3',
        role: 'admin' as const,
      },
      {
        id: 'member-7',
        userId: 'user-1',
        organizationId: 'org-5', // qasim-javed organization
        role: 'owner' as const,
      },
      {
        id: 'member-8',
        userId: 'user-2',
        organizationId: 'org-5', // qasim-javed organization
        role: 'admin' as const,
      },
    ];

    await db.insert(member).values(members);

    // Seed Invitations
    console.log('✉️ Seeding invitations...');
    const invitations = [
      {
        id: 'inv-1',
        email: 'newuser@example.com',
        inviterId: 'member-1',
        organizationId: 'org-1',
        role: 'member' as const,
        status: 'pending' as const,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        id: 'inv-2',
        email: 'contractor@freelance.com',
        inviterId: 'member-3',
        organizationId: 'org-2',
        role: 'guest' as const,
        status: 'pending' as const,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
    ];

    await db.insert(invitation).values(invitations);

    // Seed Tickets
    console.log('🎫 Seeding tickets...');
    const tickets = [
      {
        id: 'ticket-1234',
        title: 'Login issues with SSO authentication',
        description: 'Users are experiencing difficulties logging in through our SSO provider. The authentication flow seems to hang on the redirect step. This is affecting multiple users across different departments.',
        status: 'open' as const,
        priority: 'urgent' as const,
        organizationId: 'org-1',
        requesterId: 'user-3',
        assigneeId: 'member-1',
        tags: JSON.stringify(['sso', 'authentication', 'login']),
        createdAt: new Date('2024-01-20T10:30:00Z'),
        updatedAt: new Date('2024-01-20T14:15:00Z'),
      },
      {
        id: 'ticket-1233',
        title: 'Payment processing error on checkout',
        description: 'Customers are reporting payment failures during checkout. The error occurs specifically with credit card payments, while PayPal seems to work fine. Error code: PAYMENT_GATEWAY_TIMEOUT',
        status: 'in_progress' as const,
        priority: 'high' as const,
        organizationId: 'org-1',
        requesterId: 'user-4',
        assigneeId: 'member-2',
        tags: JSON.stringify(['payment', 'checkout', 'billing']),
        createdAt: new Date('2024-01-20T08:45:00Z'),
        updatedAt: new Date('2024-01-20T12:20:00Z'),
      },
      {
        id: 'ticket-1232',
        title: 'Feature request: Dark mode support',
        description: 'Many users have requested dark mode support for the application. This would improve user experience, especially for users working in low-light environments. Consider implementing system preference detection as well.',
        status: 'open' as const,
        priority: 'medium' as const,
        organizationId: 'org-1',
        requesterId: 'user-5',
        assigneeId: null,
        tags: JSON.stringify(['feature-request', 'ui', 'enhancement']),
        createdAt: new Date('2024-01-19T16:20:00Z'),
        updatedAt: new Date('2024-01-19T16:20:00Z'),
      },
      {
        id: 'ticket-1231',
        title: 'Mobile app crashing on startup',
        description: 'The mobile application crashes immediately upon startup on certain Android devices. Crash logs show a null pointer exception in the initialization code. Affects Android 12+ devices.',
        status: 'waiting_for_customer' as const,
        priority: 'high' as const,
        organizationId: 'org-1',
        requesterId: 'user-6',
        assigneeId: 'member-1',
        tags: JSON.stringify(['mobile', 'bug', 'android', 'crash']),
        createdAt: new Date('2024-01-19T14:10:00Z'),
        updatedAt: new Date('2024-01-20T09:30:00Z'),
      },
      {
        id: 'ticket-1230',
        title: 'API rate limiting implementation',
        description: 'Need to implement proper rate limiting for our public API to prevent abuse and ensure fair usage. Current implementation allows unlimited requests which could lead to system overload.',
        status: 'open' as const,
        priority: 'medium' as const,
        organizationId: 'org-2',
        requesterId: 'user-7',
        assigneeId: 'member-3',
        tags: JSON.stringify(['api', 'security', 'performance']),
        createdAt: new Date('2024-01-18T11:00:00Z'),
        updatedAt: new Date('2024-01-18T11:00:00Z'),
      },
      {
        id: 'ticket-1229',
        title: 'Database performance optimization',
        description: 'Query response times have been increasing. Need to analyze and optimize slow queries, possibly add indexing for frequently accessed data. Dashboard load times are particularly affected.',
        status: 'resolved' as const,
        priority: 'high' as const,
        organizationId: 'org-2',
        requesterId: 'user-1',
        assigneeId: 'member-3',
        tags: JSON.stringify(['database', 'performance', 'optimization']),
        createdAt: new Date('2024-01-15T09:00:00Z'),
        updatedAt: new Date('2024-01-18T16:45:00Z'),
        resolvedAt: new Date('2024-01-18T16:45:00Z'),
      },
      {
        id: 'ticket-5001',
        title: 'Dashboard loading slowly',
        description: 'The dashboard is taking too long to load. Users are experiencing delays when accessing their organization dashboard. This affects productivity and user experience.',
        status: 'open' as const,
        priority: 'high' as const,
        organizationId: 'org-5', // qasim-javed
        requesterId: 'user-1',
        assigneeId: 'member-7',
        tags: JSON.stringify(['dashboard', 'performance', 'frontend']),
        createdAt: new Date('2024-01-22T10:00:00Z'),
        updatedAt: new Date('2024-01-22T10:00:00Z'),
      },
      {
        id: 'ticket-5002',
        title: 'Email notifications not working',
        description: 'Users are not receiving email notifications for ticket updates. The email service seems to be misconfigured or not working properly.',
        status: 'in_progress' as const,
        priority: 'medium' as const,
        organizationId: 'org-5', // qasim-javed
        requesterId: 'user-2',
        assigneeId: 'member-8',
        tags: JSON.stringify(['email', 'notifications', 'communication']),
        createdAt: new Date('2024-01-21T14:30:00Z'),
        updatedAt: new Date('2024-01-22T09:15:00Z'),
      },
      {
        id: 'ticket-5003',
        title: 'Add export functionality',
        description: 'Users need the ability to export tickets and data to CSV or PDF format for reporting and analysis purposes.',
        status: 'open' as const,
        priority: 'low' as const,
        organizationId: 'org-5', // qasim-javed
        requesterId: 'user-1',
        assigneeId: null,
        tags: JSON.stringify(['feature-request', 'export', 'reporting']),
        createdAt: new Date('2024-01-20T16:45:00Z'),
        updatedAt: new Date('2024-01-20T16:45:00Z'),
      },
    ];

    await db.insert(ticket).values(tickets);

    // Seed Ticket Comments
    console.log('💬 Seeding ticket comments...');
    const ticketComments = [
      {
        id: 'comment-1',
        ticketId: 'ticket-1234',
        authorId: 'user-1',
        content: 'I\'ve started investigating this issue. It seems to be related to the SAML configuration. Checking with the identity provider now.',
        isInternal: true,
        createdAt: new Date('2024-01-20T11:00:00Z'),
        updatedAt: new Date('2024-01-20T11:00:00Z'),
      },
      {
        id: 'comment-2',
        ticketId: 'ticket-1234',
        authorId: 'user-3',
        content: 'The issue is still persisting. I\'ve tried different browsers and cleared cookies but no luck.',
        isInternal: false,
        createdAt: new Date('2024-01-20T13:30:00Z'),
        updatedAt: new Date('2024-01-20T13:30:00Z'),
      },
      {
        id: 'comment-3',
        ticketId: 'ticket-1233',
        authorId: 'user-2',
        content: 'I\'ve identified the issue - it\'s a timeout problem with our payment gateway. Working on increasing the timeout limit and adding better error handling.',
        isInternal: true,
        createdAt: new Date('2024-01-20T10:15:00Z'),
        updatedAt: new Date('2024-01-20T10:15:00Z'),
      },
      {
        id: 'comment-4',
        ticketId: 'ticket-1231',
        authorId: 'user-1',
        content: 'Could you please provide the device model and Android version? Also, are there any crash logs available?',
        isInternal: false,
        createdAt: new Date('2024-01-20T09:30:00Z'),
        updatedAt: new Date('2024-01-20T09:30:00Z'),
      },
      {
        id: 'comment-5',
        ticketId: 'ticket-1229',
        authorId: 'user-7',
        content: 'Performance optimization completed. Added indexes for user queries and optimized the dashboard data loading. Response times improved by 60%.',
        isInternal: true,
        createdAt: new Date('2024-01-18T16:45:00Z'),
        updatedAt: new Date('2024-01-18T16:45:00Z'),
      },
    ];

    await db.insert(ticketComment).values(ticketComments);

    // Seed some Ticket Attachments
    console.log('📎 Seeding ticket attachments...');
    const ticketAttachments = [
      {
        id: 'attachment-1',
        ticketId: 'ticket-1234',
        commentId: null,
        filename: 'sso-error-screenshot.png',
        url: 'https://storage.example.com/attachments/sso-error-screenshot.png',
        size: 245760,
        contentType: 'image/png',
        uploadedBy: 'user-3',
        uploadedAt: new Date('2024-01-20T10:35:00Z'),
      },
      {
        id: 'attachment-2',
        ticketId: 'ticket-1231',
        commentId: null,
        filename: 'crash-log.txt',
        url: 'https://storage.example.com/attachments/crash-log.txt',
        size: 8192,
        contentType: 'text/plain',
        uploadedBy: 'user-6',
        uploadedAt: new Date('2024-01-19T14:15:00Z'),
      },
      {
        id: 'attachment-3',
        ticketId: 'ticket-1229',
        commentId: 'comment-5',
        filename: 'performance-report.pdf',
        url: 'https://storage.example.com/attachments/performance-report.pdf',
        size: 512000,
        contentType: 'application/pdf',
        uploadedBy: 'user-7',
        uploadedAt: new Date('2024-01-18T16:40:00Z'),
      },
    ];

    await db.insert(ticketAttachment).values(ticketAttachments);

    console.log('✅ Database seeded successfully!');
    console.log(`
📊 Seeded Data Summary:
- Users: ${users.length}
- Organizations: ${organizations.length}
- Members: ${members.length}
- Invitations: ${invitations.length}
- Tickets: ${tickets.length}
- Comments: ${ticketComments.length}
- Attachments: ${ticketAttachments.length}
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('🎉 Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });