export const caseStudyMedia: Record<
  string,
  {
    cover: string;
    gallery: string[];
  }
> = {
  codeverified: {
    cover: "/case-studies/codeverified-homepage.png",
    gallery: [
      "/case-studies/codeverified-upload.png",
      "/case-studies/codeverified-pricing.png",
      "/case-studies/codeverified-sample-report.png"
    ]
  },
  "ai-trading-decision-platform": {
    cover: "/case-studies/ai-trading-architecture.png",
    gallery: ["/case-studies/ai-trading-architecture.png"]
  },
  "upward-pt-automation": {
    cover: "/case-studies/upward-pt.png",
    gallery: ["/case-studies/upward-pt.png"]
  }
};

export function getCaseStudyMedia(slug: string) {
  return caseStudyMedia[slug] ?? caseStudyMedia.codeverified;
}
