import type { ContentMap, Slot } from "../types";
import { makeSlotId } from "../ingest/slot-id";
import { getDesignTemplate } from "./templates";

export interface BuiltDesignPage {
  templateId: string;
  html: string;
  contentMap: ContentMap;
}

const sectionNames: Record<string, string> = {
  announcement: "Announcement",
  hero: "A clear outcome for the people you serve",
  proof: "Why customers can trust you",
  "product-demo": "See the product in action",
  benefits: "What gets better",
  features: "How it works",
  services: "Ways to work with you",
  "selected-work": "Selected work",
  "case-study": "A closer look at the result",
  process: "What happens next",
  integrations: "Works with your tools",
  pricing: "Choose the right fit",
  security: "Built for trust",
  categories: "Shop by category",
  products: "Featured products",
  "product-details": "Everything you need to know",
  gallery: "A closer look",
  team: "Meet the team",
  reviews: "What customers say",
  "service-area": "Where we help",
  "hours-location": "Hours and location",
  timeline: "Dates and milestones",
  faq: "Common questions",
  newsletter: "Stay in the loop",
  cta: "Ready for the next step?",
};

function slot(type: Slot["type"], value: string, maxLength: number, required = true): Slot {
  return { type, value, constraints: { allowHtml: false, maxLength, required } };
}

function id(templateId: string, sectionType: string, field: string): string {
  return makeSlotId(field === "button" ? "button" : "text", `${templateId}.${sectionType}.${field}`);
}

function escapeAttribute(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] as string);
}

export function buildDesignPage(templateId: string, businessName: string): BuiltDesignPage {
  const template = getDesignTemplate(templateId);
  if (!template) throw new Error(`Unknown design template: ${templateId}`);
  const contentMap: ContentMap = {};
  const sections = template.sections.map((section, index) => {
    const headingId = id(template.id, `${index}-${section.type}`, "heading");
    const bodyId = id(template.id, `${index}-${section.type}`, "body");
    const heading = sectionNames[section.type] ?? "Section heading";
    const body = `[Add verified content] ${section.objective}`;
    contentMap[headingId] = slot("text", heading, 120, true);
    contentMap[bodyId] = slot("text", body, 700, section.required);
    const isHero = section.type === "hero";
    const isCta = section.type === "cta";
    let action = "";
    if (isHero || isCta) {
      const actionId = id(template.id, `${index}-${section.type}`, "button");
      contentMap[actionId] = slot("button", `[Add ${template.primaryConversion} label]`, 80, true);
      action = `<button data-slot="${escapeAttribute(actionId)}" type="button"></button>`;
    }
    return `<section class="template-section template-section--${escapeAttribute(section.type)}">
      <div class="template-shell">
        <h${isHero ? "1" : "2"} data-slot="${escapeAttribute(headingId)}"></h${isHero ? "1" : "2"}>
        <p data-slot="${escapeAttribute(bodyId)}"></p>
        ${action}
      </div>
    </section>`;
  }).join("\n");

  const nameId = id(template.id, "header", "heading");
  contentMap[nameId] = slot("text", businessName.trim() || "Your business", 100, true);
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeAttribute(template.name)} page draft</title>
  <style>
    *{box-sizing:border-box}body{margin:0;background:var(--cms-bg,#fff);color:var(--cms-text,#111827);font:18px/1.6 var(--cms-body-font,system-ui,sans-serif)}
    .skip-link{position:absolute;left:-999px}.skip-link:focus{left:1rem;top:1rem;z-index:2;background:var(--cms-bg,#fff);color:var(--cms-text,#111827);padding:.75rem 1rem}
    header{border-bottom:1px solid color-mix(in srgb,var(--cms-text,#111827) 18%,transparent)}header,.template-shell{width:min(1120px,calc(100% - 2rem));margin-inline:auto}
    header{padding:1rem 0;font-weight:700}.template-section{padding:clamp(3.5rem,8vw,7rem) 0}.template-section:nth-of-type(even){background:var(--cms-surface,#f6f7f9)}
    h1,h2{max-width:18ch;margin:0 0 1rem;font-family:var(--cms-heading-font,system-ui,sans-serif);line-height:1.15;letter-spacing:-.025em;text-wrap:balance}h1{font-size:clamp(2.5rem,7vw,5rem)}h2{font-size:clamp(2rem,4vw,3.25rem)}
    p{max-width:68ch;margin:0;color:var(--cms-muted,#4b5563);text-wrap:pretty}button{min-height:44px;margin-top:1.75rem;border:0;border-radius:var(--cms-radius,8px);background:var(--cms-accent,#4f46e5);color:var(--cms-accent-text,#fff);padding:.75rem 1.25rem;font:inherit;font-weight:700}
    :focus-visible{outline:3px solid var(--cms-accent,#4f46e5);outline-offset:3px}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition-duration:.01ms!important}}
  </style>
</head>
<body>
  <a class="skip-link" href="#content">Skip to content</a>
  <header><span data-slot="${escapeAttribute(nameId)}"></span></header>
  <main id="content">${sections}</main>
</body>
</html>`;
  return { templateId: template.id, html, contentMap };
}

export function hasDraftPlaceholders(contentMap: ContentMap): boolean {
  return Object.values(contentMap).some((entry) => typeof entry.value === "string" && /^\[Add verified content\]|^\[Add .+ label\]$/.test(entry.value.trim()));
}
