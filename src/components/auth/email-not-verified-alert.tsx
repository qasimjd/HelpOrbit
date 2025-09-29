"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { sendVerificationEmailAction } from '@/server/actions/auth-actions'
import { cn } from '@/lib/utils'
import { Loading } from '@/components/sheard/loading'
import { Skeleton } from '@/components/ui/skeleton'

interface EmailNotVerifiedAlertProps {
    userEmail: string
    className?: string
}

export function EmailNotVerifiedAlert({ userEmail, className }: EmailNotVerifiedAlertProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('Verify email to continue processing.')
    const [emailSent, setEmailSent] = useState(false)
    const router = useRouter()

    const handleSendVerification = async () => {
        setIsLoading(true)
        setMessage('')

        try {
            const result = await sendVerificationEmailAction()

            if (result.success) {
                setMessage('Verification email sent! Please check your inbox and click the link to verify your email address. You may come back and refresh the page after verifying.')
                setEmailSent(true)
                setTimeout(() => router.refresh(), 3000)
            } else {
                setMessage(result.message)
            }
        } catch {
            setMessage('Failed to send email. Try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Alert
            className={cn(
            emailSent
                ? "border-green-500 bg-green-50"
                : message && !emailSent
                ? "border-destructive bg-destructive/10"
                : "border-destructive bg-Card",
            className
            )}
        >
            <AlertDescription className="flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="space-y-1 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <p className="text-sm font-medium">
                            {`Please verify your email to continue (${userEmail})`}
                        </p>
                    </div>
                    {message && (
                        <p className={cn("text-xs", emailSent ? "text-green-600" : "text-red-600")}>
                            {isLoading ? <Skeleton className='h-6 w-full' /> : message}
                        </p>
                    )}
                </div>
                <Button
                    onClick={handleSendVerification}
                    disabled={isLoading}
                    size="sm"
                    className="ml-4"
                >
                    {isLoading ? (
                        <Loading color='white' size='sm' />
                    ) : (
                        <>
                            <Send className="h-3 w-3 mr-1" />
                            {emailSent ? 'Resend' : 'Send Email'}
                        </>
                    )}
                </Button>
            </AlertDescription>
        </Alert>
    )
}