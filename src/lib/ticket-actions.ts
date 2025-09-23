"use server"

import { redirect } from 'next/navigation'
import { z } from 'zod'

// Validation schema for ticket creation
const createTicketSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  tags: z.string().optional(),
  organizationSlug: z.string().min(1, 'Organization is required')
})

// Server action for creating tickets
export async function createTicketAction(prevState: any, formData: FormData) {
  try {
    // Extract form data
    const rawFormData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as string,
      tags: formData.get('tags') as string,
      organizationSlug: formData.get('organizationSlug') as string,
    }

    // Validate input
    const validatedFields = createTicketSchema.safeParse(rawFormData)
    
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Please check your input and try again.'
      }
    }

    const { title, description, priority, tags, organizationSlug } = validatedFields.data

    // TODO: Replace with actual ticket creation logic
    // This would typically:
    // 1. Create ticket in database
    // 2. Assign ticket ID
    // 3. Send notifications
    // 4. Log activity
    
    // Mock ticket creation
    const ticketId = Math.floor(Math.random() * 9000) + 1000 // Generate random ID
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Redirect to the new ticket
    redirect(`/org/${organizationSlug}/dashboard/tickets/${ticketId}`)
  } catch (error) {
    console.error('Create ticket error:', error)
    
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error // Re-throw redirect errors
    }
    
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      errors: {}
    }
  }
}

// Server action to update ticket
export async function updateTicketAction(ticketId: string, prevState: any, formData: FormData) {
  try {
    const rawFormData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as string,
      priority: formData.get('priority') as string,
      assigneeId: formData.get('assigneeId') as string,
      tags: formData.get('tags') as string,
    }

    // TODO: Validate and update ticket in database
    
    return {
      success: true,
      message: 'Ticket updated successfully.',
      errors: {}
    }
  } catch (error) {
    console.error('Update ticket error:', error)
    
    return {
      success: false,
      message: 'Failed to update ticket. Please try again.',
      errors: {}
    }
  }
}

// Server action to add comment to ticket
export async function addCommentAction(ticketId: string, prevState: any, formData: FormData) {
  try {
    const comment = formData.get('comment') as string
    const isInternal = formData.get('isInternal') === 'true'

    if (!comment || comment.trim().length < 1) {
      return {
        success: false,
        message: 'Comment cannot be empty.',
        errors: { comment: ['Comment is required'] }
      }
    }

    // TODO: Add comment to database
    
    return {
      success: true,
      message: 'Comment added successfully.',
      errors: {},
      data: {
        id: Math.random().toString(36),
        content: comment,
        isInternal,
        createdAt: new Date().toISOString(),
        author: {
          name: 'Current User',
          avatar: 'CU'
        }
      }
    }
  } catch (error) {
    console.error('Add comment error:', error)
    
    return {
      success: false,
      message: 'Failed to add comment. Please try again.',
      errors: {}
    }
  }
}