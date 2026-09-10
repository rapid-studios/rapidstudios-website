import { StitchHomepage } from "@/components/pages/stitch-homepage";
import { getManagedHomepageCopy } from "@/lib/content/managed-site";
import { PageStructuredData } from "@/components/seo/page-structured-data";
import { buildMetadata } from "@/lib/seo/metadata";

const managedCopy = getManagedHomepageCopy();

const pageSeo = {
  title: managedCopy["home.meta.title"],
  description: managedCopy["home.meta.description"],
  pathname: "/"
};

export const metadata = buildMetadata(pageSeo);

export default function HomePage() {
  return (
    <>
      <PageStructuredData {...pageSeo} />
      <StitchHomepage />
    </>
  );
}
