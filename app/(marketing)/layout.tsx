import { CalendlyBadgeWidget } from "@/components/integrations/calendly";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo/json-ld";

export default function MarketingLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="marketing-shell">
      <JsonLd data={[getOrganizationSchema(), getWebSiteSchema()]} />
      <SiteHeader />
      <main className="relative z-10 overflow-x-clip">{children}</main>
      <SiteFooter />
      <CalendlyBadgeWidget />
    </div>
  );
}
