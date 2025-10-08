"use client"

import React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl" | number
  text?: string
  className?: string
  fullPage?: boolean
  color?: string
}

export function Loading({
  size = "md",
  text,
  className,
  fullPage = false,
  color,
}: LoadingProps) {
  const sizeMap: Record<"sm" | "md" | "lg" | "xl", string> = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  }

  const iconSize =
    typeof size === "number" ? { width: size, height: size } : undefined
  const sizeClass = typeof size === "string" ? sizeMap[size] : ""

  const colorClass = color
    ? color.startsWith("text-")
      ? color
      : `text-${color}`
    : "text-brand-primary"

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-2",
        fullPage && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <Loader2
        className={cn("animate-spin", sizeClass, colorClass)}
        style={iconSize}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}
