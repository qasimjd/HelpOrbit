"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import type {
  ActionResponse,
  InvitationData,
  InvitationListResponse,
  InviteMemberInput,
} from "@/types/auth-organization";
import {
  invitationIdSchema,
  listInvitationsSchema
} from "@/schemas/invitation";
import { inviteMemberSchema } from "@/schemas";

/**
 * Send an invitation to join an organization
 */
export async function inviteMemberAction(
  input: InviteMemberInput & { resend?: boolean }
): Promise<ActionResponse<InvitationData>> {
  try {
    const validatedInput = inviteMemberSchema.parse(input);

    const result = await auth.api.createInvitation({
      body: validatedInput,
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to create invitation",
      };
    }

    return {
      success: true,
      data: result as InvitationData,
    };
  } catch (error) {
    console.error("Invite member error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send invitation",
    };
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitationAction(
  invitationId: string
): Promise<ActionResponse<{ member: any; organization: any }>> {
  try {
    const validatedInput = invitationIdSchema.parse({ invitationId });

    const result = await auth.api.acceptInvitation({
      body: { invitationId: validatedInput.invitationId },
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to accept invitation",
      };
    }

    return {
      success: true,
      data: {
        member: result.member,
        organization: result.invitation ? { id: result.invitation.organizationId } : null,
      } as { member: any; organization: any },
    };
  } catch (error) {
    console.error("Accept invitation error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid invitation ID",
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept invitation",
    };
  }
}

/**
 * Reject an invitation
 */
export async function rejectInvitationAction(
  invitationId: string
): Promise<ActionResponse<void>> {
  try {
    const validatedInput = invitationIdSchema.parse({ invitationId });

    await auth.api.rejectInvitation({
      body: { invitationId: validatedInput.invitationId },
      headers: await headers(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Reject invitation error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid invitation ID",
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject invitation",
    };
  }
}

/**
 * Cancel an invitation (for organization admins)
 */
export async function cancelInvitationAction(
  invitationId: string
): Promise<ActionResponse<void>> {
  try {
    const validatedInput = invitationIdSchema.parse({ invitationId });

    await auth.api.cancelInvitation({
      body: { invitationId: validatedInput.invitationId },
      headers: await headers(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Cancel invitation error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid invitation ID",
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel invitation",
    };
  }
}

/**
 * Get invitation details
 */
export async function getInvitationAction(
  invitationId: string
): Promise<ActionResponse<InvitationData>> {
  try {
    const validatedInput = invitationIdSchema.parse({ invitationId });

    const result = await auth.api.getInvitation({
      query: { id: validatedInput.invitationId },
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Invitation not found",
      };
    }

    return {
      success: true,
      data: {
        ...result,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as InvitationData,
    };
  } catch (error) {
    console.error("Get invitation error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid invitation ID",
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get invitation",
    };
  }
}

/**
 * List invitations for an organization
 */
export async function listInvitationsAction(
  organizationId?: string
): Promise<ActionResponse<InvitationListResponse>> {
  try {
    const validatedInput = listInvitationsSchema.parse({ organizationId });

    const result = await auth.api.listInvitations({
      query: validatedInput.organizationId ? { organizationId: validatedInput.organizationId } : {},
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to fetch invitations",
      };
    }

    const invitations = Array.isArray(result) ? result : (result as any)?.invitations || [];

    return {
      success: true,
      data: {
        invitations: invitations as InvitationData[],
        count: invitations.length,
      },
    };
  } catch (error) {
    console.error("List invitations error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch invitations",
    };
  }
}

/**
 * List invitations for the current user
 */
export async function listUserInvitationsAction(): Promise<ActionResponse<InvitationListResponse>> {
  try {
    const result = await auth.api.listUserInvitations({
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to fetch user invitations",
      };
    }

    const invitations = Array.isArray(result) ? result : (result as any)?.invitations || [];

    return {
      success: true,
      data: {
        invitations: invitations as InvitationData[],
        count: invitations.length,
      },
    };
  } catch (error) {
    console.error("List user invitations error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch user invitations",
    };
  }
}

/**
 * Resend an invitation
 */
export async function resendInvitationAction(
  invitationId: string
): Promise<ActionResponse<InvitationData>> {
  try {
    // Get the invitation details first
    const invitation = await getInvitationAction(invitationId);
    
    if (!invitation.success || !invitation.data) {
      return {
        success: false,
        error: "Invitation not found",
      };
    }

    // Resend by creating a new invitation with resend flag
    const result = await inviteMemberAction({
      organizationId: invitation.data.organizationId,
      email: invitation.data.email,
      role: invitation.data.role,
      resend: true,
    });

    return result;
  } catch (error) {
    console.error("Resend invitation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resend invitation",
    };
  }
}