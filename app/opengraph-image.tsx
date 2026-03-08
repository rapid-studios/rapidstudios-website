import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rapid Studios -- Digital Products Designed to Ship";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0d1117",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Subtle gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #3b8af0 0%, #3b82f6 50%, #3b8af0 100%)",
          }}
        />

        {/* Brand pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid #1e2d45",
            borderRadius: "100px",
            padding: "12px 28px",
            marginBottom: "48px",
            background: "#131a27",
          }}
        >
          {/* Lightning bolt icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
          </svg>
          <span
            style={{
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
            }}
          >
            RAPID STUDIOS
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0px",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: "64px",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            Digital Products
          </span>
          <span
            style={{
              color: "#ffffff",
              fontSize: "64px",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            Designed to{" "}
            <span style={{ color: "#3b8af0", fontStyle: "italic" }}>Ship</span>
          </span>
        </div>

        {/* Subtitle */}
        <span
          style={{
            color: "#8b9ab5",
            fontSize: "22px",
            fontWeight: 500,
            marginTop: "32px",
            letterSpacing: "0.02em",
          }}
        >
          Premium product design and frontend delivery
        </span>

        {/* URL */}
        <span
          style={{
            position: "absolute",
            bottom: "40px",
            color: "#4a5e78",
            fontSize: "16px",
            fontWeight: 600,
            letterSpacing: "0.08em",
          }}
        >
          rapidstudios.dev
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
