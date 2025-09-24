import { z } from "zod"

// Common validation patterns
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[@$!%*?&.,]/, "Password must contain at least one special character (@$!%*?&.,)")

export const simplePasswordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .min(3, "Name should be at least 3 characters long")

export const organizationSlugSchema = z
  .string()
  .min(1, "Organization slug is required")
  .max(50, "Slug too long")
  .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
  .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"), "Slug cannot start or end with hyphens")

export const organizationNameSchema = z
  .string()
  .min(1, "Organization name is required")
  .max(100, "Name too long")

export const urlSchema = z
  .string()
  .url("Invalid URL")

export const idSchema = z
  .string()
  .min(1, "ID is required")

export const roleSchema = z.enum(["owner", "admin", "member"])

// Type exports for convenience
export type Email = z.infer<typeof emailSchema>
export type Password = z.infer<typeof passwordSchema>
export type Name = z.infer<typeof nameSchema>
export type OrganizationSlug = z.infer<typeof organizationSlugSchema>
export type OrganizationName = z.infer<typeof organizationNameSchema>
export type Role = z.infer<typeof roleSchema>