"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function MarketingLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <SiteHeader />
      <main className={`relative overflow-x-clip ${isHome ? "" : "pt-28"}`}>{children}</main>
      {isHome ? null : <SiteFooter />}
    </>
  );
}
