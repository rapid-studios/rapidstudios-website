import { JsonLd } from "@/components/seo/json-ld";
import {
  getBreadcrumbSchema,
  getWebPageSchema,
  type JsonLdObject
} from "@/lib/seo/json-ld";

type PageStructuredDataProps = {
  pathname: string;
  title: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "FAQPage";
  mainEntity?: JsonLdObject | readonly JsonLdObject[];
  ancestors?: readonly { name: string; pathname: string }[];
  entities?: readonly JsonLdObject[];
};

/** Keep page metadata and structured data tied to the same content. */
export function PageStructuredData({ ancestors = [], entities = [], ...page }: PageStructuredDataProps) {
  const breadcrumbs = page.pathname === "/" ? [] : [getBreadcrumbSchema([
    { name: "Home", pathname: "/" },
    ...ancestors,
    { name: page.title, pathname: page.pathname }
  ], page.pathname)];

  return <JsonLd data={[getWebPageSchema(page), ...breadcrumbs, ...entities]} />;
}
