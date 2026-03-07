"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StatusPanel } from "@/components/ui/status-panel";

export default function WorkError({
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
              <Link href="/contact">Contact instead</Link>
            </Button>
          </div>
        }
        description="The work list could not load. Retry once, or use the contact path if you need a project conversation immediately."
        meta="Error state"
        title="The portfolio list is unavailable."
        tone="error"
      />
    </Container>
  );
}
