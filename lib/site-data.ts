import type { NavItem, PricingPlan, ProcessStep } from "@/types/content";

export const siteConfig = {
  name: "Rapid Studios",
  description:
    "Rapid Studios helps product teams design and launch polished digital products -- from positioning and UI to production frontend delivery.",
  url: "https://rapidstudios.dev",
  email: "hello@rapidstudios.dev"
};

export const navigation: NavItem[] = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" }
];

export const footerNavigation: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/pricing", label: "Pricing" }
];

export const trustSignals = [
  "Seed SaaS",
  "AI tooling",
  "Product launch teams",
  "Design-forward founders",
  "Operator-led brands"
];

export const processSteps: ProcessStep[] = [
  {
    step: "01",
    title: "Research",
    description: "Reference mining, positioning calibration, and page-structure decisions before pixels get expensive."
  },
  {
    step: "02",
    title: "Direction",
    description: "Information architecture, design language, and conversion priorities locked into a clear system."
  },
  {
    step: "03",
    title: "Design",
    description: "High-confidence layouts, typography, and motion tuned to look premium without slowing the story down."
  },
  {
    step: "04",
    title: "Build",
    description: "Production-ready Next.js implementation with reusable sections, MDX content, and state coverage."
  },
  {
    step: "05",
    title: "Launch",
    description: "Final QA, analytics hooks, polish passes, and a handoff that keeps future edits easy."
  }
];

export const homeProcessSteps: ProcessStep[] = [
  {
    step: "01",
    title: "Research",
    description: "Reference gathering, positioning, and homepage structure decisions."
  },
  {
    step: "02",
    title: "Design",
    description: "Wireframes, visual system, motion rules, and polished Figma layouts."
  },
  {
    step: "03",
    title: "Ship",
    description: "Production implementation, QA, and launch support tuned for speed and quality."
  }
];

export const collaborationPrinciples = [
  {
    title: "Fast feedback loops",
    description: "Decisions happen against real layouts and code, not endless decks."
  },
  {
    title: "Taste plus structure",
    description: "The site needs to feel premium and still convert clearly on the first pass."
  },
  {
    title: "Build-aware design",
    description: "Motion, states, and layouts are chosen with production constraints in mind."
  }
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Focused Sprint",
    summary: "For teams that need a sharper homepage, launch page, or strategic refresh quickly.",
    price: "From $4k",
    details: ["1-2 core pages", "Messaging and section rhythm", "Motion direction", "Delivery in days, not weeks"],
    cta: "Book a sprint"
  },
  {
    name: "Website Engagement",
    summary: "A full marketing site with approved structure, reusable sections, and implementation-ready polish.",
    price: "From $9k",
    featured: true,
    details: ["Multi-page architecture", "Case-study and services system", "Responsive design and motion", "Production frontend delivery"],
    cta: "Plan the site"
  },
  {
    name: "Ongoing Partner",
    summary: "A retained studio relationship for launches, iterations, and continuous marketing improvements.",
    price: "Custom",
    details: ["Launch support", "Ongoing optimization", "New landing pages", "Design-system consistency"],
    cta: "Talk partnership"
  }
];

export const faqNotes = [
  "Every engagement starts with a short discovery call and scope alignment.",
  "Copy and visuals can be refined during the build, but the structure is locked early.",
  "Pricing stays premium on purpose: fewer pages, stronger decisions, cleaner execution."
];
