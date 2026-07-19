import { createHash } from "node:crypto";

import type { SlotType } from "@/lib/cms/types";

export const MANAGED_HOMEPAGE_PUBLISH_TARGET = {
  repository: "rapid-studios/rapidstudios-website",
  branch: "main",
  path: "content/managed/rapidstudios-homepage.json",
  siteId: "rapidstudios",
  pageId: "homepage",
  route: "/",
  domain: "rapidstudios.dev"
} as const;

type EditableSlotType = Extract<SlotType, "text" | "button">;

function slot<const Key extends string>(
  key: Key,
  type: EditableSlotType,
  maxLength: number,
  defaultValue: string
) {
  return { key, type, maxLength, required: true as const, defaultValue };
}

/**
 * The complete, closed set of homepage copy the managed publisher may change.
 * Keys are readable for operators; slot IDs use the CMS' stable
 * `role::semantic-path` SHA-1 convention so Guardian proposals remain opaque.
 */
const SLOT_DEFINITIONS = [
  slot("home.meta.title", "text", 70, "Digital Products Designed to Ship"),
  slot(
    "home.meta.description",
    "text",
    180,
    "Rapid Studios helps product teams design and launch polished digital products -- from positioning and UI to production frontend delivery."
  ),
  slot("home.hero.eyebrow", "text", 45, "Premium Product Studio"),
  slot("home.hero.headlinePrefix", "text", 70, "Digital Products Designed to"),
  slot("home.hero.headlineEmphasis", "text", 24, "Ship"),
  slot(
    "home.hero.description",
    "text",
    220,
    "Rapid Studios helps product teams design and launch polished digital products -- from positioning and UI to production frontend delivery."
  ),
  slot("home.hero.primaryCta", "button", 32, "Book a Discovery Call"),
  slot("home.hero.secondaryCta", "button", 28, "View Our Work"),
  slot("home.audience.label", "text", 24, "Built for"),
  slot("home.audience.item1", "text", 32, "SaaS teams"),
  slot("home.audience.item2", "text", 32, "AI products"),
  slot("home.audience.item3", "text", 32, "Product launches"),
  slot("home.audience.item4", "text", 32, "Founder-led companies"),
  slot("home.audience.item5", "text", 32, "Technical teams"),
  slot("home.differentiators.item1.title", "text", 48, "Positioning First"),
  slot(
    "home.differentiators.item1.description",
    "text",
    160,
    "Story, hierarchy, and conversion logic are locked before design begins."
  ),
  slot("home.differentiators.item2.title", "text", 48, "Designed to Ship"),
  slot(
    "home.differentiators.item2.description",
    "text",
    180,
    "Layouts are built with real code constraints, responsive states, and motion budgets in mind."
  ),
  slot("home.differentiators.item3.title", "text", 48, "Weeks, Not Months"),
  slot(
    "home.differentiators.item3.description",
    "text",
    150,
    "Focused sprints with weekly deliverables. No open-ended timelines."
  ),
  slot("home.differentiators.item4.title", "text", 48, "You Own Everything"),
  slot(
    "home.differentiators.item4.description",
    "text",
    160,
    "Code, design system, content structure, and every asset. No lock-in."
  ),
  slot("home.services.eyebrow", "text", 32, "What We Do"),
  slot("home.services.title", "text", 72, "Three services, one standard."),
  slot(
    "home.services.description",
    "text",
    220,
    "From product strategy to production code, every engagement ends with something polished, credible, and ready to ship."
  ),
  slot("home.services.linkLabel", "text", 28, "All services"),
  slot("home.services.item1.title", "text", 50, "Product Design"),
  slot("home.services.item1.kicker", "text", 50, "Strategy meets interface"),
  slot(
    "home.services.item1.description",
    "text",
    220,
    "Shape the story, structure, and user experience so the product feels credible and converts from the first interaction."
  ),
  slot("home.services.item2.title", "text", 60, "Marketing & Launch Surfaces"),
  slot("home.services.item2.kicker", "text", 50, "Premium digital surfaces"),
  slot(
    "home.services.item2.description",
    "text",
    220,
    "Design and build the public-facing layer -- homepages, landing pages, and campaign surfaces that make the product feel serious."
  ),
  slot("home.services.item3.title", "text", 60, "Frontend Implementation"),
  slot("home.services.item3.kicker", "text", 50, "Design carried to production"),
  slot(
    "home.services.item3.description",
    "text",
    220,
    "Ship in Next.js with reusable components, motion polish, and the state coverage to survive real users."
  ),
  slot("home.portfolio.eyebrow", "text", 32, "Portfolio"),
  slot("home.portfolio.title", "text", 60, "Selected work"),
  slot("home.portfolio.description", "text", 140, "Products we designed, built, and shipped."),
  slot("home.portfolio.linkLabel", "text", 32, "View all projects"),
  slot("home.portfolio.item1.tag", "text", 60, "AI / Developer Tools / Automation"),
  slot("home.portfolio.item1.title", "text", 70, "CodeVerified"),
  slot(
    "home.portfolio.item1.summary",
    "text",
    220,
    "AI-powered code review platform that analyzes repositories and generates actionable engineering reports."
  ),
  slot(
    "home.portfolio.item1.imageAlt",
    "text",
    180,
    "Created a scalable platform for automated technical due diligence on software projects."
  ),
  slot("home.portfolio.item2.tag", "text", 60, "Machine Learning / Financial Systems"),
  slot("home.portfolio.item2.title", "text", 70, "AI Trading Decision Platform"),
  slot(
    "home.portfolio.item2.summary",
    "text",
    220,
    "Machine-learning powered system for evaluating trading signals and ranking opportunities."
  ),
  slot(
    "home.portfolio.item2.imageAlt",
    "text",
    180,
    "Enabled rapid evaluation of trading opportunities and scalable model experimentation."
  ),
  slot("home.portfolio.item3.tag", "text", 60, "AI / Operations Automation"),
  slot("home.portfolio.item3.title", "text", 70, "AI Operations Automation for Physical Therapy"),
  slot(
    "home.portfolio.item3.summary",
    "text",
    240,
    "AI-powered system for streamlining recruiting, financial analysis, and operational decision-making in a growing physical therapy clinic."
  ),
  slot(
    "home.portfolio.item3.imageAlt",
    "text",
    180,
    "Designed a local-first automation system for recruiting, KPI analysis, and clinic planning."
  ),
  slot("home.reasons.eyebrow", "text", 45, "Common Starting Points"),
  slot("home.reasons.title", "text", 70, "Why teams bring us in."),
  slot("home.reasons.item1.title", "text", 100, "\"Our product looks good, but our site doesn't.\""),
  slot(
    "home.reasons.item1.description",
    "text",
    220,
    "The product is strong but the public-facing surface feels templated or rushed. First impressions are costing deals."
  ),
  slot("home.reasons.item2.title", "text", 100, "\"We need to launch and look credible.\""),
  slot(
    "home.reasons.item2.description",
    "text",
    240,
    "A new product, rebrand, or funding round needs polished design and a site that builds trust fast. No time for a 6-month agency engagement."
  ),
  slot("home.reasons.item3.title", "text", 100, "\"We have the vision but not the frontend team.\""),
  slot(
    "home.reasons.item3.description",
    "text",
    220,
    "The design direction exists but there's no one to carry it into production with the right level of craft."
  ),
  slot("home.process.eyebrow", "text", 32, "How It Works"),
  slot("home.process.title", "text", 60, "Research. Design. Ship."),
  slot("home.process.item1.title", "text", 40, "Research"),
  slot(
    "home.process.item1.description",
    "text",
    200,
    "Positioning audit, reference gathering, and page structure locked before design starts."
  ),
  slot("home.process.item2.title", "text", 40, "Design"),
  slot(
    "home.process.item2.description",
    "text",
    200,
    "Visual system, layout composition, and motion direction tuned for conversion and craft."
  ),
  slot("home.process.item3.title", "text", 40, "Ship"),
  slot(
    "home.process.item3.description",
    "text",
    200,
    "Production Next.js build with responsive polish, content wiring, and launch QA."
  ),
  slot("home.process.linkLabel", "text", 36, "See the full process"),
  slot("home.nextSteps.eyebrow", "text", 32, "Getting Started"),
  slot("home.nextSteps.title", "text", 80, "What happens after you reach out."),
  slot(
    "home.nextSteps.description",
    "text",
    160,
    "A short call to see if we're the right fit. No sales pressure, no commitment."
  ),
  slot("home.nextSteps.stepLabel", "text", 16, "Step"),
  slot("home.nextSteps.item1.title", "text", 50, "Discovery Call"),
  slot(
    "home.nextSteps.item1.description",
    "text",
    220,
    "A 30-minute conversation about your product, goals, and what good looks like for your team."
  ),
  slot("home.nextSteps.item2.title", "text", 50, "Proposal"),
  slot(
    "home.nextSteps.item2.description",
    "text",
    220,
    "A clear scope with deliverables, timeline, and pricing -- typically within 48 hours."
  ),
  slot("home.nextSteps.item3.title", "text", 50, "Kickoff"),
  slot(
    "home.nextSteps.item3.description",
    "text",
    220,
    "Research begins immediately. You see real direction within the first week."
  ),
  slot("home.cta.title", "text", 80, "Ready to ship something better?"),
  slot(
    "home.cta.description",
    "text",
    160,
    "Start with a 30-minute call. No pitch deck, no commitment."
  ),
  slot("home.cta.button", "button", 32, "Book a Discovery Call")
] as const;

export type ManagedHomepageSemanticKey = (typeof SLOT_DEFINITIONS)[number]["key"];

function makeManagedSlotId(type: EditableSlotType, semanticKey: string): string {
  const hash = createHash("sha1").update(`${type}::${semanticKey}`).digest("hex").slice(0, 10);
  return `${type}_${hash}`;
}

export const MANAGED_HOMEPAGE_MANIFEST = SLOT_DEFINITIONS.map((definition) => ({
  ...definition,
  slotId: makeManagedSlotId(definition.type, definition.key)
})) as ReadonlyArray<
  (typeof SLOT_DEFINITIONS)[number] & {
    slotId: string;
  }
>;

export const MANAGED_HOMEPAGE_SLOT_IDS = Object.freeze(
  Object.fromEntries(MANAGED_HOMEPAGE_MANIFEST.map(({ key, slotId }) => [key, slotId])) as Record<
    ManagedHomepageSemanticKey,
    string
  >
);

const uniqueSlotIds = new Set(MANAGED_HOMEPAGE_MANIFEST.map(({ slotId }) => slotId));
if (uniqueSlotIds.size !== MANAGED_HOMEPAGE_MANIFEST.length) {
  throw new Error("Managed homepage manifest contains a duplicate CMS slot ID.");
}
