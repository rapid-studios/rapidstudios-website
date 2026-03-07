"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StatusPanel } from "@/components/ui/status-panel";

export default function CaseStudyError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="py-12">
      <StatusPanel
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={reset} type="button">
              Try again
            </Button>
            <Button asChild variant="secondary">
              <Link href="/work">Back to work</Link>
            </Button>
          </div>
        }
        description="The case study could not be rendered. Retry once, or return to the work index."
        meta="Error state"
        title="This case study is unavailable."
        tone="error"
      />
    </Container>
  );
}
