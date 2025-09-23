import { nextCookies } from "better-auth/next-js"
import { createAuthClient } from "better-auth/react" // make sure to import from better-auth/react
import { inferAdditionalFields } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { auth } from "@/lib/auth";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    basePath: "/api/auth", // Ensure the API path is correctly set
    plugins: [
        inferAdditionalFields<typeof auth>(),
        organizationClient(),
        nextCookies()
    ]
})

export const { 
    useSession, 
    signIn, 
    signOut,
    useListOrganizations,
    useActiveOrganization 
} = authClient;