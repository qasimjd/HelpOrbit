// Email Templates
export { EmailVerificationTemplate } from './react-templates/email-verification';
export { PasswordResetTemplate } from './react-templates/password-reset';
export { OrganizationInvitationTemplate } from './react-templates/organization-invitation';

// Email Services
export {
  sendEmailVerification,
  sendPasswordReset,
  sendOrganizationInvitation,
} from './email-service';