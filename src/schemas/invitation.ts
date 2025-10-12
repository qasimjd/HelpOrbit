import { z } from "zod"
import { emailSchema, idSchema } from "./common"

// Invitation ID schema
export const invitationIdSchema = z.object({
  invitationId: idSchema,
})

// List invitations schema
export const listInvitationsSchema = z.object({
  organizationId: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(["pending", "accepted", "rejected", "cancelled"]).optional(),
})

// List user invitations schema
export const listUserInvitationsSchema = z.object({
  email: emailSchema.optional(),
})

// Accept invitation schema
export const acceptInvitationSchema = z.object({
  invitationId: idSchema,
})

// Decline invitation schema
export const declineInvitationSchema = z.object({
  invitationId: idSchema,
})

// Cancel invitation schema
export const cancelInvitationSchema = z.object({
  invitationId: idSchema,
})

// Type exports
export type InvitationIdData = z.infer<typeof invitationIdSchema>
export type ListInvitationsData = z.infer<typeof listInvitationsSchema>
export type ListUserInvitationsData = z.infer<typeof listUserInvitationsSchema>
export type AcceptInvitationData = z.infer<typeof acceptInvitationSchema>
export type DeclineInvitationData = z.infer<typeof declineInvitationSchema>
export type CancelInvitationData = z.infer<typeof cancelInvitationSchema>