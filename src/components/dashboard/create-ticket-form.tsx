"use client"

import React, { useActionState } from 'react'
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
import { Loader2, AlertCircle, X } from 'lucide-react'
import { createTicketAction } from '@/lib/ticket-actions'
import { cn } from '@/lib/utils'

interface CreateTicketFormProps {
  organizationSlug: string
  className?: string
}

export function CreateTicketForm({ organizationSlug, className }: CreateTicketFormProps) {
  const [tags, setTags] = React.useState<string[]>([])
  const [tagInput, setTagInput] = React.useState('')
  
  const [state, formAction, isPending] = useActionState(createTicketAction, {
    success: false,
    errors: {},
    message: ''
  })

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

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Ticket Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {/* Hidden field for organization slug */}
          <input type="hidden" name="organizationSlug" value={organizationSlug} />
          <input type="hidden" name="tags" value={tags.join(',')} />
          
          {/* Error Message */}
          {!state.success && state.message && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title *
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Brief description of the issue"
              className={cn(
                "input-brand",
                state.errors?.title && "border-red-500 focus:border-red-500"
              )}
              disabled={isPending}
              required
            />
            {state.errors?.title && (
              <p className="text-sm text-red-600">{state.errors.title[0]}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
              Priority *
            </Label>
            <Select name="priority" disabled={isPending} required>
              <SelectTrigger className="input-brand">
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
            {state.errors?.priority && (
              <p className="text-sm text-red-600">{state.errors.priority[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide detailed information about the issue, including steps to reproduce, error messages, and any relevant context..."
              rows={6}
              className={cn(
                "input-brand resize-none",
                state.errors?.description && "border-red-500 focus:border-red-500"
              )}
              disabled={isPending}
              required
            />
            {state.errors?.description && (
              <p className="text-sm text-red-600">{state.errors.description[0]}</p>
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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