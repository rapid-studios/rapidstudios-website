import { StitchHomepage } from "@/components/pages/stitch-homepage";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Digital Products Designed to Ship",
  description:
    "Rapid Studios helps product teams design and launch polished digital products -- from positioning and UI to production frontend delivery.",
  pathname: "/"
});

export default function HomePage() {
  return <StitchHomepage />;
}
