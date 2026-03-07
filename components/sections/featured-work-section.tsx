import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProjectCard } from "@/components/ui/project-card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { CaseStudyEntry } from "@/types/content";

type FeaturedWorkSectionProps = {
  caseStudies: CaseStudyEntry[];
};

export function FeaturedWorkSection({ caseStudies }: FeaturedWorkSectionProps) {
  return (
    <section className="pt-24">
      <Container>
        <SectionHeading
          action={
            <Button asChild size="sm" variant="secondary">
              <Link href="/work">View all work</Link>
            </Button>
          }
          align="split"
          description="Selected projects presented as case-study-led proof, not a dense gallery."
          title="Proof that feels editorial, not crowded."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {caseStudies.map((study, index) => (
            <Reveal delay={index * 0.06} key={study.slug}>
              <ProjectCard study={study} variant="featured" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
