import { siteConfig } from "@/lib/site-data";
import type { CaseStudyMeta, ServiceMeta } from "@/types/content";

export type JsonLdValue = string | number | boolean | null | JsonLdObject | readonly JsonLdValue[];

export type JsonLdObject = {
  readonly [property: string]: JsonLdValue;
};

export type JsonLdReference = { readonly "@id": string };
export type JsonLdNode = JsonLdObject & JsonLdReference;
export type JsonLdData = JsonLdObject | readonly JsonLdObject[];

export type WebPageSchemaInput = {
  pathname: string;
  title: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "FAQPage";
  mainEntity?: JsonLdObject | readonly JsonLdObject[];
};

export type BreadcrumbItem = {
  readonly name: string;
  readonly pathname: string;
};

export type FaqItem = {
  readonly question: string;
  readonly answer: string;
};

const context = "https://schema.org";
const language = "en-US";
const absoluteUrl = (pathname: string) => new URL(pathname, siteConfig.url).toString();
const organizationId = absoluteUrl("/#organization");
const websiteId = absoluteUrl("/#website");

export function getOrganizationSchema(): JsonLdNode {
  return {
    "@context": context,
    "@type": "Organization",
    "@id": organizationId,
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    description: siteConfig.description,
    logo: absoluteUrl("/apple-icon.png"),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "project inquiries",
      email: siteConfig.email,
      url: absoluteUrl("/contact")
    }
  };
}

export function getWebSiteSchema(): JsonLdNode {
  return {
    "@context": context,
    "@type": "WebSite",
    "@id": websiteId,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: language,
    publisher: { "@id": organizationId }
  };
}

export function getWebPageSchema({
  pathname,
  title,
  description,
  type = "WebPage",
  mainEntity
}: WebPageSchemaInput): JsonLdNode {
  const url = absoluteUrl(pathname);

  return {
    "@context": context,
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: language,
    isPartOf: { "@id": websiteId },
    about: { "@id": organizationId },
    ...(url !== absoluteUrl("/") && { breadcrumb: { "@id": `${url}#breadcrumb` } }),
    ...(mainEntity && { mainEntity })
  };
}

export function getBreadcrumbSchema(items: readonly BreadcrumbItem[], pathname: string): JsonLdNode {
  return {
    "@context": context,
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(pathname)}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.pathname)
    }))
  };
}

export function getServiceSchema(service: ServiceMeta): JsonLdNode {
  const url = absoluteUrl(`/services#${encodeURIComponent(service.slug)}`);

  return {
    "@context": context,
    "@type": "Service",
    "@id": url,
    url,
    name: service.title,
    description: service.summary,
    serviceType: service.title,
    provider: { "@id": organizationId },
    mainEntityOfPage: { "@id": `${absoluteUrl("/services")}#webpage` }
  };
}

export function getCaseStudySchema(study: CaseStudyMeta, image: string): JsonLdNode {
  const url = absoluteUrl(`/work/${encodeURIComponent(study.slug)}`);

  return {
    "@context": context,
    "@type": "CreativeWork",
    "@id": `${url}#creativework`,
    url,
    name: study.title,
    description: study.summary,
    image: absoluteUrl(image),
    genre: "Case study",
    inLanguage: language,
    author: { "@id": organizationId },
    publisher: { "@id": organizationId },
    mainEntityOfPage: { "@id": `${url}#webpage` }
  };
}

/** Supply the same question/answer records used by the visible FAQ component. */
export function getFaqSchema(faqs: readonly FaqItem[], pathname: string) {
  const url = absoluteUrl(pathname);

  return {
    "@context": context,
    "@type": "FAQPage",
    "@id": `${url}#webpage`,
    url,
    inLanguage: language,
    isPartOf: { "@id": websiteId },
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer
      }
    }))
  };
}

/** Prevent CMS or content text from closing the HTML script element. */
export function serializeJsonLd(data: JsonLdData): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
