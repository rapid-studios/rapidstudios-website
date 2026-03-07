import type { ServiceEntry } from "@/types/content";

type ServiceCardProps = {
  service: ServiceEntry;
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="interactive-card surface-card h-full p-6 sm:p-7">
      <span className="inline-flex rounded-full border border-[var(--color-line-subtle)] bg-[rgba(15,183,167,0.1)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-brand-accent)]">
        {service.title.split(" ")[0]}
      </span>
      <h3 className="mt-5 max-w-[14ch] font-display text-[1.7rem] font-semibold leading-[1.1] tracking-[-0.05em] text-[var(--color-text-primary)]">
        {service.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{service.summary}</p>
    </article>
  );
}
