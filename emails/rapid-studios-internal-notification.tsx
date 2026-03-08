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

const font =
  "'Space Grotesk',Manrope,Inter,ui-sans-serif,system-ui,-apple-system,sans-serif";

export function InternalNotification({ inquiry }: Props) {
  const timestamp = new Date().toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  });

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
          }
        `}</style>
      </Head>
      <Preview>New inquiry from {inquiry.name}{inquiry.company ? ` at ${inquiry.company}` : ""}</Preview>
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
                            <Img src="https://rapidstudios.dev/email-icon.png" width="18" height="18" alt="" style={{ display: "block" }} />
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
            <Text style={headingText}>New Lead Inquiry</Text>
            <Text style={timestampStyle}>{timestamp}</Text>

            {/* Lead details */}
            <Section style={detailsBox}>
              <Text style={detailsLabel}>Contact Details</Text>
              <table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td style={detailKey}>Name</td>
                    <td style={detailVal}>{inquiry.name}</td>
                  </tr>
                  <tr>
                    <td style={detailKey}>Email</td>
                    <td style={detailVal}>
                      <Link href={`mailto:${inquiry.email}`} style={{ color: "#3b82f6", textDecoration: "none" }}>{inquiry.email}</Link>
                    </td>
                  </tr>
                  {inquiry.company ? (
                    <tr>
                      <td style={detailKey}>Company</td>
                      <td style={detailVal}>{inquiry.company}</td>
                    </tr>
                  ) : null}
                  {inquiry.projectType ? (
                    <tr>
                      <td style={detailKey}>Project Type</td>
                      <td style={detailVal}>{inquiry.projectType}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </Section>

            {/* Project brief */}
            <Section style={briefBox}>
              <Text style={briefLabel}>Project Brief</Text>
              <Text style={briefText}>{inquiry.note}</Text>
            </Section>

            {/* Quick actions */}
            <Text style={bodyTextStyle}>
              <Link href={`mailto:${inquiry.email}?subject=Re: Your inquiry to Rapid Studios`} style={replyLink}>
                Reply to {inquiry.name} &rarr;
              </Link>
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
            <Text style={footerNote}>
              This notification was sent by the Rapid Studios contact form.
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

export default InternalNotification;

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

const headingText: React.CSSProperties = {
  fontFamily: font,
  fontSize: "22px",
  fontWeight: 800,
  color: "#ffffff",
  lineHeight: "1.3",
  letterSpacing: "-0.02em",
  margin: "0 0 4px",
};

const timestampStyle: React.CSSProperties = {
  fontFamily: font,
  fontSize: "12px",
  color: "#4a5e78",
  margin: "0 0 24px",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  padding: "16px 20px",
  margin: "0 0 20px",
};

const detailsLabel: React.CSSProperties = {
  fontFamily: font,
  fontSize: "11px",
  fontWeight: 700,
  color: "#4a5e78",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  margin: "0 0 10px",
};

const detailKey: React.CSSProperties = {
  fontFamily: font,
  fontSize: "12px",
  fontWeight: 600,
  color: "#4a5e78",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  padding: "6px 12px 6px 0",
  verticalAlign: "top",
  width: "110px",
};

const detailVal: React.CSSProperties = {
  fontFamily: font,
  fontSize: "14px",
  color: "#ffffff",
  padding: "6px 0",
  verticalAlign: "top",
};

const briefBox: React.CSSProperties = {
  backgroundColor: "rgba(59, 138, 240, 0.06)",
  borderRadius: "12px",
  border: "1px solid rgba(59, 138, 240, 0.15)",
  padding: "16px 20px",
  margin: "0 0 24px",
};

const briefLabel: React.CSSProperties = {
  fontFamily: font,
  fontSize: "11px",
  fontWeight: 700,
  color: "#3b82f6",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  margin: "0 0 10px",
};

const briefText: React.CSSProperties = {
  fontFamily: font,
  fontSize: "14px",
  color: "#8b9ab5",
  lineHeight: "1.7",
  margin: "0",
  whiteSpace: "pre-wrap",
};

const bodyTextStyle: React.CSSProperties = {
  fontFamily: font,
  fontSize: "14px",
  color: "#cbd5e1",
  margin: "0",
  lineHeight: "1.8",
};

const replyLink: React.CSSProperties = {
  fontFamily: font,
  fontSize: "14px",
  fontWeight: 600,
  color: "#3b82f6",
  textDecoration: "none",
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

const footerNote: React.CSSProperties = {
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
