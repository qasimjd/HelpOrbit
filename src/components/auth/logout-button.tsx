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
}

export function LogoutButton({ 
  children, 
  className,
  variant = "ghost" 
}: LogoutButtonProps) {
  const router = useRouter()
  
  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/select-organization')
          },
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
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
          Sign out
        </>
      )}
    </Button>
  )
}