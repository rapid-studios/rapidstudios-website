import type { Metadata } from "next";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";

import { Analytics } from "@vercel/analytics/next";

import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo/json-ld";
import { siteConfig } from "@/lib/site-data";

import "../styles/globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const stitch = Inter({
  subsets: ["latin"],
  variable: "--font-stitch"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-icon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${stitch.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([getOrganizationSchema(), getWebSiteSchema()])
          }}
          type="application/ld+json"
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
