import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db } from "@/server/db";
import {
    account,
    session,
    user,
    verification,
    organization as organizationTable,
    member,
    invitation,
} from "@/server/db/schema";
import { sendEmailVerification, sendPasswordReset, sendOrganizationInvitation } from "@/lib/emails";
import { ac, roles } from "@/lib/permissions";



export const auth = betterAuth({
    trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", "http://localhost:3000/org"],
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordReset({
                to: user.email,
                userName: user.name || user.email,
                resetUrl: url,
            });
        }
    },
    emailVerification: {
        sendOnSignUp: false,
        autoSignInAfterVerification: true,
        callbackURL: process.env.EMAIL_VERIFICATION_CALLBACK_URL || "/email-verified",
        sendVerificationEmail: async ({ user, url }) => {
            await sendEmailVerification({
                to: user.email,
                userName: user.name || user.email,
                verificationUrl: url,
            });
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user,
            account,
            session,
            verification,
            organization: organizationTable,
            member,
            invitation,
       },
    }),
    plugins: [
        organization({
            allowUserToCreateOrganization: true,
            organizationLimit: 5,
            membershipLimit: 100,
            invitationExpiresIn: 60 * 60 * 48, // 48 hours
            ac, // Access control configuration
            roles, // Custom roles with permissions
            dynamicAccessControl: {
                enabled: true,
                maximumRolesPerOrganization: 20, // Allow custom roles per organization
            },
            sendInvitationEmail: async (data) => {
                const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/org/${data.organization.slug}/accept-invitation/${data.id}`;

                await sendOrganizationInvitation({
                    to: data.email,
                    inviterName: data.inviter.user.name || data.inviter.user.email,
                    organizationName: data.organization.name,
                    role: data.role,
                    invitationUrl: inviteLink,
                    callbackUrl: process.env.ORGANIZATION_INVITATION_CALLBACK_URL || `/org/${data.organization.slug}/dashboard`,
                });
            },
        }),
        nextCookies()
    ] // make sure this is the last plugin in the array
})

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;