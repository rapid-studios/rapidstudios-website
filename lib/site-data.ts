import type { NavItem, ProcessStep } from "@/types/content";

export const siteConfig = {
  name: "Rapid Studios",
  description:
    "Rapid Studios builds websites, iOS and Android apps, and practical AI automations for business owners. Start with a 15-minute project call with Travis.",
  url: "https://rapidstudios.dev",
  email: "hello@rapidstudios.dev"
};

export const navigation: NavItem[] = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export const footerNavigation: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing & scope" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
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
    description: "Understand the customer task or manual workflow to improve, review the current tools, and choose a useful first scope."
  },
  {
    step: "02",
    title: "Direction",
    description: "Agree the deliverables, price, milestones, access requirements, and what success will look like before building."
  },
  {
    step: "03",
    title: "Design",
    description: "Review the important screens and customer journeys so you can give feedback before they become finished code."
  },
  {
    step: "04",
    title: "Build",
    description: "Build the agreed website, app, or automation. Review progress and test real tasks, including errors and mobile use."
  },
  {
    step: "05",
    title: "Launch",
    description: "Complete launch checks and handoff. Review feedback and usage, then agree any support or next improvements separately."
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

export const engagementModels = [
  {
    name: "Focused Sprint",
    summary: "Start with one clear problem: a better landing page, a focused prototype, or a repetitive workflow.",
    featured: false,
    details: ["One agreed goal and scope", "Design or workflow review", "Clear deliverables and milestones", "Price and timing agreed before work"]
  },
  {
    name: "Complete Build",
    summary: "Take a website, mobile app, or business workflow from an agreed plan through build and launch preparation.",
    featured: true,
    details: ["Design and implementation", "Required integrations scoped early", "Testing and launch preparation", "Handoff of your custom work"]
  },
  {
    name: "Ongoing Support",
    summary: "Keep improving after launch with maintenance, customer feedback, and a prioritized list of useful updates.",
    featured: false,
    details: ["Maintenance scope agreed separately", "Feedback and usage review", "Prioritized fixes and improvements", "Clear monthly scope and cost"]
  }
] as const;

export const faqNotes = [
  "Every engagement starts with a short discovery call and scope alignment.",
  "Copy and visuals can be refined during the build, but the structure is locked early.",
  "Scope stays intentional on purpose: fewer pages, stronger decisions, cleaner execution."
];
