import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StatusPanel } from "@/components/ui/status-panel";

export default function NotFound() {
  return (
    <main className="pt-28">
      <Container className="py-12">
        <StatusPanel
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/">Go home</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/contact">Start a project</Link>
              </Button>
            </div>
          }
          description="The route does not exist yet, but the main site structure is in place."
          meta="Not found"
          title="This page is missing."
          tone="muted"
        />
      </Container>
    </main>
  );
}
