import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-data";

type PageMetadataInput = {
  title: string;
  description: string;
  pathname: string;
};

export function buildMetadata({ title, description, pathname }: PageMetadataInput): Metadata {
  const fullTitle = title === siteConfig.name ? siteConfig.name : `${title} | ${siteConfig.name}`;
  const url = new URL(pathname, siteConfig.url);

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description
    }
  };
}
