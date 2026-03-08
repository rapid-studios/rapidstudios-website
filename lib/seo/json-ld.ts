import { siteConfig } from "@/lib/site-data";

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Rapid Studios",
    url: siteConfig.url,
    email: siteConfig.email,
    description: siteConfig.description,
    founder: {
      "@type": "Person",
      name: "Travis Stephenson",
      jobTitle: "Founder & Principal"
    },
    areaServed: "US",
    serviceType: [
      "Product Design",
      "Marketing Website Design",
      "Frontend Development",
      "UI/UX Design"
    ],
    knowsAbout: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "Product Strategy"
    ],
    sameAs: []
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Rapid Studios",
    url: siteConfig.url,
    description: siteConfig.description
  };
}
