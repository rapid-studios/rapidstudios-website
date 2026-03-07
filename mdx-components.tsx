import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ className, ...props }) => (
      <h2
        className={[
          "mt-12 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]",
          className
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        className={[
          "mt-8 text-xl font-semibold text-[var(--color-text-primary)]",
          className
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    ),
    p: ({ className, ...props }) => (
      <p
        className={[
          "mt-4 text-base leading-8 text-[var(--color-text-secondary)]",
          className
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    ),
    ul: ({ className, ...props }) => (
      <ul
        className={[
          "mt-4 list-disc space-y-3 pl-5 text-base leading-8 text-[var(--color-text-secondary)]",
          className
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    ),
    strong: ({ className, ...props }) => (
      <strong
        className={["font-semibold text-[var(--color-text-primary)]", className].filter(Boolean).join(" ")}
        {...props}
      />
    ),
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={[
          "mt-6 rounded-[var(--radius-lg)] border border-[var(--color-line-subtle)] bg-white/70 px-6 py-5 text-lg leading-8 text-[var(--color-text-primary)] shadow-[var(--shadow-soft)]",
          className
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    ),
    ...components
  };
}
