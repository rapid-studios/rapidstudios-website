import { StitchHomepage } from "@/components/pages/stitch-homepage";
import { getManagedHomepageCopy } from "@/lib/content/managed-site";
import { buildMetadata } from "@/lib/seo/metadata";

const managedCopy = getManagedHomepageCopy();

export const metadata = buildMetadata({
  title: managedCopy["home.meta.title"],
  description: managedCopy["home.meta.description"],
  pathname: "/"
});

export default function HomePage() {
  return <StitchHomepage />;
}
