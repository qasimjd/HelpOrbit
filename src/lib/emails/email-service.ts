import { render } from '@react-email/render';
import { Resend } from 'resend';
import { EmailVerificationTemplate } from './react-templates/email-verification';
import { PasswordResetTemplate } from './react-templates/password-reset';
import { OrganizationInvitationTemplate } from './react-templates/organization-invitation';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailVerificationProps {
  to: string;
  userName: string;
  verificationUrl: string;
  callbackUrl?: string;
}

interface SendPasswordResetProps {
  to: string;
  userName: string;
  resetUrl: string;
  callbackUrl?: string;
}

interface SendOrganizationInvitationProps {
  to: string;
  inviteeName?: string;
  inviterName: string;
  organizationName: string;
  role: string;
  invitationUrl: string;
  callbackUrl?: string;
}

export async function sendEmailVerification({
  to,
  userName,
  verificationUrl,
  callbackUrl
}: SendEmailVerificationProps) {
  // Use the verification URL as-is since auth configuration handles the redirect
  const emailHtml = await render(
    EmailVerificationTemplate({
      userName,
      verificationUrl,
    })
  );

  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || 'HelpOrbit <noreply@qasimjd.tech>',
    to,
    subject: 'Verify your email address',
    html: emailHtml,
  });

  if (error) {
    throw new Error(`Failed to send email verification: ${error.message}`);
  }

  return data;
}

export async function sendPasswordReset({
  to,
  userName,
  resetUrl,
  callbackUrl
}: SendPasswordResetProps) {
  // Use the reset URL as-is since auth configuration handles the redirect
  const emailHtml = await render(
    PasswordResetTemplate({
      userName,
      resetUrl,
    })
  );

  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || 'HelpOrbit <noreply@qasimjd.tech>',
    to,
    subject: 'Reset your password',
    html: emailHtml,
  });

  if (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }

  return data;
}

export async function sendOrganizationInvitation({
  to,
  inviteeName,
  inviterName,
  organizationName,
  role,
  invitationUrl,
  callbackUrl
}: SendOrganizationInvitationProps) {
  // Use the invitation URL as-is since auth configuration handles the redirect
  const emailHtml = await render(
    OrganizationInvitationTemplate({
      inviteeName,
      inviterName,
      organizationName,
      role,
      invitationUrl,
    })
  );

  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || 'HelpOrbit <noreply@qasimjd.tech>',
    to,
    subject: `You're invited to join ${organizationName}`,
    html: emailHtml,
  });

  if (error) {
    throw new Error(`Failed to send organization invitation: ${error.message}`);
  }

  return data;
}