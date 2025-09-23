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
    invitation
} from "@/server/db/schema";
import { sendEmail } from "@/lib/emal";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { passwordSchema } from "@/lib/schemas";



export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Reset your password",
                html: `<p>Hi ${user.name || user.email},</p>
                       <p>Please click the link below to reset your password:</p>
                       <a href="${url}">${url}</a>
                       <p>If you did not request a password reset, you can safely ignore this email.</p>
                       <p>Thank you!</p>
                       <p>The Authyfy Team</p>
                       `,
            });
        }
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Verify your email",
                html: `<p>Hi ${user.name || user.email},</p>
                       <p>Please click the link below to verify your email address:</p>
                       <a href="${url}">${url}</a>
                       <p>If you did not create an account, you can safely ignore this email.</p>
                       <p>Thank you!</p>
                       <p>The Authyfy Team</p>
                       `,
            });
        }
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (
                ctx.path === "/sign-up/email" ||
                ctx.path === "/reset-password" ||
                ctx.path === "/change-password"
            ) {
                const password = ctx.body?.password || ctx.body?.newPassword;
                const { error } = passwordSchema.safeParse(password);
                if (error) {
                    throw new APIError("BAD_REQUEST", { message: error.message });
                }
            }
        })
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
            invitation
        },
    }),
    plugins: [
        organization({
            allowUserToCreateOrganization: true,
            organizationLimit: 5,
            membershipLimit: 100,
            invitationExpiresIn: 60 * 60 * 48, // 48 hours
            sendInvitationEmail: async (data) => {
                const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/org/${data.organization.slug}/accept-invitation/${data.id}`;
                await sendEmail({
                    to: data.email,
                    subject: `You're invited to join ${data.organization.name}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2>You're invited to join ${data.organization.name}</h2>
                            <p>Hi there,</p>
                            <p>${data.inviter.user.name || data.inviter.user.email} has invited you to join <strong>${data.organization.name}</strong> as a ${data.role}.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${inviteLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Accept Invitation
                                </a>
                            </div>
                            <p>If you don't want to join this organization, you can safely ignore this email.</p>
                            <p>This invitation will expire in 48 hours.</p>
                            <p>Best regards,<br>The HelpOrbit Team</p>
                        </div>
                    `,
                });
            },
        }),
        nextCookies()
    ] // make sure this is the last plugin in the array
})

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;