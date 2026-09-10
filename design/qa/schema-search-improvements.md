# Schema and search improvements

Reviewed September 9, 2026. Baseline: `79f17d1`.

The live website already emitted JSON-LD: the same `ProfessionalService` and `WebSite` objects on every marketing page. The supplied 75-second recording recommends schema but supplies no code or business facts. Its claim that AI systems universally read schema first or preferentially recommend businesses with schema is not established by the recording.

## Changes

- Replace deprecated `ProfessionalService` with `Organization`, appropriate for the publicly described studio without inventing a physical business address. Include the existing 1024 × 1024 brand image and public project-inquiry email.
- Give organization, website, pages, services, and case studies stable IDs and explicit relationships. Emit organization and website markup in the marketing layout rather than the private Studio layout.
- Share each page's metadata text with its schema. Mark About, Contact, Work, Services, and the existing pricing FAQs by their corresponding page types. Include breadcrumb hierarchies.
- Describe the four current services using the same content records rendered on `/services`; add real section anchors for their URLs.
- Describe the three case studies as `CreativeWork`, using their actual titles, summaries, and images. Do not invent publication dates or ratings.
- Use the existing four pricing questions and answers for the pricing page's `FAQPage` identity. This is semantic markup, not a promise of Google FAQ rich results.
- Escape `<` in all JSON-LD serialization so content cannot close its script element.
- Omit sitemap modification dates until real content modification dates exist. Previously all URLs were stamped with the build time.
- Correct default Open Graph image dimensions to its actual 1200 × 600 dimensions. Retain the default sharing image because current case-study covers are not optimized for social previews.

No public prices, location, founder identity, external profiles, ratings, or claims of guaranteed rankings were added. Public marketing routes, CMS content records, design, and prospect-page files retain their existing content.

## Verification

- `npm run test:seo`: six passing tests, including cross-entity references and script-breakout prevention.
- `npm run build`: passes compilation, TypeScript, static generation, 16 Kumo tests, and Kumo static/link checks. Three existing CMS file-store tracing warnings remain outside this change.
- `npm run lint`: zero errors; three existing unused-variable warnings in prospect scripts. Targeted lint for all changed TS/TSX and SEO tests passes without warnings.
- `npm run check:seo -- http://127.0.0.1:3217`: all ten sitemap pages return 200 with parseable schema, unique IDs, correct canonical URLs, matching content, valid service anchors, and reachable images. Confirms four services and four visible FAQ answers.
- Headless Chrome: homepage desktop rendering and Services at 390 × 844 inspected; mobile Services has no horizontal overflow, navigation opens, and no browser errors were reported.

To repeat against production after deployment: `npm run check:seo -- https://rapidstudios.dev`.

These checks validate the site's output. They do not establish Google's indexing state or a ranking change. Search Console inspection and search-performance measurement happen after recrawling.

## Primary references

- [Schema.org ProfessionalService deprecation](https://schema.org/ProfessionalService)
- [Google Organization guidance](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Next.js safe JSON-LD rendering](https://nextjs.org/docs/app/guides/json-ld)
- [Google sitemap date guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google AI features guidance](https://developers.google.com/search/docs/appearance/ai-features): normal SEO fundamentals apply; special schema or AI text files are not required.
- [Google documentation updates](https://developers.google.com/search/updates): FAQ rich results ended May 7, 2026; their documentation was removed June 15, 2026.
