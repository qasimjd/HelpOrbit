import { z } from "zod"

// Password validation schema with comprehensive requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[@$!%*?&.,]/, "Password must contain at least one special character (@$!%*?&.,)")

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")

// Sign-in form schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

// Sign-up form schema
export const signUpSchema = z
  .object({
    name: z.string().min(3, "Name should be at least 3 characters long"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Type inference for TypeScript
export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type PasswordFormData = z.infer<typeof passwordSchema>
