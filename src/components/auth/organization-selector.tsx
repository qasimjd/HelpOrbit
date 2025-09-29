"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, Plus, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useListOrganizations, useActiveOrganization } from "@/lib/auth-client";
import { setActiveOrganizationAction } from "@/server/actions/organization-actions";
import type { OrganizationData, MemberRole } from "@/types/auth-organization";

interface OrganizationSelectorProps {
  onCreateNew?: () => void;
  className?: string;
}

interface ExtendedOrganization extends OrganizationData {
  role?: MemberRole;
  memberCount?: number;
}

export function OrganizationSelector({ onCreateNew, className }: OrganizationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  
  const { data: organizations } = useListOrganizations();
  const { data: activeOrganization } = useActiveOrganization();

  const handleOrganizationSwitch = async (organizationId: string) => {
    setSwitching(true);
    try {
      const result = await setActiveOrganizationAction(organizationId);
      if (result.success) {
        setOpen(false);
        // Refresh the page to update the organization context
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to switch organization:", error);
    } finally {
      setSwitching(false);
    }
  };

  const getRoleColor = (role: MemberRole) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "member":
        return "bg-green-100 text-green-800 border-green-300";
      case "guest":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[280px] justify-between", className)}
          disabled={switching}
        >
          <div className="flex items-center gap-2 min-w-0">
            {activeOrganization ? (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={activeOrganization.logo || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(activeOrganization.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{activeOrganization.name}</span>
              </>
            ) : (
              <>
                <Building className="h-4 w-4" />
                <span>Select organization...</span>
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organizations found.</CommandEmpty>
            {organizations && organizations.length > 0 && (
              <CommandGroup heading="Your Organizations">
                {organizations.map((org) => {
                  const isActive = activeOrganization?.id === org.id;
                  const extendedOrg = org as ExtendedOrganization;
                  
                  return (
                    <CommandItem
                      key={org.id}
                      value={org.name}
                      onSelect={() => !isActive && handleOrganizationSwitch(org.id)}
                      className="flex items-center justify-between p-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={org.logo ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(org.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">{org.name}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            @{org.slug}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {extendedOrg.role && (
                          <Badge variant="outline" className={getRoleColor(extendedOrg.role)}>
                            {extendedOrg.role}
                          </Badge>
                        )}
                        {isActive && <Check className="h-4 w-4" />}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  onCreateNew?.();
                }}
                className="flex items-center gap-2 p-2"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-md border border-dashed border-muted-foreground/50">
                  <Plus className="h-4 w-4" />
                </div>
                <span>Create new organization</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}