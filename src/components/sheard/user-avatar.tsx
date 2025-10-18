"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { User } from "@/types/user"
import { getInitials, getUserRoleColor, userRoleIcons } from "@/lib/utils"
import { MemberRole } from "@/types/auth-organization"
import { Badge } from "@/components/ui/badge"

type UserAvatarProps = {
  user: User | null | undefined
  size?: number
  showRole?: boolean
}

const UserAvatar = ({ user, size = 22, showRole }: UserAvatarProps) => {
  const image = user?.image || ""
  const fallback = getInitials(user?.name || "U")
  const RoleIcon = userRoleIcons[user?.role as MemberRole];

  return (
    <div className="relative group inline-block">
      <Link href={`/user/${user?.id || "#"}`}>
        <div
          className="rounded-full shadow-md overflow-hidden cursor-pointer transition-transform duration-150 group-hover:scale-105 bg-brand-surface flex items-center justify-center"
          style={{
            width: `${size}px`,
            height: `${size}px`,
          }}
        >
          {image ? (
            <Image
              src={image}
              alt={user?.name || "User"}
              width={size}
              height={size}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="font-semibold text-[12px]">
              {fallback.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </Link>

      {/* Tooltip on hover */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:flex flex-col items-center w-max rounded-lg bg-background px-3 py-2 shadow-lg z-20 animate-in fade-in-50">
        <span className="font-medium text-primary text-xs">
          {user?.name || "Unknown User"}
        </span>
        <span className="text-xs text-muted-foreground">
          {user?.email || "No email"}
        </span>

        {/* Show role badge when requested */}
        {showRole && user?.role && (
          <Badge
            variant="outline"
            className={`${getUserRoleColor(user.role as MemberRole)} flex items-center gap-1 mt-2`}
          >
            <RoleIcon className="h-3 w-3" />
            {user.role}
          </Badge>
        )}
      </div>
    </div>
  )
}

export default UserAvatar
