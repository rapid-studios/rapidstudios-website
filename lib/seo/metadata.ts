import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-data";

const ogImage = {
  url: `${siteConfig.url}/opengraph-image`,
  width: 1200,
  height: 630,
  alt: "Rapid Studios -- Digital Products Designed to Ship",
  type: "image/png"
};

type PageMetadataInput = {
  title: string;
  description: string;
  pathname: string;
};

export function buildMetadata({ title, description, pathname }: PageMetadataInput): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`;
  const url = new URL(pathname, siteConfig.url);

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: [ogImage]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.url]
    }
  };
}
