import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { collaborationPrinciples, homeProcessSteps, processSteps } from "@/lib/site-data";

type ProcessSectionProps = {
  detailed?: boolean;
};

export function ProcessSection({ detailed = false }: ProcessSectionProps) {
  const steps = detailed ? processSteps : homeProcessSteps;

  return (
    <section className="pt-24">
      <Container>
        <SectionHeading
          description={
            detailed
              ? "A clear sequence that makes the work feel low-friction and well-managed from the first call."
              : "A concise, high-confidence system that signals rigor without overexplaining the work."
          }
          title={detailed ? "A fast, structured process." : "Reliable process without the heavy agency ceremony."}
        />
        <div className={`mt-10 grid gap-5 ${detailed ? "lg:grid-cols-5" : "lg:grid-cols-3"}`}>
          {steps.map((step, index) => (
            <Reveal delay={index * 0.04} key={step.step}>
              <article className="surface-card h-full p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
                  {step.step}
                </p>
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{step.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
        {detailed ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {collaborationPrinciples.map((item, index) => (
              <Reveal delay={0.08 + index * 0.04} key={item.title}>
                <article className="surface-card h-full p-6">
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{item.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
