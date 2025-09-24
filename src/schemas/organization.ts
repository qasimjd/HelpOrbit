import { z } from "zod"
import { organizationNameSchema, organizationSlugSchema, urlSchema, idSchema } from "./common"

// Create organization schema
export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: organizationSlugSchema,
  logo: urlSchema.optional().or(z.literal("")),
  description: z.string().max(500, "Description too long").optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

// Update organization schema
export const updateOrganizationSchema = z.object({
  id: idSchema,
  name: organizationNameSchema.optional(),
  slug: organizationSlugSchema.optional(),
  logo: urlSchema.optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

// Check organization slug schema
export const checkOrganizationSlugSchema = z.object({
  slug: organizationSlugSchema,
})

// Organization ID schema
export const organizationIdSchema = z.object({
  organizationId: idSchema,
})

// Type exports
export type CreateOrganizationData = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationData = z.infer<typeof updateOrganizationSchema>
export type CheckOrganizationSlugData = z.infer<typeof checkOrganizationSlugSchema>
export type OrganizationIdData = z.infer<typeof organizationIdSchema>