# Ticket Filtering Examples

The `getTicketsByOrganization` function now supports comprehensive filtering. Here are some examples:

## Basic Usage

```typescript
import { getTicketsByOrganization } from '@/server/db/queries';

// Get all tickets (no filtering)
const allTickets = await getTicketsByOrganization('org-123');

// Filter by status
const openTickets = await getTicketsByOrganization('org-123', {
  status: ['open', 'in_progress']
});

// Filter by priority
const highPriorityTickets = await getTicketsByOrganization('org-123', {
  priority: ['high', 'urgent']
});

// Filter by assignee
const myTickets = await getTicketsByOrganization('org-123', {
  assigneeId: 'user-456'
});

// Search in title or description
const searchResults = await getTicketsByOrganization('org-123', {
  search: 'login issue'
});

// Filter by tags
const bugTickets = await getTicketsByOrganization('org-123', {
  tags: ['bug', 'frontend']
});

// Filter by date range
const recentTickets = await getTicketsByOrganization('org-123', {
  dateRange: {
    from: new Date('2025-10-01'),
    to: new Date('2025-10-02')
  }
});

// Pagination
const paginatedTickets = await getTicketsByOrganization('org-123', {
  limit: 10,
  offset: 20
});

// Combined filters
const complexFilter = await getTicketsByOrganization('org-123', {
  status: ['open'],
  priority: ['high', 'urgent'],
  tags: ['bug'],
  search: 'critical',
  limit: 5
});
```

## Filter Options

- `status`: Array of ticket statuses to include
- `priority`: Array of priorities to include  
- `assigneeId`: Filter by specific assignee
- `requesterId`: Filter by ticket requester
- `tags`: Array of tags (partial match, case-insensitive)
- `search`: Search term for title/description (partial match)
- `dateRange`: Filter by creation date range
- `limit`: Maximum number of results
- `offset`: Number of results to skip (for pagination)