import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Testimonial } from "@/types/content";

type TestimonialsSectionProps = {
  testimonials: Testimonial[];
};

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="pt-24">
      <Container>
        <SectionHeading
          description="Short proof blocks with context, placed after the offer and process already make sense."
          title="Trust should arrive in layers."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {testimonials.slice(0, 2).map((testimonial, index) => (
            <Reveal delay={index * 0.05} key={testimonial.name}>
              <article className="surface-card h-full p-6 sm:p-7">
                <blockquote className="font-display text-[1.65rem] font-semibold leading-[1.18] tracking-[-0.04em] text-[var(--color-text-primary)]">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
                <div className="mt-5 text-sm text-[var(--color-text-secondary)]">
                  <p className="font-semibold text-[var(--color-text-primary)]">{testimonial.name}</p>
                  <p className="mt-1">{testimonial.role}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
