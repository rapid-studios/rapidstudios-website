import { caseStudies } from "@/content/case-studies";

export function getAllCaseStudies() {
  return caseStudies;
}

export function getFeaturedCaseStudies() {
  return caseStudies.filter((entry) => entry.featured);
}

export function getCaseStudyBySlug(slug: string) {
  return caseStudies.find((entry) => entry.slug === slug);
}
