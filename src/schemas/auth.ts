import { z } from "zod"
import { emailSchema, passwordSchema, simplePasswordSchema, nameSchema, organizationSlugSchema } from "./common"

// Sign-in form schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

// Sign-up form schema
export const signUpSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Login schema for server actions
export const loginSchema = z.object({
  email: emailSchema,
  password: simplePasswordSchema,
  organizationSlug: organizationSlugSchema
})

// Login schema without organization (for create-organization intent)
export const loginWithoutOrgSchema = z.object({
  email: emailSchema,
  password: simplePasswordSchema,
  intent: z.string().optional(),
})

// Server signup schema
export const serverSignUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  organizationSlug: organizationSlugSchema
})

// Server signup schema without organization (for create-organization intent)
export const serverSignUpWithoutOrgSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  intent: z.string().optional(),
})

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
  organizationSlug: organizationSlugSchema
})

// Type exports
export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type LoginData = z.infer<typeof loginSchema>
export type ServerSignUpData = z.infer<typeof serverSignUpSchema>
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>