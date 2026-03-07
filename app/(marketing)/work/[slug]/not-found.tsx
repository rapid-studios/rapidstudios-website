import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StatusPanel } from "@/components/ui/status-panel";

export default function CaseStudyNotFound() {
  return (
    <Container className="py-12">
      <StatusPanel
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/work">Back to work</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/contact">Start a project</Link>
            </Button>
          </div>
        }
        description="The route exists in the site structure, but this case study is not published yet."
        meta="Empty state"
        title="Case study coming soon."
        tone="muted"
      />
    </Container>
  );
}
