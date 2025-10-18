import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

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
            {/* Heading */}
            <Text style={heading}>
              You&apos;re Invited to Join {organizationName}
            </Text>

            {/* Greeting */}
            <Text style={text}>
              Hi {inviteeName || "there"},
            </Text>

            {/* Intro */}
            <Text style={text}>
              {inviterName} has invited you to join <strong>{organizationName}</strong> as a{" "}
              <strong>{role}</strong>. Accept the invitation to start collaborating with your team.
            </Text>

            {/* Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={invitationUrl}>
                Accept Invitation
              </Button>
            </Section>

            {/* Extra info */}
            <Text style={subText}>
              If you don’t want to join this organization, you can safely ignore this email.
            </Text>
            <Text style={subText}>
              For security reasons, this invitation will expire in 48 hours.
            </Text>

            <Hr style={hr} />

            {/* Footer */}
            <Text style={footer}>
              Best, <br />
              The HelpOrbit Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ===== Styles (matching EmailVerificationTemplate) ===== */
const main = {
  backgroundColor: "hsl(var(--background))",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif",
  padding: "24px",
};

const container = {
  backgroundColor: "hsl(var(--card))",
  borderRadius: "12px",
  margin: "0 auto",
  padding: "32px 24px",
  maxWidth: "480px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
};

const heading = {
  fontSize: "24px",
  fontWeight: 600,
  color: "hsl(var(--foreground))",
  marginBottom: "16px",
};

const text = {
  color: "hsl(var(--foreground))",
  fontSize: "16px",
  lineHeight: "26px",
  marginBottom: "16px",
};

const subText = {
  color: "hsl(var(--muted-foreground))",
  fontSize: "14px",
  lineHeight: "22px",
  marginBottom: "8px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "hsl(var(--primary))",
  borderRadius: "8px",
  color: "hsl(var(--primary-foreground))",
  fontSize: "16px",
  fontWeight: 500,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const hr = {
  borderColor: "hsl(var(--border))",
  margin: "32px 0",
};

const footer = {
  color: "hsl(var(--muted-foreground))",
  fontSize: "14px",
};

export default OrganizationInvitationTemplate;
