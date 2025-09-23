import React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/login-form'
import { SignUpForm } from '@/components/auth/signup-form'
import { SplitAuthLayout } from '@/components/auth/split-auth-layout'

interface AuthPageProps {
  searchParams: Promise<{
    intent?: string
    mode?: 'login' | 'signup'
  }>
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  // Check if user is already authenticated
  const session = await getServerSession()
  const params = await searchParams
  
  if (session?.user) {
    // If user is already logged in, handle the intent
    if (params.intent === 'create-organization') {
      redirect('/select-organization?create=true')
    }
    redirect('/select-organization')
  }

  const mode = params.mode || 'login'
  const intent = params.intent

  const getTitle = () => {
    if (intent === 'create-organization') {
      return mode === 'signup' ? 'Create Account to Start' : 'Sign In to Continue'
    }
    return mode === 'signup' ? 'Create Your Account' : 'Welcome Back'
  }

  const getDescription = () => {
    if (intent === 'create-organization') {
      return mode === 'signup' 
        ? 'Create your account to get started with your new organization'
        : 'Sign in to create your organization and manage your team'
    }
    return mode === 'signup' 
      ? 'Get started with HelpOrbit today'
      : 'Sign in to your account'
  }

  return (
    <SplitAuthLayout>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {getTitle()}
          </CardTitle>
          <p className="text-gray-600">
            {getDescription()}
          </p>
        </CardHeader>
        <CardContent>
          {mode === 'signup' ? (
            <SignUpForm 
              intent={intent}
              showModeSwitch={true}
            />
          ) : (
            <LoginForm 
              intent={intent}
              showModeSwitch={true}
            />
          )}
        </CardContent>
      </Card>
    </SplitAuthLayout>
  )
}