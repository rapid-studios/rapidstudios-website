import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text
} from "@react-email/components";

import type { ContactInquiry } from "@/lib/email/resend";

type Props = {
  inquiry: ContactInquiry;
};

const BRAND_ICON_BASE64 =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik00IDE0YTEgMSAwIDAgMS0uNzgtMS42M2w5LjktMTAuMmEuNS41IDAgMCAxIC44Ni40NmwtMS45MiA2LjAyQTEgMSAwIDAgMCAxMyAxMGg3YTEgMSAwIDAgMSAuNzggMS42M2wtOS45IDEwLjJhLjUuNSAwIDAgMS0uODYtLjQ2bDEuOTItNi4wMkExIDEgMCAwIDAgMTEgMTR6Ii8+PC9zdmc+";

const font =
  "'Space Grotesk',Manrope,Inter,ui-sans-serif,system-ui,-apple-system,sans-serif";

export function InquiryConfirmation({ inquiry }: Props) {
  const firstName = inquiry.name.split(" ")[0] || inquiry.name;

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
        <style>{`
          :root { color-scheme: dark; supported-color-schemes: dark; }
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; width: 100%; word-break: break-word; -webkit-font-smoothing: antialiased; }
          @media only screen and (max-width: 620px) {
            .outer { padding: 24px 12px !important; }
            .body-pad { padding: 32px 24px !important; }
            .cta-pad { padding: 36px 24px !important; }
          }
        `}</style>
      </Head>
      <Preview>We received your inquiry and will follow up shortly -- Rapid Studios</Preview>
      <Body style={outer}>
        <Container style={wrapper}>
          {/* ── 1. HEADER ── */}
          <Section style={headerWrap}>
            <table role="presentation" cellPadding="0" cellSpacing="0" style={{ display: "inline-table", backgroundColor: "#131a27", border: "1px solid #1e2d45", borderRadius: "100px" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "11px 22px 11px 16px", verticalAlign: "middle" }}>
                    <table role="presentation" cellPadding="0" cellSpacing="0">
                      <tbody>
                        <tr>
                          <td style={{ verticalAlign: "middle", paddingRight: "9px", lineHeight: 0 }}>
                            <Img src={BRAND_ICON_BASE64} width="18" height="18" alt="Rapid Studios" style={{ display: "block" }} />
                          </td>
                          <td style={{ verticalAlign: "middle" }}>
                            <span style={{ fontFamily: font, fontSize: "13px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.09em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>
                              RAPID STUDIOS
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* ── 2. BODY ── */}
          <Section style={bodyCard}>
            <Text style={bodyText}>Hi {firstName},</Text>
            <Text style={bodyText}>
              Thank you for reaching out to Rapid Studios. We received your message and are reviewing the details -- we&apos;ll follow up shortly with our recommended direction, any clarifying questions, and a clear next step.
            </Text>

            {/* Inquiry summary */}
            {(inquiry.company || inquiry.projectType) && (
              <Section style={summaryBox}>
                <Text style={summaryLabel}>Your inquiry</Text>
                {inquiry.company && (
                  <Text style={summaryItem}><strong style={{ color: "#ffffff" }}>Company:</strong> {inquiry.company}</Text>
                )}
                {inquiry.projectType && (
                  <Text style={summaryItem}><strong style={{ color: "#ffffff" }}>Project type:</strong> {inquiry.projectType}</Text>
                )}
                <Text style={summaryItem}><strong style={{ color: "#ffffff" }}>Brief:</strong> {inquiry.note}</Text>
              </Section>
            )}

            <Text style={bodyText}>
              In the meantime, feel free to reply directly with your goals, timeline, links to references, or anything else helpful. The more context we have, the faster we can move.
            </Text>

            <Text style={{ ...bodyText, marginBottom: "2px" }}>Talk soon,</Text>
            <Text style={{ fontFamily: font, fontSize: "16px", margin: "0", lineHeight: "1.8" }}>
              <strong style={{ color: "#ffffff", fontWeight: 700 }}>The Rapid Studios Team</strong>
            </Text>
          </Section>

          {/* ── 3. CTA STRIP ── */}
          <Section style={ctaStrip}>
            <Row>
              <Column style={{ verticalAlign: "middle" }}>
                <Text style={ctaHeadline}>
                  Digital Products Designed to{" "}
                  <span style={{ fontStyle: "italic", color: "#3b8af0", fontWeight: 800 }}>Ship.</span>
                </Text>
                <Text style={ctaSub}>Premium studio. Fast delivery. Real results.</Text>
              </Column>
              <Column style={{ verticalAlign: "middle", textAlign: "right" as const, whiteSpace: "nowrap" as const, paddingLeft: "16px" }}>
                <Link href="https://rapidstudios.dev/contact" style={ctaPrimary}>Book a Call</Link>
                <Link href="https://rapidstudios.dev/work" style={ctaSecondary}>View Work &rarr;</Link>
              </Column>
            </Row>
          </Section>

          {/* ── 4. FOOTER ── */}
          <Section style={footerSection}>
            <Hr style={footerDivider} />
            <Text style={footerLinks}>
              <Link href="https://rapidstudios.dev/work" style={footerLink}>Work</Link>
              {"  "}
              <Link href="https://rapidstudios.dev/services" style={footerLink}>Services</Link>
              {"  "}
              <Link href="https://rapidstudios.dev/process" style={footerLink}>Process</Link>
              {"  "}
              <Link href="https://rapidstudios.dev/contact" style={footerLink}>Contact</Link>
            </Text>
            <Text style={footerContact}>
              Questions? <Link href="mailto:hello@rapidstudios.dev" style={{ color: "#3b82f6", textDecoration: "none" }}>hello@rapidstudios.dev</Link>
            </Text>
            <Text style={footerCopyright}>
              &copy; {new Date().getFullYear()} Rapid Studios. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default InquiryConfirmation;

// ── Styles ──

const outer: React.CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: "#0d1117",
};

const wrapper: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "40px 16px",
  fontFamily: font,
};

const headerWrap: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "28px",
};

const bodyCard: React.CSSProperties = {
  backgroundColor: "#0f1623",
  border: "1px solid #1e2d45",
  borderRadius: "16px",
  padding: "40px 44px",
  marginBottom: "12px",
};

const bodyText: React.CSSProperties = {
  fontFamily: font,
  fontSize: "16px",
  color: "#cbd5e1",
  margin: "0 0 18px",
  lineHeight: "1.8",
};

const summaryBox: React.CSSProperties = {
  backgroundColor: "rgba(59, 138, 240, 0.06)",
  borderRadius: "12px",
  border: "1px solid rgba(59, 138, 240, 0.15)",
  padding: "16px 20px",
  margin: "8px 0 24px",
};

const summaryLabel: React.CSSProperties = {
  fontFamily: font,
  fontSize: "11px",
  fontWeight: 700,
  color: "#3b82f6",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  margin: "0 0 10px",
};

const summaryItem: React.CSSProperties = {
  fontFamily: font,
  fontSize: "14px",
  color: "#8b9ab5",
  lineHeight: "1.6",
  margin: "0 0 6px",
};

const ctaStrip: React.CSSProperties = {
  backgroundColor: "#0a1020",
  border: "1px solid #1e2d45",
  borderRadius: "16px",
  padding: "20px 44px",
  marginBottom: "6px",
};

const ctaHeadline: React.CSSProperties = {
  fontFamily: font,
  fontSize: "15px",
  fontWeight: 800,
  color: "#ffffff",
  lineHeight: "1.15",
  letterSpacing: "-0.02em",
  margin: "0",
};

const ctaSub: React.CSSProperties = {
  fontFamily: font,
  fontSize: "11px",
  color: "#4a5e78",
  marginTop: "3px",
  lineHeight: "1.4",
  margin: "3px 0 0",
};

const ctaPrimary: React.CSSProperties = {
  fontFamily: font,
  fontSize: "12px",
  fontWeight: 700,
  color: "#ffffff",
  textDecoration: "none",
  display: "inline-block",
  padding: "9px 18px",
  backgroundColor: "#3b8af0",
  borderRadius: "100px",
  whiteSpace: "nowrap",
};

const ctaSecondary: React.CSSProperties = {
  fontFamily: font,
  fontSize: "12px",
  fontWeight: 600,
  color: "#8b9ab5",
  textDecoration: "none",
  display: "inline-block",
  padding: "9px 14px",
  whiteSpace: "nowrap",
};

const footerSection: React.CSSProperties = {
  marginTop: "32px",
};

const footerDivider: React.CSSProperties = {
  border: "none",
  height: "1px",
  backgroundColor: "#1e2d45",
  marginBottom: "24px",
};

const footerLinks: React.CSSProperties = {
  fontFamily: font,
  fontSize: "12px",
  color: "#8b9ab5",
  textAlign: "center",
  margin: "0 0 14px",
  lineHeight: "1",
};

const footerLink: React.CSSProperties = {
  color: "#8b9ab5",
  textDecoration: "none",
  margin: "0 10px",
};

const footerContact: React.CSSProperties = {
  fontFamily: font,
  fontSize: "11px",
  color: "#3a4d63",
  textAlign: "center",
  margin: "0 0 8px",
  lineHeight: "1.6",
};

const footerCopyright: React.CSSProperties = {
  fontFamily: font,
  fontSize: "11px",
  color: "#3a4d63",
  textAlign: "center",
  margin: "0",
  lineHeight: "1.6",
};
