import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignUpForm } from '@/components/auth/signup-form'
import { Metadata } from 'next'
import { BrandedLogo } from '@/components/branding/branded-logo'

export const metadata: Metadata = {
    title: 'Sign Up | HelpOrbit',
    description: 'Create your HelpOrbit account and get started with seamless support and collaboration.',
}


const SignUpPage = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Card className="w-full max-w-lg border-none shadow-none">
                <CardHeader className="text-center">
                    <BrandedLogo size='xl' helpOrbit className="mb-6 mx-auto" />

                    <CardTitle className="text-2xl font-bold">
                        Create Your Account
                    </CardTitle>
                    <p className="text-muted-foreground">
                        Get started with HelpOrbit today
                    </p>
                </CardHeader>
                <CardContent className='max-w-md w-full mx-auto'>
                    <SignUpForm showModeSwitch={true} />
                </CardContent>
            </Card>
        </div>
    )
}
export default SignUpPage;
