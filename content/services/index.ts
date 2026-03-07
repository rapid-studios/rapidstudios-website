import type { ServiceEntry, ServiceMeta } from "@/types/content";

import FrontendImplementation, { meta as frontendImplementationMeta } from "./frontend-implementation.mdx";
import MarketingWebsites, { meta as marketingWebsitesMeta } from "./marketing-websites.mdx";
import PositioningAndMessaging, { meta as positioningAndMessagingMeta } from "./positioning-and-messaging.mdx";

export const services: ServiceEntry[] = [
  {
    ...(positioningAndMessagingMeta as ServiceMeta),
    Content: PositioningAndMessaging
  },
  {
    ...(marketingWebsitesMeta as ServiceMeta),
    Content: MarketingWebsites
  },
  {
    ...(frontendImplementationMeta as ServiceMeta),
    Content: FrontendImplementation
  }
];
