"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

interface SwitchOrganizationButtonProps {
  className?: string
  children?: React.ReactNode
  href?: string
  asChild?: boolean
  variant?: "link" | "button"
  clearSession?: boolean // optional prop
}

export function SwitchOrganizationButton({
  className,
  children = "Switch organization",
  href = "/select-organization",
  variant = "link",
  clearSession = false, // default false
}: SwitchOrganizationButtonProps) {
  const router = useRouter()

  const handleSwitchOrganization = (e: React.MouseEvent) => {
    e.preventDefault()

    if (typeof window !== "undefined") {
      if (clearSession) {
        // Logout → clear both
        localStorage.clear()
        sessionStorage.clear()
      } else {
        // Switch org → clear only localStorage
        localStorage.clear()
      }
    }

    router.push(href)
  }

  if (variant === "button") {
    return (
      <button
        onClick={handleSwitchOrganization}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "h-10 px-4 py-2",
          className
        )}
      >
        {children}
      </button>
    )
  }

  return (
    <Link
      href={href}
      onClick={handleSwitchOrganization}
      className={cn(
        "text-sm opacity-70 hover:opacity-100 inline-flex items-center group transition-opacity text-foreground",
        className
      )}
    >
      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
      {children}
    </Link>
  )
}
