"use server";

import { cookies, headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import type {
  InviteMemberInput,
  UpdateMemberRoleInput,
  RemoveMemberInput,
  ActionResponse,
  MemberData,
  MemberListResponse,
  MemberRole,
} from "@/types/auth-organization";

// Validation schemas
const inviteMemberSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(["owner", "admin", "member"]),
});

const updateMemberRoleSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
  role: z.enum(["owner", "admin", "member"]),
});

const removeMemberSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  memberIdOrEmail: z.string().min(1, "Member ID or email is required"),
});

const listMembersSchema = z.object({
  organizationId: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Add a member directly to an organization (without invitation)
 */
export async function addMemberAction(
  input: {
    organizationId: string;
    userId: string;
    role: MemberRole;
  }
): Promise<ActionResponse<MemberData>> {
  try {
    const validatedInput = z.object({
      organizationId: z.string().min(1),
      userId: z.string().min(1),
      role: z.enum(["owner", "admin", "member"]),
    }).parse(input);

    const result = await auth.api.addMember({
      body: validatedInput,
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to add member",
      };
    }

    return {
      success: true,
      data: result as MemberData,
    };
  } catch (error) {
    console.error("Add member error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add member",
    };
  }
}

/**
 * Update a member's role
 */
export async function updateMemberRoleAction(
  input: UpdateMemberRoleInput
): Promise<ActionResponse<MemberData>> {
  try {
    const validatedInput = updateMemberRoleSchema.parse(input);

    const result = await auth.api.updateMemberRole({
      body: validatedInput,
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to update member role",
      };
    }

    return {
      success: true,
      data: result as MemberData,
    };
  } catch (error) {
    console.error("Update member role error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update member role",
    };
  }
}

/**
 * Remove a member from an organization
 */
export async function removeMemberAction(
  input: RemoveMemberInput
): Promise<ActionResponse<void>> {
  try {
    const validatedInput = removeMemberSchema.parse(input);

    await auth.api.removeMember({
      body: validatedInput,
      headers: await headers(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Remove member error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}

/**
 * List organization members
 */
export async function listMembersAction(
  input?: {
    organizationId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }
): Promise<ActionResponse<MemberListResponse>> {
  try {
    const validatedInput = listMembersSchema.parse(input || {});

    const result = await auth.api.listMembers({
      query: validatedInput,
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to fetch members",
      };
    }

    // Handle array response or paginated response
    const members = Array.isArray(result) ? result : result.members || [];
    const count = Array.isArray(result) ? result.length : result.total || members.length;

    return {
      success: true,
      data: {
        members: members as MemberData[],
        count,
        pagination: validatedInput.limit ? {
          page: Math.floor(validatedInput.offset / validatedInput.limit) + 1,
          limit: validatedInput.limit,
          total: count,
        } : undefined,
      },
    };
  } catch (error) {
    console.error("List members error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch members",
    };
  }
}

/**
 * Get active member (current user's membership in active organization)
 */
export async function getActiveMemberAction(): Promise<ActionResponse<MemberData>> {
  try {
    const result = await auth.api.getActiveMember({
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "No active membership found",
      };
    }

    return {
      success: true,
      data: result as MemberData,
    };
  } catch (error) {
    console.error("Get active member error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get active member",
    };
  }
}

/**
 * Get active member role
 */
export async function getActiveMemberRoleAction(): Promise<ActionResponse<{ role: MemberRole }>> {
  try {
    const result = await auth.api.getActiveMemberRole({
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "No active membership found",
      };
    }

    return {
      success: true,
      data: { role: result.role as MemberRole },
    };
  } catch (error) {
    console.error("Get active member role error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get active member role",
    };
  }
}

/**
 * Check if user has specific permission
 */
export async function hasPermissionAction(
  permissions: Record<string, string[]>
): Promise<ActionResponse<{ hasPermission: boolean }>> {
  try {
    const result = await auth.api.hasPermission({
      body: { permissions },
      headers: await headers(),
    });

    return {
      success: true,
      data: { hasPermission: !!result },
    };
  } catch (error) {
    console.error("Check permission error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check permission",
    };
  }
}