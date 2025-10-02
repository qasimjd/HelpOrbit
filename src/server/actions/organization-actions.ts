"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireServerSession } from "@/lib/session";
import type {
  UpdateOrganizationInput,
  ActionResponse,
  OrganizationData,
  FullOrganization,
  OrganizationListResponse,
} from "@/types/auth-organization";
import { 
  createOrganizationSchema,
  updateOrganizationSchema,
  type CreateOrganizationData
} from "@/schemas/organization";
import { getOrganizationBySlug, getOrganizations, getUserOrganizations } from "@/server/db/queries";

/**
 * Create a new organization
 */
export async function createOrganizationAction(
  input: CreateOrganizationData
): Promise<ActionResponse<OrganizationData>> {
  try {
    // Ensure user is authenticated
    await requireServerSession();
    
    const validatedInput = createOrganizationSchema.parse(input);

    // Check if slug is available
    const slugCheck = await auth.api.checkOrganizationSlug({
      body: { slug: validatedInput.slug },
      headers: await headers(),
    });

    if (!slugCheck?.status) {
      return {
        success: false,
        error: "Organization slug is already taken",
      };
    }

    const result = await auth.api.createOrganization({
      body: validatedInput,
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to create organization",
      };
    }

    return {
      success: true,
      data: result as unknown as OrganizationData,
    };
  } catch (error) {
    console.error("Create organization error:", error);
    
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create organization",
    };
  }
}

/**
 * Update an organization
 */
export async function updateOrganizationAction(
  input: UpdateOrganizationInput
): Promise<ActionResponse<OrganizationData>> {
  try {
    // Ensure user is authenticated
    await requireServerSession();
    
    const validatedInput = updateOrganizationSchema.parse(input);

    // If updating slug, check availability
    if (validatedInput.slug) {
      const slugCheck = await auth.api.checkOrganizationSlug({
        body: { slug: validatedInput.slug },
        headers: await headers(),
      });

      if (!slugCheck?.status) {
        return {
          success: false,
          error: "Organization slug is already taken",
        };
      }
    }

    const result = await auth.api.updateOrganization({
      body: {
        organizationId: validatedInput.id,
        data: {
          name: validatedInput.name,
          slug: validatedInput.slug,
          logo: validatedInput.logo,
          metadata: validatedInput.metadata,
        },
      },
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to update organization",
      };
    }

    return {
      success: true,
      data: result as OrganizationData,
    };
  } catch (error) {
    console.error("Update organization error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update organization",
    };
  }
}

/**
 * Delete an organization
 */
export async function deleteOrganizationAction(
  organizationId: string
): Promise<ActionResponse<void>> {
  try {
    if (!organizationId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }

    await auth.api.deleteOrganization({
      body: { organizationId },
      headers: await headers(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete organization error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete organization",
    };
  }
}

/**
 * List user's organizations
 */
export async function listOrganizationsAction(): Promise<ActionResponse<OrganizationListResponse>> {
  try {
    // Ensure user is authenticated
    await requireServerSession();
    
    const result = await auth.api.listOrganizations({
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to fetch organizations",
      };
    }

    return {
      success: true,
      data: {
        organizations: result as OrganizationData[],
        count: result.length,
      },
    };
  } catch (error) {
    console.error("List organizations error:", error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return {
        success: false,
        error: "Authentication required. Please sign in and try again.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch organizations",
    };
  }
}

/**
 * List user's organizations with member data
 */
export async function listUserOrganizationsAction(): Promise<ActionResponse<any[]>> {
  try {
    // Ensure user is authenticated
    const session = await requireServerSession();
    
    const userOrgs = await getUserOrganizations(session.user.id);

    return {
      success: true,
      data: userOrgs,
    };
  } catch (error) {
    console.error("List user organizations error:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch user organizations",
    };
  }
}/**
 * Get full organization details
 */
export async function getFullOrganizationAction(
  organizationId?: string
): Promise<ActionResponse<FullOrganization>> {
  try {
    // Ensure user is authenticated
    await requireServerSession();
    
    const result = await auth.api.getFullOrganization({
      query: organizationId ? { organizationId } : {},
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    return {
      success: true,
      data: result as FullOrganization,
    };
  } catch (error) {
    console.error("Get full organization error:", error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return {
        success: false,
        error: "Authentication required. Please sign in and try again.",
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch organization",
    };
  }
}

/**
 * Set active organization
 */
export async function setActiveOrganizationAction(
  organizationId: string | null
): Promise<ActionResponse<void>> {
  try {
    // Ensure user is authenticated
    await requireServerSession();
    
    await auth.api.setActiveOrganization({
      body: { organizationId },
      headers: await headers(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Set active organization error:", error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return {
        success: false,
        error: "Authentication required. Please sign in and try again.",
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to set active organization",
    };
  }
}

/**
 * Leave organization
 */
export async function leaveOrganizationAction(
  organizationId: string
): Promise<ActionResponse<void>> {
  try {
    if (!organizationId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }

    await auth.api.leaveOrganization({
      body: { organizationId },
      headers: await headers(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Leave organization error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to leave organization",
    };
  }
}

/**
 * Check if organization slug is available
 */
export async function checkOrganizationSlugAction(
  slug: string
): Promise<ActionResponse<{ available: boolean }>> {
  try {
    if (!slug) {
      return {
        success: false,
        error: "Slug is required",
      };
    }

    const result = await auth.api.checkOrganizationSlug({
      body: { slug },
      headers: await headers(),
    });

    return {
      success: true,
      data: { available: result?.status || false },
    };
  } catch (error) {
    console.error("Check slug error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check slug availability",
    };
  }
}

/**
 * Search organizations by name, slug, or domain
 */
export async function searchOrganizations(searchTerm: string) {
  if (!searchTerm.trim()) {
    return [];
  }

  try {
    const organizations = await getOrganizations();
    
    // Filter organizations based on search term
    return organizations
      .filter(org => {
        const metadata = org.metadata || {};
        const name = org.name.toLowerCase();
        const slug = org.slug.toLowerCase();
        const domain = metadata.domain?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return name.includes(search) || 
               slug.includes(search) || 
               domain.includes(search);
      })
      .map(org => {
        const metadata = org.metadata || {};
        return {
          id: org.id,
          slug: org.slug,
          name: org.name,
          domain: metadata.domain,
          logoUrl: org.logo,
          primaryColor: metadata.primaryColor || '#6b7280',
          isPublic: metadata.isPublic || false
        };
      });
  } catch (error) {
    console.error('Error searching organizations:', error);
    return [];
  }
}

/**
 * Get organization information by slug
 */
export async function getOrganizationInfo(slug: string) {
  try {
    const org = await getOrganizationBySlug(slug);
    if (!org) return null;
    
    const metadata = org.metadata || {};
    return {
      id: org.id,
      slug: org.slug,
      name: org.name,
      domain: metadata.domain,
      logoUrl: org.logo,
      primaryColor: metadata.primaryColor || '#6b7280',
      isPublic: metadata.isPublic || false
    };
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
}