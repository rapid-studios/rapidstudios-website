import type { MDXContent } from "mdx/types";

export type NavItem = {
  href: string;
  label: string;
};

export type Metric = {
  label: string;
  value: string;
};

export type Spotlight = {
  title: string;
  description: string;
  label: string;
};

export type CaseStudyMeta = {
  slug: string;
  title: string;
  summary: string;
  client: string;
  year: string;
  tag: string;
  highlight: string;
  services: string[];
  featured: boolean;
  accentFrom: string;
  accentTo: string;
  problem: string;
  solutionBullets: string[];
  technologies: string[];
  architectureHighlights: string[];
  outcome: string;
  metrics: Metric[];
  spotlights: Spotlight[];
};

export type CaseStudyEntry = CaseStudyMeta & {
  Content: MDXContent;
};

export type ServiceMeta = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  deliverables: string[];
  outcomes: string[];
  featured: boolean;
};

export type ServiceEntry = ServiceMeta & {
  Content: MDXContent;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export type ProcessStep = {
  step: string;
  title: string;
  description: string;
};

export type PricingPlan = {
  name: string;
  summary: string;
  price: string;
  featured?: boolean;
  details: string[];
  cta: string;
};
