import type { MetadataRoute } from "next";

import { getAllCaseStudies } from "@/lib/content/case-studies";
import { siteConfig } from "@/lib/site-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/work", "/services", "/process", "/contact", "/pricing"].map((route) => ({
    changeFrequency: "weekly" as const,
    lastModified: new Date(),
    priority: route === "" ? 1 : 0.8,
    url: `${siteConfig.url}${route}`
  }));

  const caseStudyRoutes = getAllCaseStudies().map((entry) => ({
    changeFrequency: "monthly" as const,
    lastModified: new Date(),
    priority: 0.7,
    url: `${siteConfig.url}/work/${entry.slug}`
  }));

  return [...routes, ...caseStudyRoutes];
}
