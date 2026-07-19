import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-data";

export default function robots(): MetadataRoute.Robots {
  return {
    host: siteConfig.url,
    rules: [
      {
        allow: "/",
        disallow: ["/studio", "/api/cms"],
        userAgent: "*"
      }
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`
  };
}
