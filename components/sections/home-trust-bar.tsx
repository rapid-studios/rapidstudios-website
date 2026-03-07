import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { trustSignals } from "@/lib/site-data";

export function HomeTrustBar() {
  return (
    <section className="pt-8">
      <Container>
        <Reveal>
          <h2 className="font-display text-[2rem] font-semibold tracking-[-0.05em] text-[var(--color-text-primary)]">
            Trust band
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
            Placeholder proof strip for logos, referrals, and product teams that trust the studio.
          </p>
          <div className="surface-card mt-5 p-5 sm:p-6">
            <div className="flex flex-wrap gap-3">
              {trustSignals.map((item) => (
                <span className="rounded-full border border-[var(--color-line-subtle)] bg-white/82 px-4 py-2 text-sm text-[var(--color-text-secondary)]" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
