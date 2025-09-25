import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  // This layout is for authentication pages only
  // Don't redirect from select-organization page as it's a special case
  // that can be accessed by both authenticated and unauthenticated users
  
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}