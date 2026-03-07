import { StitchHomepage } from "@/components/pages/stitch-homepage";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Rapid Studios",
  description:
    "Digital products at high velocity. Rapid Studios is a premium product studio delivering design and engineering with sharper proof and faster launch paths.",
  pathname: "/"
});

export default function HomePage() {
  return <StitchHomepage />;
}
