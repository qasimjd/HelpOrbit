import { z } from "zod"
import { emailSchema, idSchema, roleSchema } from "./common"

// Invite member schema
export const inviteMemberSchema = z.object({
  organizationId: idSchema,
  email: emailSchema,
  role: roleSchema,
  resend: z.boolean().optional(),
})

// Update member role schema
export const updateMemberRoleSchema = z.object({
  organizationId: idSchema,
  memberId: idSchema,
  role: roleSchema,
})

// Remove member schema
export const removeMemberSchema = z.object({
  organizationId: idSchema,
  memberIdOrEmail: z.string().min(1, "Member ID or email is required"),
})

// List members schema
export const listMembersSchema = z.object({
  organizationId: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
})

// Add member schema (direct addition without invitation)
export const addMemberSchema = z.object({
  organizationId: idSchema,
  userId: idSchema,
  role: roleSchema,
})

// Type exports
export type InviteMemberData = z.infer<typeof inviteMemberSchema>
export type UpdateMemberRoleData = z.infer<typeof updateMemberRoleSchema>
export type RemoveMemberData = z.infer<typeof removeMemberSchema>
export type ListMembersData = z.infer<typeof listMembersSchema>
export type AddMemberData = z.infer<typeof addMemberSchema>