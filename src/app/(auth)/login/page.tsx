import React, { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/login-form'
import { Metadata } from 'next'
import { BrandedLogo } from '@/components/branding/branded-logo'
import { Loading } from '@/components/sheard/loading'

export const metadata: Metadata = {
    title: 'Login | HelpOrbit',
    description: 'Log in to your HelpOrbit account and continue your support journey.',
}


const LoginPage = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Card className="w-full max-w-lg border-none shadow-none">
                <CardHeader className="text-center">
                    <BrandedLogo helpOrbit size='xl' className="mb-6 mx-auto" />

                    <CardTitle className="text-2xl font-bold">
                        Welcome Back
                    </CardTitle>
                    <p className="text-muted-foreground">
                        Get back to your support portal
                    </p>
                </CardHeader>
                <CardContent className='max-w-md w-full mx-auto'>
                    <Suspense fallback={<Loading size="md" text="Loading login form..." />}>
                        <LoginForm showModeSwitch={true} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
export default LoginPage
