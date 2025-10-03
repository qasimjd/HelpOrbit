"use client"

import React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/branding/theme-provider"
import { useTheme as useNextTheme } from "next-themes"

interface BrandedLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showFallback?: boolean
  className?: string
  helpOrbit?: boolean
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-20 w-20",
}

interface BrandedTextLogoProps {
  showTagline?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  helpOrbit?: boolean
}

export function BrandedLogo({
  size = "md",
  showFallback = true,
  className,
  helpOrbit = false,
}: BrandedLogoProps) {
  const { organization, branding } = useTheme()
  const { theme } = useNextTheme()

  const [imageError, setImageError] = React.useState(false)

  const logoUrl = helpOrbit
    ? "/logos/helporbit-logo.svg"
    : branding.logoUrl || organization?.logoUrl || "/logos/helporbit-logo.svg"

  const altText = helpOrbit
    ? "HelpOrbit logo"
    : organization?.name
      ? `${organization.name} logo`
      : "HelpOrbit logo"

  React.useEffect(() => {
    setImageError(false)
  }, [logoUrl])

  const shouldShowFallback = !logoUrl || imageError

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      {!shouldShowFallback ? (
        <Image
          src={logoUrl}
          alt={altText}
          fill
          className={cn(
            "object-contain rounded-lg",
            logoUrl === "/logos/helporbit-logo.svg" && // only affect default logo
            (theme === "dark" ? "invert" : "")
          )} priority={size === "lg" || size === "xl"}
          onError={() => {
            setImageError(true)
            if (logoUrl !== "/logos/helporbit-logo.svg") {
              console.warn(
                "Failed to load organization logo, falling back to default"
              )
            }
          }}
        />
      ) : (
        showFallback && (
          <div
            className={cn(
              "flex items-center justify-center rounded-lg text-foreground font-semibold bg-brand-primary shadow-sm",
              sizeClasses[size]
            )}
            style={{
              backgroundColor:
                organization?.primaryColor ||
                branding.primaryColor
            }}
          >
            {helpOrbit
              ? "H"
              : organization?.name?.charAt(0).toUpperCase() || "H"}
          </div>
        )
      )}
    </div>
  )
}

export function BrandedTextLogo({
  showTagline = false,
  size = "md",
  className,
  helpOrbit = false,
}: BrandedTextLogoProps) {
  const { organization } = useTheme()

  const headingSizeClasses: Record<
    NonNullable<BrandedTextLogoProps["size"]>,
    string
  > = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  }

  const taglineSizeClasses: Record<
    NonNullable<BrandedTextLogoProps["size"]>,
    string
  > = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <h1 className={cn("font-bold", headingSizeClasses[size])}>
        {helpOrbit ? "HelpOrbit" : organization?.name || "HelpOrbit"}
      </h1>
      {showTagline && (
        <p className={cn("mt-1 text-muted-foreground", taglineSizeClasses[size])}>
          {helpOrbit
            ? "Multi-tenant ticketing system"
            : organization
              ? "Support Portal"
              : "Multi-tenant ticketing system"}
        </p>
      )}
    </div>
  )
}

interface LogoWithTextProps {
  size?: "sm" | "md" | "lg" | "xl"
  orientation?: "horizontal" | "vertical"
  showTagline?: boolean
  showLogo?: boolean
  interactive?: boolean
  className?: string
  onClick?: () => void
  helpOrbit?: boolean
}

export function LogoWithText({
  size = "md",
  orientation = "horizontal",
  showTagline = false,
  showLogo = true,
  interactive = false,
  className,
  onClick,
  helpOrbit = false,
}: LogoWithTextProps) {
  const { organization } = useTheme()

  const isVertical = orientation === "vertical"
  const baseClasses = cn(
    "flex items-center",
    isVertical ? "flex-col space-y-2" : "flex-row space-x-3",
    interactive &&
    "cursor-pointer transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded-md",
    className
  )

  const content = (
    <>
      {showLogo && <BrandedLogo size={size} helpOrbit={helpOrbit} />}
      <BrandedTextLogo
        showTagline={showTagline}
        size={size}
        helpOrbit={helpOrbit}
      />
    </>
  )

  if (interactive || onClick) {
    return (
      <button
        className={baseClasses}
        onClick={onClick}
        type="button"
        aria-label={`${organization?.name || "HelpOrbit"} logo`}
      >
        {content}
      </button>
    )
  }

  return <div className={baseClasses}>{content}</div>
}

export function OrgLogoWithText(
  props: Omit<LogoWithTextProps, "showLogo">
) {
  return <LogoWithText {...props} showLogo={true} />
}

export function CompactOrgLogo({
  className,
  onClick,
  helpOrbit = false,
}: Pick<LogoWithTextProps, "className" | "onClick" | "helpOrbit">) {
  return (
    <LogoWithText
      size="sm"
      orientation="horizontal"
      showTagline={false}
      interactive={!!onClick}
      onClick={onClick}
      className={className}
      helpOrbit={helpOrbit}
    />
  )
}

export function FullBrandingLogo({
  className,
  helpOrbit = false,
}: Pick<LogoWithTextProps, "className" | "helpOrbit">) {
  return (
    <LogoWithText
      size="xl"
      orientation="vertical"
      showTagline={true}
      className={className}
      helpOrbit={helpOrbit}
    />
  )
}
