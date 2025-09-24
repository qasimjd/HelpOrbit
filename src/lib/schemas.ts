// Re-export schemas from the centralized schemas folder for backward compatibility
export {
  emailSchema,
  passwordSchema,
  signInSchema,
  signUpSchema,
  type SignInFormData,
  type SignUpFormData,
  type Password as PasswordFormData
} from "@/schemas"
