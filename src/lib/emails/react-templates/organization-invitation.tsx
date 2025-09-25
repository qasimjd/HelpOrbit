import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface OrganizationInvitationTemplateProps {
  inviteeName?: string;
  inviterName: string;
  organizationName: string;
  role: string;
  invitationUrl: string;
}

export function OrganizationInvitationTemplate({
  inviteeName,
  inviterName,
  organizationName,
  role,
  invitationUrl,
}: OrganizationInvitationTemplateProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={heading}>
              You&apos;re invited to join <strong>{organizationName}</strong>
            </Text>

            <Text style={text}>
              Hi {inviteeName || 'there'},
            </Text>

            <Text style={text}>
              {inviterName} has invited you to join <strong>{organizationName}</strong> as a {role}.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={invitationUrl}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={smallText}>
              If you don&apos;t want to join this organization, you can safely ignore this email.
            </Text>
            <Text style={smallText}>
              This invitation will expire in 48 hours.
            </Text>

            <Text style={footer}>
              – The HelpOrbit Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f9fafb',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '32px',
  borderRadius: '8px',
  maxWidth: '480px',
};

const heading = {
  fontSize: '20px',
  fontWeight: '600',
  marginBottom: '16px',
  color: '#111827',
};

const text = {
  fontSize: '16px',
  color: '#374151',
  margin: '12px 0',
};

const smallText = {
  fontSize: '14px',
  color: '#6b7280',
  marginTop: '12px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: 'var(--brand-primary)', // your brand color
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
  padding: '12px 24px',
  display: 'inline-block',
};

const footer = {
  fontSize: '13px',
  color: '#9ca3af',
  marginTop: '24px',
  textAlign: 'center' as const,
};

export default OrganizationInvitationTemplate;
