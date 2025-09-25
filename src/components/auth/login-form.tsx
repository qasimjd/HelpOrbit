"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { SwitchOrganizationButton } from "@/components/auth/switch-organization-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginAction } from "@/server/actions/auth-actions"
import { cn } from "@/lib/utils"
import SocialLoginButtons from "@/components/auth/social-login-buttons"

interface LoginFormProps {
  organizationSlug?: string
  className?: string
  showModeSwitch?: boolean
}

export function LoginForm({
  organizationSlug,
  className,
  showModeSwitch,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
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
  const router = useRouter()
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)

    const formData = new FormData(e.currentTarget)

    if (organizationSlug) {
      formData.set("organizationSlug", organizationSlug)
    }

    formData.set(
      "intent",
      organizationSlug ? "join-organization" : "create-organization"
    )

    try {
      const result = await loginAction(null, formData)
      setState(result)

      // Handle client-side redirect on success
      if (result.success && result.redirectTo) {
        router.push(from ?? result.redirectTo)
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setState({
        success: false,
        errors: {},
        message: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        {/* Error Message */}
        {!state.success && state.message && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

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
              "input-brand transition-colors",
              state.errors?.email &&
              "border-destructive focus:border-destructive"
            )}
            disabled={isPending}
          />
          {state.errors?.email && (
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
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              className={cn(
                "input-brand pr-10 transition-colors",
                state.errors?.password &&
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
          {state.errors?.password && (
            <p className="text-sm text-destructive">
              {state.errors.password[0]}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              name="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              disabled={isPending}
            />
            <Label
              htmlFor="remember-me"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Remember me
            </Label>
            <input
              type="hidden"
              name="rememberMe"
              value={rememberMe ? "on" : "off"}
            />
          </div>
          <Link
            href={
              organizationSlug
                ? `/org/${organizationSlug}/forgot-password`
                : "/forgot-password"
            }
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isPending} className={cn("w-full", organizationSlug && "btn-brand-primary")}>
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
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
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      )}

      {/* Organization-specific content */}
      {organizationSlug && !showModeSwitch && (
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href={`/org/${organizationSlug}/register`}
              className="font-medium text-primary hover:underline"
            >
              Contact your administrator
            </Link>
          </p>
        </div>
      )}
      <p className="text-center">
        <SwitchOrganizationButton children="Organization selection" />
      </p>
    </div>
  )
}
