"use client"

import React, { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { forgotPasswordAction } from '@/server/actions/auth-actions'
import { cn } from '@/lib/utils'

interface ForgotPasswordFormProps {
  organizationSlug: string
  className?: string
}

export function ForgotPasswordForm({ organizationSlug, className }: ForgotPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, {
    success: false,
    errors: {},
    message: ''
  })

  if (state.success) {
    return (
      <div className={cn("space-y-6 text-center", className)}>
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Check your email
          </h3>
          <p className="text-gray-600 text-sm">
            {state.message}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link href={`/org/${organizationSlug}/login`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Link>
          </Button>
          
          <p className="text-xs text-gray-500">
            Didn't receive an email? Check your spam folder or{' '}
            <button 
              onClick={() => window.location.reload()}
              className="link-brand"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    )
  }

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
            placeholder="Enter your email address"
            className={cn(
              "input-brand transition-colors",
              state.errors?.email && "border-red-500 focus:border-red-500"
            )}
            disabled={isPending}
          />
          {state.errors?.email && (
            <p className="text-sm text-red-600">{state.errors.email[0]}</p>
          )}
          <p className="text-xs text-gray-500">
            We'll send a password reset link to this email address.
          </p>
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
              Sending reset link...
            </>
          ) : (
            'Send password reset link'
          )}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <Button
          asChild
          variant="ghost"
          className="text-gray-600 hover:text-gray-900"
        >
          <Link href={`/org/${organizationSlug}/login`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500 space-y-2">
        <p>
          Remember your password?{' '}
          <Link
            href={`/org/${organizationSlug}/login`}
            className="link-brand font-medium"
          >
            Sign in instead
          </Link>
        </p>
        <p>
          Need help?{' '}
          <Link
            href="/support"
            className="link-brand"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  )
}