"use client"

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { loginAction } from '@/server/actions/server-actions'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  organizationSlug: string
  className?: string
}

export function LoginForm({ organizationSlug, className }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const [state, formAction, isPending] = useActionState(loginAction, {
    success: false,
    errors: {},
    message: ''
  })

  return (
    <div className={cn("space-y-6", className)}>
      <form action={formAction} className="space-y-4">
        {/* Hidden field for organization slug */}
        <input type="hidden" name="organizationSlug" value={organizationSlug} />
        
        {/* Error Message */}
        {!state.success && state.message && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

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
              state.errors?.email && "border-red-500 focus:border-red-500"
            )}
            disabled={isPending}
          />
          {state.errors?.email && (
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
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              className={cn(
                "input-brand pr-10 transition-colors",
                state.errors?.password && "border-red-500 focus:border-red-500"
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
          {state.errors?.password && (
            <p className="text-sm text-red-600">{state.errors.password[0]}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              disabled={isPending}
              className="checkbox-brand"
            />
            <Label 
              htmlFor="remember-me" 
              className="text-sm text-gray-600 cursor-pointer"
            >
              Remember me
            </Label>
          </div>
          <Link
            href={`/org/${organizationSlug}/forgot-password`}
            className="text-sm link-brand"
          >
            Forgot password?
          </Link>
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
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      {/* Demo Credentials Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Demo Credentials
        </h4>
        <p className="text-xs text-blue-600 mb-2">
          For testing purposes, use:
        </p>
        <div className="text-xs font-mono text-blue-700 space-y-1">
          <div><strong>Email:</strong> demo@example.com</div>
          <div><strong>Password:</strong> password</div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="text-center text-sm text-gray-500 space-y-2">
        <p>
          Don't have an account?{' '}
          <Link
            href={`/org/${organizationSlug}/register`}
            className="link-brand font-medium"
          >
            Contact your administrator
          </Link>
        </p>
        <p>
          <Link
            href="/select-organization"
            className="link-brand"
          >
            Switch organization
          </Link>
        </p>
      </div>
    </div>
  )
}