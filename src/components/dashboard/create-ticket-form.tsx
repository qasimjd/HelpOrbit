"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createTicketAction, updateTicketAction, getTicketByIdAction } from "@/server/actions/ticket-actions"
import { Loading } from "@/components/sheard/loading"

import { ticketSchema } from "@/schemas"
import { toast } from "sonner"
import { useEffect } from "react"
import { UserRole } from "@/types"



type TicketFormValues = z.infer<typeof ticketSchema>

interface CreateTicketFormProps {
  organizationSlug: string
  organizationId: string
  userRole?: UserRole
  ticketId?: string // For edit mode
  className?: string
}

export function CreateTicketForm({
  organizationSlug,
  organizationId,
  userRole,
  ticketId,
  className,
}: CreateTicketFormProps) {
  const isEditMode = Boolean(ticketId)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      type: "general",
      tags: [],
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = form

  const dueDate = watch("dueDate")
  const priority = watch("priority")
  const type = watch("type")

  // Fetch ticket data for edit mode
  useEffect(() => {
    if (isEditMode && ticketId) {
      const fetchTicketData = async () => {
        try {
          setIsLoading(true)
          const response = await getTicketByIdAction(ticketId, organizationId)
          
          if (response.success && response.data) {
            const ticket = response.data
            
            // Populate form with existing ticket data
            reset({
              title: ticket.title,
              description: ticket.description || "",
              priority: ticket.priority,
              type: ticket.type,
              tags: ticket.tags || [],
              dueDate: ticket.dueDate ? new Date(ticket.dueDate) : undefined,
            })
            
            // Set tags state
            setTags(ticket.tags || [])
          } else {
            toast.error("Failed to load ticket data")
          }
        } catch (error) {
          console.error("Error fetching ticket:", error)
          toast.error("Failed to load ticket data")
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchTicketData()
    }
  }, [isEditMode, ticketId, organizationId, reset])

  // Clear due date if user doesn't have permission to set it
  useEffect(() => {
    if (userRole && userRole !== "admin" && userRole !== "owner") {
      setValue("dueDate", undefined)
    }
  }, [userRole, setValue])

  // Tags handlers
  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed]
      setTags(newTags)
      setValue("tags", newTags)
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove)
    setTags(newTags)
    setValue("tags", newTags)
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      handleAddTag(tagInput)
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1])
    }
  }

  // Submit handler
  const onSubmit = async (data: TicketFormValues) => {
    startTransition(async () => {
      try {
        let result
        
        if (isEditMode && ticketId) {
          // Update existing ticket
          result = await updateTicketAction(ticketId, organizationId, { ...data })
          if (result.success) {
            toast.success("Ticket updated successfully!")
            setTimeout(() => {
              router.push(`/org/${organizationSlug}/dashboard/tickets`)
            }, 2000)
          }
        } else {
          // Create new ticket
          result = await createTicketAction(organizationId, { ...data })
          if (result.success) {
            toast.success("Ticket created successfully!")
            setTimeout(() => {
              router.push(`/org/${organizationSlug}/dashboard/tickets`)
            }, 2000)
          }
        }
      } catch {
        const action = isEditMode ? "updating" : "creating"
        toast.error(`There was an error ${action} the ticket. Please try again.`)
      }
    })
  }

  // Show loading state when fetching ticket data in edit mode
  if (isLoading) {
    return (
      <Card className={cn("shadow-sm border", className)}>
        <CardContent className="flex items-center justify-center py-12 min-h-[60vh]">
          <div className="flex items-center space-x-2">
            <Loading text="Loading ticket data..." />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("shadow-sm border", className)}>
      <CardHeader className="sr-only">
        <CardTitle>
          {isEditMode ? "Edit Ticket" : "Create New Ticket"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Title */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              {...register("title")}
              placeholder="Brief description of the issue"
              disabled={isPending}
              className={cn("input-brand", errors.title && "border-red-500")}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Priority + Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select
                onValueChange={(v) =>
                  setValue("priority", v as TicketFormValues["priority"])
                }
                value={priority || "medium"}
                disabled={isPending}
              >
                <SelectTrigger
                  className={cn("focus:border-brand-primary", errors.priority && "border-red-500")}
                >
                  <SelectValue placeholder="Select priority" />
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
              {errors.priority && (
                <p className="text-sm text-red-600">
                  {errors.priority.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                onValueChange={(v) =>
                  setValue("type", v as TicketFormValues["type"])
                }
                value={type || "general"}
                disabled={isPending}
              >
                <SelectTrigger
                  className={cn(
                    "focus-visible:border-brand-primary focus:border-brand-primary",
                    errors.type && "border-red-500"
                  )}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="general">
                  <span className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    General
                  </span>
                </SelectItem>
                  <SelectItem value="bug">
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                      Bug
                    </span>
                  </SelectItem>
                  <SelectItem value="feature_request">
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      Feature Request
                    </span>
                  </SelectItem>
                  <SelectItem value="support">
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                      Support
                    </span>
                  </SelectItem>
                  <SelectItem value="billing">
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                      Billing
                    </span>
                  </SelectItem>
                  <SelectItem value="other">
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
                      Other
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              {...register("description")}
              placeholder="Provide details, steps to reproduce, error messages, etc."
              rows={6}
              disabled={isPending}
              className={cn("resize-none input-brand", errors.description && "border-red-500")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Due Date - Only show for admin and owner roles */}
          {userRole && (userRole === "admin" || userRole === "owner") && (
            <div className="space-y-2">
              <Label>Due Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isPending || isLoading}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-brand-primary" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(d) => setValue("dueDate", d ?? undefined)}
                    disabled={isPending || isLoading}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              placeholder="Add tags (press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              disabled={isPending}
              className="input-brand"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={isPending}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
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
              disabled={isPending || isLoading}
              className="btn-brand-primary min-w-[140px]"
            >
              {isPending ? (
                <>
                  <Loading size="sm" /> {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Ticket" : "Create Ticket"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
