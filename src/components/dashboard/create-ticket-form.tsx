"use client"

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, X, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createTicketAction } from '@/server/actions/ticket-actions'
import type { CreateTicketData, TicketPriority } from '@/types/ticket'
import { Loading } from '@/components/sheard/loading'

interface CreateTicketFormProps {
  organizationSlug: string
  organizationId: string
  className?: string
}

interface FormErrors {
  title?: string[]
  description?: string[]
  priority?: string[]
  general?: string
}

export function CreateTicketForm({ organizationSlug, organizationId, className }: CreateTicketFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '' as TicketPriority | ''
  })
  
  // UI state
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState('')

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = ['Title is required']
    } else if (formData.title.trim().length < 3) {
      newErrors.title = ['Title must be at least 3 characters']
    }

    if (!formData.description.trim()) {
      newErrors.description = ['Description is required']
    } else if (formData.description.trim().length < 10) {
      newErrors.description = ['Description must be at least 10 characters']
    }

    if (!formData.priority) {
      newErrors.priority = ['Priority is required']
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form handlers
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear related error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      handleAddTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1])
    }
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const ticketData: CreateTicketData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority as TicketPriority,
      tags: tags.length > 0 ? tags : undefined
    }

    startTransition(async () => {
      try {
        const result = await createTicketAction(organizationId, ticketData)
        
        if (result.success) {
          setSuccessMessage('Ticket created successfully!')
          // Redirect to tickets page or the new ticket
          setTimeout(() => {
            router.push(`/org/${organizationSlug}/dashboard/tickets`)
          }, 1500)
        } else {
          setErrors({ general: result.error || 'Failed to create ticket' })
        }
      } catch (error) {
        console.error('Error creating ticket:', error)
        setErrors({ general: 'An unexpected error occurred. Please try again.' })
      }
    })
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Ticket Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {successMessage && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief description of the issue"
              className={cn(
                "input-brand",
                errors?.title && "border-red-500 focus:border-red-500"
              )}
              disabled={isPending}
              required
            />
            {errors?.title && (
              <p className="text-sm text-red-600">{errors.title[0]}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
              Priority *
            </Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => handleInputChange('priority', value)}
              disabled={isPending} 
              required
            >
              <SelectTrigger className={cn(
                "input-brand",
                errors?.priority && "border-red-500 focus:border-red-500"
              )}>
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <span className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    Low
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                    Medium
                  </span>
                </SelectItem>
                <SelectItem value="high">
                  <span className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                    High
                  </span>
                </SelectItem>
                <SelectItem value="urgent">
                  <span className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    Urgent
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors?.priority && (
              <p className="text-sm text-red-600">{errors.priority[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide detailed information about the issue, including steps to reproduce, error messages, and any relevant context..."
              rows={6}
              className={cn(
                "input-brand resize-none",
                errors?.description && "border-red-500 focus:border-red-500"
              )}
              disabled={isPending}
              required
            />
            {errors?.description && (
              <p className="text-sm text-red-600">{errors.description[0]}</p>
            )}
            <p className="text-xs text-gray-500">
              Minimum 10 characters. Be as detailed as possible to help us resolve your issue faster.
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Tags (Optional)
            </Label>
            <div className="space-y-2">
              {/* Tag Input */}
              <Input
                placeholder="Add tags (press Enter to add)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="input-brand"
                disabled={isPending}
              />
              
              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isPending}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Add relevant tags to help categorize your ticket (e.g., "login", "payment", "bug")
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="btn-brand-primary min-w-[120px]"
            >
              {isPending ? (
                <>
                  <Loading size='sm' />
                  Creating...
                </>
              ) : (
                'Create Ticket'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}