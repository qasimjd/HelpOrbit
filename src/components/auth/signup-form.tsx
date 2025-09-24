"use client"

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signUpAction } from '@/server/actions/auth-actions'
import { cn } from '@/lib/utils'

interface SignUpFormProps {
  className?: string
  intent?: string
  showModeSwitch?: boolean
  organizationSlug?: string
}

export function SignUpForm({ className, intent, showModeSwitch, organizationSlug }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  
  const [state, formAction, isPending] = useActionState(signUpAction, {
    success: false,
    errors: {},
    message: ''
  })

  return (
    <div className={cn("space-y-6", className)}>
      <form action={formAction} className="space-y-4">
        {/* Hidden fields for intent and organization */}
        {intent && <input type="hidden" name="intent" value={intent} />}
        {organizationSlug && <input type="hidden" name="organizationSlug" value={organizationSlug} />}
        
        {/* Success/Error Message */}
        {state.message && (
          <Alert variant={state.success ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
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
              "input-brand transition-colors",
              state.errors && 'name' in state.errors && state.errors.name && "border-red-500 focus:border-red-500"
            )}
            disabled={isPending}
          />
          {state.errors && 'name' in state.errors && state.errors.name && (
            <p className="text-sm text-red-600">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
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
              state.errors && 'email' in state.errors && state.errors.email && "border-red-500 focus:border-red-500"
            )}
            disabled={isPending}
          />
          {state.errors && 'email' in state.errors && state.errors.email && (
            <p className="text-sm text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
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
                "input-brand pr-10 transition-colors",
                state.errors && 'password' in state.errors && state.errors.password && "border-red-500 focus:border-red-500"
              )}
              disabled={isPending}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
          {state.errors && 'password' in state.errors && state.errors.password && (
            <p className="text-sm text-red-600">{state.errors.password[0]}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full btn-brand-primary py-3 text-base font-medium"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Mode Switch */}
      {showModeSwitch && (
        <div className="text-center text-sm text-gray-500">
          <p>
            Already have an account?{' '}
            <Link
              href={intent ? `/auth?intent=${intent}&mode=login` : '/auth?mode=login'}
              className="link-brand font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}

      {/* Terms */}
      <div className="text-center text-xs text-gray-500">
        <p>
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="link-brand">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="link-brand">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}