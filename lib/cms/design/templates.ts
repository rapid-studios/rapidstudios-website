import { getPreset, type ThemePreset } from "./presets";

export type DesignSectionType =
  | "announcement"
  | "hero"
  | "proof"
  | "product-demo"
  | "benefits"
  | "features"
  | "services"
  | "selected-work"
  | "case-study"
  | "process"
  | "integrations"
  | "pricing"
  | "security"
  | "categories"
  | "products"
  | "product-details"
  | "gallery"
  | "team"
  | "reviews"
  | "service-area"
  | "hours-location"
  | "timeline"
  | "faq"
  | "newsletter"
  | "cta";

export interface DesignSectionRecipe {
  type: DesignSectionType;
  objective: string;
  required: boolean;
}

export interface DesignTemplate {
  id: string;
  name: string;
  bestFor: string;
  description: string;
  primaryConversion: string;
  sections: DesignSectionRecipe[];
  recommendedStyleKitIds: string[];
  promptStarters: string[];
  sourceUrls: string[];
}

const s = (type: DesignSectionType, objective: string, required = true): DesignSectionRecipe => ({
  type,
  objective,
  required,
});

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: "agency-proof",
    name: "Agency Proof",
    bestFor: "Creative, product, development, and marketing studios",
    description: "Leads with a concrete outcome, then earns trust through work, process, and evidence.",
    primaryConversion: "Qualified inquiry or discovery call",
    sections: [
      s("hero", "State the client outcome, audience, and one primary action."),
      s("proof", "Show only verified clients, outcomes, or credibility signals."),
      s("selected-work", "Demonstrate fit through a small set of strong projects."),
      s("services", "Explain the offers in customer language."),
      s("process", "Reduce delivery uncertainty with a concise engagement path."),
      s("case-study", "Connect problem, intervention, and verified result."),
      s("reviews", "Add a verified testimonial or omit the section.", false),
      s("cta", "Repeat the single primary conversion with low-friction next steps."),
    ],
    recommendedStyleKitIds: ["clear-professional", "dark-cinematic", "warm-editorial"],
    promptStarters: [
      "Make the first screen clearer for product teams and move proof earlier without inventing metrics.",
      "Create a premium, credible agency direction using our existing work and one discovery-call CTA.",
      "Tighten the story around outcomes, selected work, and a three-step engagement process.",
    ],
    sourceUrls: ["https://designsystem.digital.gov/design-principles/", "https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/"],
  },
  {
    id: "saas-product-led",
    name: "SaaS Product-Led",
    bestFor: "Self-serve software, AI tools, and free-trial products",
    description: "Explains the product quickly, makes the interface tangible, and removes trial friction.",
    primaryConversion: "Start trial or create account",
    sections: [
      s("hero", "Promise one product outcome and expose the trial action."),
      s("product-demo", "Show the real product or a truthful interactive preview."),
      s("proof", "Use verified adoption or customer evidence."),
      s("benefits", "Translate capabilities into customer outcomes."),
      s("features", "Walk through the few features that support the promise."),
      s("integrations", "Show relevant ecosystem fit.", false),
      s("pricing", "Preview packaging and remove surprise.", false),
      s("faq", "Resolve the strongest adoption objections.", false),
      s("cta", "Repeat the trial action with the commitment made explicit."),
    ],
    recommendedStyleKitIds: ["technical-precision", "clear-professional", "dark-cinematic"],
    promptStarters: [
      "Clarify the one job this product solves and make the product visible above the fold.",
      "Build a product-led story for a skeptical technical buyer using only supplied product facts.",
      "Reduce CTA competition and organize features by customer outcome instead of internal modules.",
    ],
    sourceUrls: ["https://m3.material.io/foundations", "https://designsystem.digital.gov/design-principles/"],
  },
  {
    id: "saas-enterprise",
    name: "SaaS Enterprise",
    bestFor: "Higher-ticket B2B platforms with security and procurement needs",
    description: "Balances executive outcomes, platform depth, proof, and risk reduction.",
    primaryConversion: "Book consultation or request demo",
    sections: [
      s("hero", "Lead with a measurable business outcome without fabricating a number."),
      s("proof", "Establish verified enterprise credibility."),
      s("benefits", "Frame the current problem and future operating model."),
      s("features", "Group platform modules around buyer jobs."),
      s("case-study", "Show verified implementation and results."),
      s("security", "Address security, privacy, reliability, and compliance with supplied facts."),
      s("integrations", "Show the systems the platform connects to.", false),
      s("cta", "Offer a specific consultation or demo next step."),
    ],
    recommendedStyleKitIds: ["clear-professional", "technical-precision", "high-clarity-utility"],
    promptStarters: [
      "Reframe this for an enterprise buying group while preserving the same verified claims.",
      "Bring security and implementation confidence into the main story without overwhelming the hero.",
      "Create a decision-ready page for an executive sponsor and technical evaluator.",
    ],
    sourceUrls: ["https://designsystem.digital.gov/design-principles/", "https://www.w3.org/WAI/tutorials/page-structure/"],
  },
  {
    id: "commerce-discovery",
    name: "Commerce Discovery",
    bestFor: "Catalog, collection, and category-led stores",
    description: "Optimizes browsing, product discovery, trust, and a clean path into collections.",
    primaryConversion: "Browse a collection or add a product",
    sections: [
      s("announcement", "Surface only a current, truthful offer or operational notice.", false),
      s("hero", "Introduce the collection and one discovery path."),
      s("categories", "Expose the few highest-value shopping paths."),
      s("products", "Feature real products with clear labels."),
      s("gallery", "Tell a collection story without burying product access.", false),
      s("proof", "Explain fulfillment, returns, guarantees, or sourcing truthfully."),
      s("newsletter", "Offer a concrete reason to subscribe.", false),
    ],
    recommendedStyleKitIds: ["friendly-organic", "playful-modular", "luxury-minimal"],
    promptStarters: [
      "Organize this store around the three highest-intent collection paths on mobile.",
      "Make product discovery faster while keeping editorial imagery secondary to shopping actions.",
      "Clarify fulfillment and returns using only the policies provided.",
    ],
    sourceUrls: ["https://shopify.dev/docs/storefronts/themes/best-practices", "https://shopify.dev/docs/storefronts/themes/best-practices/design/index"],
  },
  {
    id: "commerce-product-story",
    name: "Commerce Product Story",
    bestFor: "Hero products, launches, and focused catalogs",
    description: "Keeps the title, price, media, and buy action prominent while earning confidence below.",
    primaryConversion: "Add to cart or buy now",
    sections: [
      s("hero", "Keep product name, price, primary media, and purchase action prominent."),
      s("gallery", "Show truthful product views and details."),
      s("benefits", "Explain benefits before technical depth."),
      s("product-details", "Provide options, specifications, care, and delivery facts."),
      s("reviews", "Show only verified review evidence.", false),
      s("faq", "Resolve product-specific purchase concerns.", false),
      s("products", "Offer a small relevant cross-sell.", false),
    ],
    recommendedStyleKitIds: ["luxury-minimal", "friendly-organic", "playful-modular"],
    promptStarters: [
      "Make the product, price, options, and buy action unmissable on a narrow mobile viewport.",
      "Turn the supplied product facts into a clear benefit story without adding claims.",
      "Reduce purchase uncertainty through details, delivery facts, and verified proof.",
    ],
    sourceUrls: ["https://shopify.dev/docs/storefronts/themes/best-practices", "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum"],
  },
  {
    id: "portfolio-case-study",
    name: "Portfolio Case Study",
    bestFor: "Designers, photographers, architects, and independent builders",
    description: "Uses a strong point of view and a few deep projects instead of a noisy gallery.",
    primaryConversion: "Project inquiry",
    sections: [
      s("hero", "State the practice, specialty, and desired inquiry."),
      s("selected-work", "Lead with the strongest relevant work."),
      s("case-study", "Explain problem, process, craft, and verified outcome."),
      s("services", "Clarify capabilities and engagement boundaries."),
      s("proof", "Use truthful recognition or client evidence.", false),
      s("reviews", "Add a verified testimonial or omit.", false),
      s("cta", "Invite a well-scoped project inquiry."),
    ],
    recommendedStyleKitIds: ["warm-editorial", "luxury-minimal", "dark-cinematic"],
    promptStarters: [
      "Create a restrained portfolio that lets three projects carry the story.",
      "Make the case studies more useful by clarifying problem, process, and outcome.",
      "Use editorial hierarchy and generous whitespace without imitating a named studio.",
    ],
    sourceUrls: ["https://developer.apple.com/design/human-interface-guidelines/layout", "https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/"],
  },
  {
    id: "local-service-lead",
    name: "Local Service Lead",
    bestFor: "Contractors, repair, legal, dental, and home services",
    description: "Makes geography, service fit, credibility, and quote/contact actions immediately clear.",
    primaryConversion: "Call, request quote, or schedule assessment",
    sections: [
      s("hero", "State service, geography, and the primary contact action."),
      s("service-area", "Clarify locations and service boundaries."),
      s("services", "Organize the actual services customers search for."),
      s("proof", "Show verified licenses, credentials, guarantees, or experience."),
      s("process", "Explain what happens after contact."),
      s("reviews", "Use verified local reviews or omit."),
      s("faq", "Answer qualification, timing, and cost-process questions.", false),
      s("hours-location", "Expose phone, hours, address, and service area."),
      s("cta", "Repeat the quote or appointment action."),
    ],
    recommendedStyleKitIds: ["high-clarity-utility", "clear-professional", "friendly-organic"],
    promptStarters: [
      "Make the service area and fastest contact path clear in the first screen.",
      "Build trust from supplied credentials and reviews without inventing ratings or urgency.",
      "Write a mobile-first lead page for someone who needs help today but still wants proof.",
    ],
    sourceUrls: ["https://developers.google.com/search/docs/appearance/structured-data/local-business", "https://designsystem.digital.gov/design-principles/"],
  },
  {
    id: "appointment-location",
    name: "Appointment & Location",
    bestFor: "Salons, clinics, restaurants, fitness, and hospitality",
    description: "Sells the experience while keeping booking, services, policies, and location practical.",
    primaryConversion: "Book or reserve",
    sections: [
      s("hero", "Communicate the experience and expose booking."),
      s("services", "Show services, menu, or classes with real details."),
      s("team", "Introduce relevant expertise.", false),
      s("gallery", "Set accurate expectations through imagery."),
      s("reviews", "Use verified guest or customer proof.", false),
      s("faq", "Clarify policies, accessibility, and preparation.", false),
      s("hours-location", "Make hours, location, contact, and access details easy to find."),
      s("cta", "Repeat booking with policy context."),
    ],
    recommendedStyleKitIds: ["friendly-organic", "warm-editorial", "luxury-minimal"],
    promptStarters: [
      "Make booking and location details effortless without flattening the brand experience.",
      "Organize services and policies for a mobile visitor ready to book.",
      "Create a warm, accessible direction using only real team and review content.",
    ],
    sourceUrls: ["https://developers.google.com/search/docs/appearance/structured-data/local-business", "https://developer.apple.com/design/human-interface-guidelines/accessibility"],
  },
  {
    id: "launch-waitlist",
    name: "Launch & Waitlist",
    bestFor: "New products, courses, events, and pre-launch validation",
    description: "Explains what is coming, who it is for, why it matters, and what signup means.",
    primaryConversion: "Join waitlist or register",
    sections: [
      s("hero", "State the promise, audience, availability, and signup action."),
      s("product-demo", "Preview the real product, curriculum, or event."),
      s("benefits", "Explain the practical value for the intended audience."),
      s("proof", "Use only verified founder, beta, partner, or speaker evidence.", false),
      s("timeline", "Clarify launch date, agenda, or delivery milestones.", false),
      s("cta", "Explain what happens after signup and ask for the minimum data."),
      s("faq", "Resolve timing, eligibility, price, and privacy questions.", false),
    ],
    recommendedStyleKitIds: ["playful-modular", "technical-precision", "dark-cinematic"],
    promptStarters: [
      "Clarify what is launching, who it is for, and exactly what joining the waitlist means.",
      "Create three controlled directions that keep the same copy and change only hierarchy and visual tone.",
      "Remove unsupported hype and replace it with a concrete preview, timeline, and signup promise.",
    ],
    sourceUrls: ["https://designsystem.digital.gov/design-principles/", "https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html"],
  },
];

export interface DesignLibraryStyleKit extends ThemePreset {
  attributes: string[];
  avoid: string[];
  promptStarters: string[];
}

const STYLE_KIT_META: Record<string, Omit<DesignLibraryStyleKit, keyof ThemePreset>> = {
  "clear-professional": {
    attributes: ["high trust", "restrained", "clear hierarchy", "familiar controls"],
    avoid: ["decorative clutter", "low-contrast gray", "ambiguous actions"],
    promptStarters: ["Use a restrained professional system with strong hierarchy and one unmistakable primary action."],
  },
  "warm-editorial": {
    attributes: ["narrative", "warm", "editorial serif", "generous whitespace"],
    avoid: ["tiny body copy", "fashion-magazine imitation", "ornamental dividers everywhere"],
    promptStarters: ["Use warm editorial hierarchy and generous whitespace while keeping body copy highly legible."],
  },
  "technical-precision": {
    attributes: ["product-forward", "compact geometry", "cool neutral", "precise"],
    avoid: ["terminal cosplay", "dense walls of data", "glowing borders on every surface"],
    promptStarters: ["Use compact technical precision, clear product evidence, and semantic rather than decorative color."],
  },
  "dark-cinematic": {
    attributes: ["deep surfaces", "controlled luminous accent", "spacious", "confident"],
    avoid: ["pure black everywhere", "neon overload", "persistent background motion"],
    promptStarters: ["Use a dark cinematic field with controlled highlights, strong contrast, and reduced-motion-safe depth."],
  },
  "luxury-minimal": {
    attributes: ["sparse", "editorial", "premium", "sharp"],
    avoid: ["illegible thin type", "gold on every element", "empty pages with hidden navigation"],
    promptStarters: ["Use sparse luxury-minimal composition, exact typography, and evidence-led restraint."],
  },
  "friendly-organic": {
    attributes: ["approachable", "natural", "soft", "human"],
    avoid: ["childish illustration", "beige-on-beige contrast", "over-rounded everything"],
    promptStarters: ["Use warm natural color, soft shapes, and straightforward language without sacrificing contrast."],
  },
  "playful-modular": {
    attributes: ["bold blocks", "energetic", "modular", "optimistic"],
    avoid: ["novelty cursor", "random rotations", "competing rainbow CTAs"],
    promptStarters: ["Use bold modular composition and controlled color blocks with conventional, accessible interactions."],
  },
  "high-clarity-utility": {
    attributes: ["maximum legibility", "visible boundaries", "plain language", "efficient"],
    avoid: ["hidden affordances", "low contrast", "decoration without function"],
    promptStarters: ["Prioritize scanability, explicit labels, visible focus, and efficient task completion."],
  },
};

export const DESIGN_STYLE_KITS: DesignLibraryStyleKit[] = Object.entries(STYLE_KIT_META).flatMap(
  ([id, meta]) => {
    const preset = getPreset(id);
    return preset ? [{ ...preset, ...meta }] : [];
  }
);

export function getDesignTemplate(id: string): DesignTemplate | null {
  return DESIGN_TEMPLATES.find((template) => template.id === id) ?? null;
}

export function getDesignStyleKit(id: string): DesignLibraryStyleKit | null {
  return DESIGN_STYLE_KITS.find((kit) => kit.id === id) ?? null;
}

export const DESIGN_GUARDRAILS = {
  accessibilityTarget: "WCAG 2.2 AA",
  sourcePolicy: "provided-and-verified-only",
  preferredTargetSize: "44x44 CSS px",
  minimumTargetSize: "24x24 CSS px with WCAG spacing exceptions",
  bodyTextContrast: "4.5:1",
  largeTextContrast: "3:1",
  reducedMotion: "disable-nonessential",
  prohibited: [
    "raw HTML or CSS from the model",
    "invented clients, reviews, metrics, awards, certifications, prices, or locations",
    "named-brand cloning",
    "color-only status communication",
    "auto-advancing carousels, parallax, novelty cursors, or persistent decorative motion",
  ],
  sources: [
    "https://www.w3.org/TR/WCAG22/",
    "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum",
    "https://designsystem.digital.gov/design-principles/",
    "https://design-system.service.gov.uk/styles/type-scale/",
    "https://developer.apple.com/design/human-interface-guidelines/accessibility",
    "https://shopify.dev/docs/storefronts/themes/best-practices",
    "https://www.designtokens.org/TR/2025.10/format/",
  ],
} as const;

export function composeDesignPrompt(input: {
  instruction: string;
  templateId?: string | null;
  styleKitId?: string | null;
}): string {
  const template = input.templateId ? getDesignTemplate(input.templateId) : null;
  const style = input.styleKitId ? getDesignStyleKit(input.styleKitId) : null;
  const lines = [
    input.instruction.trim(),
    template ? `Selected structure: ${template.name} (${template.id}). Primary conversion: ${template.primaryConversion}.` : "Preserve the existing structure.",
    template ? `Section objectives: ${template.sections.map((section) => `${section.type}: ${section.objective}`).join(" | ")}` : "",
    style ? `Selected style kit: ${style.name} (${style.id}). Attributes: ${style.attributes.join(", ")}.` : "Preserve the current visual identity unless explicitly changed.",
    style ? `Avoid: ${style.avoid.join(", ")}.` : "",
    "Use supplied and verified content only. Never invent clients, testimonials, metrics, awards, certifications, prices, locations, or urgency.",
    "Return only the requested schema. Do not emit HTML, CSS, JavaScript, markdown, shell commands, or claims of accessibility compliance.",
  ];
  return lines.filter(Boolean).join("\n");
}
