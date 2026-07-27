import { CalendlyBadgeWidget } from "@/components/integrations/calendly";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function MarketingLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="marketing-shell">
      <SiteHeader />
      <main className="relative z-10 overflow-x-clip">{children}</main>
      <SiteFooter />
      <CalendlyBadgeWidget />
    </div>
  );
}
