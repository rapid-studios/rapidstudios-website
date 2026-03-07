import { Container } from "@/components/ui/container";

export function WorkSkeletonGrid() {
  return (
    <Container className="grid gap-6 py-12 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="surface-card animate-pulse p-5" key={index}>
          <div className="h-56 rounded-[var(--radius-lg)] bg-slate-200/70" />
          <div className="mt-5 h-6 w-2/3 rounded-full bg-slate-200/70" />
          <div className="mt-3 h-4 w-full rounded-full bg-slate-200/60" />
          <div className="mt-2 h-4 w-4/5 rounded-full bg-slate-200/50" />
        </div>
      ))}
    </Container>
  );
}

export function CaseStudySkeleton() {
  return (
    <Container className="space-y-8 py-14">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 rounded-full bg-slate-200/70" />
        <div className="h-14 w-3/4 rounded-[var(--radius-md)] bg-slate-200/70" />
        <div className="h-6 w-2/3 rounded-full bg-slate-200/60" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="surface-card animate-pulse p-8">
          <div className="h-72 rounded-[var(--radius-lg)] bg-slate-200/70" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="surface-card animate-pulse p-6" key={index}>
              <div className="h-4 w-20 rounded-full bg-slate-200/70" />
              <div className="mt-4 h-8 w-28 rounded-full bg-slate-200/60" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
