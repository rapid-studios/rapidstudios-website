import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <main className="pt-28">
      <Container className="py-16">
        <Reveal>
          <section className="cta-shell p-10 md:p-16">
            <span className="protocol-label">404 Artifact Not Found</span>
            <h1 className="mt-8 text-[clamp(3.6rem,8vw,6.5rem)] font-black uppercase leading-[0.9] tracking-[-0.08em] text-[var(--color-text-primary)]">
              The route
              <br />
              <span className="text-[var(--color-brand-primary-strong)]">does not exist.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              The path is missing from the published archive. Return to the homepage or take the direct project-intake path instead.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="large">
                <Link href="/">Go home</Link>
              </Button>
              <Button asChild size="large" variant="secondary">
                <Link href="/contact">Start a project</Link>
              </Button>
            </div>
          </section>
        </Reveal>
      </Container>
    </main>
  );
}
