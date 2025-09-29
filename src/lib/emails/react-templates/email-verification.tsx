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

interface EmailVerificationTemplateProps {
  userName: string;
  verificationUrl: string;
}

export function EmailVerificationTemplate({
  userName,
  verificationUrl,
}: EmailVerificationTemplateProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section>
            {/* Heading */}
            <Text style={heading}>Verify Your Email</Text>

            {/* Greeting */}
            <Text style={text}>
              Hi {userName || "there"},
            </Text>

            {/* Intro */}
            <Text style={text}>
              Welcome to <strong>HelpOrbit</strong> 🎉 Please confirm your email
              to activate your account and start exploring.
            </Text>

            {/* Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={verificationUrl}>
                Verify Email
              </Button>
            </Section>

            {/* Extra info */}
            <Text style={subText}>
              Didn’t sign up? You can safely ignore this email.
            </Text>
            <Text style={subText}>
              For security reasons, this link will expire in 24 hours.
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

/* ===== Styles (using shadcn color tokens) ===== */
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

export default EmailVerificationTemplate;
