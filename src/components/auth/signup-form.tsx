"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signUpAction } from "@/server/actions/auth-actions"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import SocialLoginButtons from "@/components/auth/social-login-buttons"

interface SignUpFormProps {
  className?: string
  showModeSwitch?: boolean
  organizationSlug?: string
}

export function SignUpForm({
  className,
  showModeSwitch,
  organizationSlug,
}: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [state, setState] = useState<{
    success: boolean
    errors: Record<string, string[]>
    message: string
    redirectTo?: string
  }>({
    success: false,
    errors: {},
    message: "",
  })
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)

    const formData = new FormData(e.currentTarget)

    // Add organizationSlug and intent to formData if needed
    if (organizationSlug) {
      formData.set('organizationSlug', organizationSlug)
    }

    // Add intent - if no org slug, assume create-organization flow
    formData.set('intent', organizationSlug ? 'join-organization' : 'create-organization')

    try {
      const result = await signUpAction(null, formData)
      setState(result)

      // Handle client-side redirect on success
      if (result.success && result.redirectTo) {
        // Show success message briefly, then redirect
        await new Promise((resolve) => setTimeout(resolve, 2000))
        router.push(from ?? result.redirectTo);
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setState({
        success: false,
        errors: {},
        message: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Success/Error Message */}
        {state.message && (
          <Alert variant={state.success ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Enter your full name"
            className={cn(
              "transition-colors",
              organizationSlug && "input-brand",
              state.errors && "name" in state.errors && state.errors.name &&
              "border-destructive focus:border-destructive"
            )}
            disabled={isPending}
          />
          {state.errors && "name" in state.errors && state.errors.name && (
            <p className="text-sm text-destructive">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email"
            className={cn(
              "transition-colors",
              organizationSlug && "input-brand",
              state.errors && "email" in state.errors && state.errors.email &&
              "border-destructive focus:border-destructive"
            )}
            disabled={isPending}
          />
          {state.errors && "email" in state.errors && state.errors.email && (
            <p className="text-sm text-destructive">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Create a password"
              className={cn(
                "pr-10 transition-colors",
                organizationSlug && "input-brand",
                state.errors && "password" in state.errors && state.errors.password &&
                "border-destructive focus:border-destructive"
              )}
              disabled={isPending}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isPending}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {state.errors && "password" in state.errors && state.errors.password && (
            <p className="text-sm text-destructive">{state.errors.password[0]}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isPending} className={cn("w-full", organizationSlug && "btn-brand-primary")}>
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Social Login Buttons */}
      {!organizationSlug && (
        <SocialLoginButtons />
      )}

      {/* Mode Switch */}
      {showModeSwitch && (
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link
              href={from ? `/login?from=${from}` : "/login"}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}

      {/* Terms */}
      <div className="text-center text-xs text-muted-foreground">
        <p>
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
