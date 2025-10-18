'use server';

import { getTicketStats, getRecentTickets } from '@/server/db/queries';

export async function getDashboardData(organizationId: string) {
  try {
    console.log('getDashboardData called with organizationId:', organizationId)
    
    const [stats, recentTickets] = await Promise.all([
      getTicketStats(organizationId),
      getRecentTickets(organizationId, 5)
    ]);

    // Ensure stats is not null/undefined
    if (!stats) {
      throw new Error('Failed to fetch ticket statistics');
    }

    // Format stats for dashboard
    const dashboardStats = [
      {
        title: 'Open Tickets',
        value: stats.open.toString(),
        change: '+2 from yesterday', // TODO: Implement actual change calculation
        icon: 'TicketIcon',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        title: 'In Progress',
        value: stats.inProgress.toString(),
        change: '+1 from yesterday',
        icon: 'ClockIcon',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      },
      {
        title: 'Resolved',
        value: stats.resolved.toString(),
        change: '+5 from yesterday',
        icon: 'CheckCircleIcon',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        title: 'Total Tickets',
        value: stats.total.toString(),
        change: 'Same as yesterday',
        icon: 'AlertCircleIcon',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      }
    ];

    // Format recent tickets for dashboard
    const formattedRecentTickets = recentTickets.map(ticket => {
      let tags = [];
      try {
        tags = ticket.tags ? JSON.parse(ticket.tags) : [];
      } catch (error) {
        console.warn('Failed to parse ticket tags:', error);
        tags = [];
      }
      
      return {
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        type: ticket.type,
        customer: ticket.requester?.name || 'Unknown',
        assignee: ticket.assignee?.userId || null,
        created: formatTimeAgo(ticket.createdAt),
        tags
      };
    });

    return {
      stats: dashboardStats,
      recentTickets: formattedRecentTickets
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Return fallback data to prevent UI crash
    const fallbackStats = [
      {
        title: 'Open Tickets',
        value: '0',
        change: 'Unable to load data',
        icon: 'TicketIcon',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        title: 'In Progress',
        value: '0',
        change: 'Unable to load data',
        icon: 'ClockIcon',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      },
      {
        title: 'Resolved Today',
        value: '0',
        change: 'Unable to load data',
        icon: 'CheckCircleIcon',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        title: 'Urgent',
        value: '0',
        change: 'Unable to load data',
        icon: 'AlertTriangleIcon',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      }
    ];
    
    return {
      stats: fallbackStats,
      recentTickets: []
    };
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
}