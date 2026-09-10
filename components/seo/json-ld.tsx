import { serializeJsonLd, type JsonLdData } from "@/lib/seo/json-ld";

type JsonLdProps = {
  data: JsonLdData;
  id?: string;
};

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
