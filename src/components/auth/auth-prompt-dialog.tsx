"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, LogIn, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AuthPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: 'create-organization' | 'join-organization'
  organizationSlug?: string
  organizationName?: string
}

export function AuthPromptDialog({
  open,
  onOpenChange,
  action,
  organizationSlug,
  organizationName
}: AuthPromptDialogProps) {
  const router = useRouter()

  const handleLogin = () => {
    if (action === 'join-organization' && organizationSlug) {
      // If trying to join a specific organization, go to that org's login
      router.push(`/org/${organizationSlug}/login`)
    } else {
      // For creating organization, go to general auth flow
      router.push('/auth?intent=create-organization&mode=login')
    }
    onOpenChange(false)
  }

  const handleSignUp = () => {
    if (action === 'join-organization' && organizationSlug) {
      // Check if organization allows public registration
      router.push(`/org/${organizationSlug}/login?signup=true`)
    } else {
      // For creating organization, show signup form
      router.push('/auth?intent=create-organization&mode=signup')
    }
    onOpenChange(false)
  }

  const getTitle = () => {
    if (action === 'create-organization') {
      return 'Authentication Required'
    }
    return `Join ${organizationName || 'Organization'}`
  }

  const getDescription = () => {
    if (action === 'create-organization') {
      return 'You need to be signed in to create a new organization. Please sign in to your existing account or create a new one.'
    }
    return `To access ${organizationName || 'this organization'}, you need to sign in or create an account.`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'create-organization' ? (
              <Building className="w-5 h-5 text-blue-600" />
            ) : (
              <UserPlus className="w-5 h-5 text-blue-600" />
            )}
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Sign In Option */}
          <Card className="border-2 hover:border-blue-200 transition-colors cursor-pointer" 
                onClick={handleLogin}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <LogIn className="w-5 h-5 text-blue-600" />
                Sign In
              </CardTitle>
              <CardDescription>
                I already have an account
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={handleLogin}
                className="w-full"
                variant="outline"
              >
                Continue to Sign In
              </Button>
            </CardContent>
          </Card>

          {/* Sign Up Option */}
          <Card className="border-2 hover:border-green-200 transition-colors cursor-pointer"
                onClick={handleSignUp}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                Create Account
              </CardTitle>
              <CardDescription>
                I'm new to HelpOrbit
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={handleSignUp}
                className="w-full"
                variant="outline"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}