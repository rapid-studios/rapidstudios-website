export const caseStudyMedia: Record<
  string,
  {
    cover: string;
    gallery: string[];
    beforeAfter?: { before: string; after: string };
    reel?: { webm: string; hevc: string; mp4: string; poster: string };
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
  },
  "sant-electric": {
    cover: "/case-studies/sant-electric-home.jpg",
    gallery: ["/case-studies/sant-electric-projects.jpg", "/case-studies/sant-electric-services.jpg"],
    beforeAfter: {
      before: "/case-studies/sant-electric-before.jpg",
      after: "/case-studies/sant-electric-home.jpg"
    },
    reel: {
      webm: "/case-studies/reels/sant-electric-reel.webm",
      hevc: "/case-studies/reels/sant-electric-reel-hevc.mp4",
      mp4: "/case-studies/reels/sant-electric-reel.mp4",
      poster: "/case-studies/reels/sant-electric-reel-poster.jpg"
    }
  },
  "american-interior-systems": {
    cover: "/case-studies/ais-home.jpg",
    gallery: ["/case-studies/ais-installations.jpg", "/case-studies/ais-products.jpg"],
    beforeAfter: {
      before: "/case-studies/ais-before.jpg",
      after: "/case-studies/ais-home.jpg"
    },
    reel: {
      webm: "/case-studies/reels/ais-reel.webm",
      hevc: "/case-studies/reels/ais-reel-hevc.mp4",
      mp4: "/case-studies/reels/ais-reel.mp4",
      poster: "/case-studies/reels/ais-reel-poster.jpg"
    }
  }
};

export function getCaseStudyMedia(slug: string) {
  return caseStudyMedia[slug] ?? caseStudyMedia.codeverified;
}
