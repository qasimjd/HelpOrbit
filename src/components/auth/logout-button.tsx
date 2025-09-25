"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

interface LogoutButtonProps {
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  afterLogoutRedirect?: string
}

export function LogoutButton({ 
  children, 
  className,
  variant = "ghost" ,
  afterLogoutRedirect,
}: LogoutButtonProps) {
  const router = useRouter()
  
  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Clear any cached data and redirect to login/organization selection
            router.push(afterLogoutRedirect ?? '/select-organization')
          },
          onError: () => {
            // Even if there's an error, redirect to auth page
            router.push(afterLogoutRedirect ?? '/select-organization')
          },
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback redirect even if logout fails
      router.push('/select-organization')
    }
  }

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      className={className}
    >
      {children || (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </>
      )}
    </Button>
  )
}