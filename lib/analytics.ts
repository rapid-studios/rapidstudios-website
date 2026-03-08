import { track } from "@vercel/analytics";

export function trackContactSubmit(projectType: string) {
  track("contact_submit", { projectType: projectType || "not_specified" });
}

export function trackCtaClick(location: string, label: string) {
  track("cta_click", { location, label });
}
