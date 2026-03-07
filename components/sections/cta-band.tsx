import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site-data";

type CtaBandProps = {
  title?: string;
  description?: string;
  primary?: {
    href: string;
    label: string;
  };
  secondary?: {
    href: string;
    label: string;
  };
};

export function CtaBand({
  title = "Need a site that feels credible in the first ten seconds?",
  description = "Start with a short project note, then move into scope and launch timing once the direction is clear.",
  primary = {
    href: "/contact",
    label: "Start a project"
  },
  secondary = {
    href: `mailto:${siteConfig.email}`,
    label: siteConfig.email
  }
}: CtaBandProps) {
  return (
    <section className="py-24">
      <Container>
        <Reveal className="cta-shell px-6 py-8 sm:px-10 sm:py-12">
          <div className="max-w-3xl">
            <h2 className="font-display text-4xl font-bold tracking-[-0.06em] text-[var(--color-text-primary)] sm:text-5xl">
              {title}
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg">{description}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="large">
              <Link href={primary.href}>{primary.label}</Link>
            </Button>
            <Button asChild size="large" variant="secondary">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
