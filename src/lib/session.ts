import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { cache } from "react";

export const getServerSession = cache(async () => {
    "use server";
    try {
        const session = await auth.api.getSession({ headers: await headers() })
        console.log('Session check result:', session ? 'Session found' : 'No session')
        return session
    } catch (error) {
        console.error('Session check error:', error)
        return null
    }
});

/**
 * Get the current user session and throw if not authenticated
 */
export async function requireServerSession() {
  const session = await getServerSession()
  
  if (!session?.user) {
    throw new Error('Unauthorized: No valid session found')
  }
  
  return session
}

/**
 * Check if user has access to a specific organization
 */
export async function checkOrganizationAccess(organizationSlug: string) {
  try {
    console.log('Checking organization access for:', organizationSlug)
    const session = await requireServerSession()
    
    // Get user's organizations
    const userOrgs = await auth.api.listOrganizations({
      headers: await headers()
    })

    console.log('User organizations:', userOrgs?.length || 0)

    const hasAccess = userOrgs?.some((org: { slug: string }) => 
      org.slug === organizationSlug
    )

    if (!hasAccess) {
      console.log('User does not have access to organization:', organizationSlug)
      throw new Error(`Unauthorized: No access to organization ${organizationSlug}`)
    }

    console.log('User has access to organization:', organizationSlug)
    return { session, organization: userOrgs?.find((org: { slug: string }) => org.slug === organizationSlug) }
  } catch (error) {
    console.error('Check organization access error:', error)
    throw error
  }
}
