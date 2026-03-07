import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceCard } from "@/components/ui/service-card";
import type { ServiceEntry } from "@/types/content";

type HomeServicesProps = {
  services: ServiceEntry[];
};

export function HomeServices({ services }: HomeServicesProps) {
  return (
    <section className="pt-24">
      <Container>
        <SectionHeading
          action={
            <Button asChild size="sm" variant="secondary">
              <Link href="/services">See all services</Link>
            </Button>
          }
          align="split"
          description="Three focused offers, framed around business outcomes first and deliverables second."
          title="A small studio system built to move quickly."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal delay={index * 0.06} key={service.slug}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
