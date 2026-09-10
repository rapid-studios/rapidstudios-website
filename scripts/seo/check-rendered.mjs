import assert from "node:assert/strict";
import { load } from "cheerio";

const origin = process.argv[2] || "http://localhost:3217";
const canonicalOrigin = "https://rapidstudios.dev";
const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200, "Sitemap must load");
const sitemap = load(await sitemapResponse.text(), { xmlMode: true });
const paths = sitemap("loc").map((_, node) => new URL(sitemap(node).text()).pathname).get();
assert.ok(paths.length >= 7, "Sitemap must include the marketing pages");
assert.equal(sitemap("lastmod").length, 0, "Omit lastmod until real content modification dates are available");

const results = [];
for (const pathname of paths) {
  const response = await fetch(new URL(pathname, origin));
  assert.equal(response.status, 200, `${pathname}: must load`);
  assert.doesNotMatch(response.headers.get("x-robots-tag") || "", /noindex/i, `${pathname}: must remain indexable`);
  const $ = load(await response.text());
  // Next can stream a resolved server component after its empty main placeholder.
  const visibleText = $("body").clone();
  visibleText.find("script, style").remove();
  const normalize = (value) => value.replace(/\s+/g, " ").trim();
  const body = normalize(visibleText.text());
  const nodes = $("script[type='application/ld+json']").toArray().flatMap((script) => {
    const parsed = JSON.parse($(script).text());
    return parsed["@graph"] || parsed;
  });
  assert.ok($("h1").length === 1, `${pathname}: expected one main heading`);
  assert.doesNotMatch($("meta[name='robots']").attr("content") || "", /noindex/i);
  const canonical = $("link[rel='canonical']").attr("href");
  assert.equal(new URL(canonical).href, new URL(pathname, canonicalOrigin).href);

  const ids = nodes.map((node) => node["@id"]);
  assert.ok(ids.every(Boolean), `${pathname}: every top-level entity needs an ID`);
  assert.equal(new Set(ids).size, ids.length, `${pathname}: entity IDs must be unique`);
  const byType = (type) => nodes.filter((node) => node["@type"] === type);
  assert.equal(byType("Organization").length, 1);
  assert.equal(byType("WebSite").length, 1);
  assert.equal(byType("ProfessionalService").length, 0);
  const page = nodes.find((node) => node["@id"] === `${new URL(pathname, canonicalOrigin).href}#webpage`);
  assert.ok(page, `${pathname}: missing page entity`);
  assert.equal(page.description, $("meta[name='description']").attr("content"));
  assert.ok(ids.includes(page.isPartOf["@id"]));
  assert.ok(ids.includes(page.about["@id"]));
  if (pathname !== "/") {
    const breadcrumb = byType("BreadcrumbList")[0];
    assert.ok(breadcrumb);
    assert.equal(page.breadcrumb["@id"], breadcrumb["@id"]);
    assert.equal(new URL(breadcrumb.itemListElement.at(-1).item).pathname, pathname);
  }
  for (const service of byType("Service")) {
    assert.ok(ids.includes(service.provider["@id"]));
    const anchor = new URL(service.url).hash.slice(1);
    const article = $("article").filter((_, node) => $(node).attr("id") === anchor);
    assert.equal(article.length, 1, `${pathname}: service must link to a real section`);
    assert.ok(normalize(article.text()).includes(normalize(service.name)));
    assert.ok(normalize(article.text()).includes(normalize(service.description)));
  }
  for (const faq of byType("FAQPage")) {
    for (const question of faq.mainEntity) {
      assert.ok(body.includes(normalize(question.name)), "FAQ question must be visible");
      assert.ok(body.includes(normalize(question.acceptedAnswer.text)), "FAQ answer must be visible");
    }
  }
  for (const work of byType("CreativeWork")) {
    assert.ok(body.includes(normalize(work.name)));
    assert.ok(body.includes(normalize(work.description)));
    const image = await fetch(new URL(new URL(work.image).pathname, origin));
    assert.equal(image.status, 200, "Case-study image must exist");
  }
  if (pathname === "/services") assert.equal(byType("Service").length, 4);
  if (pathname === "/pricing") assert.equal(byType("FAQPage")[0]?.mainEntity.length, 4);
  results.push({ pathname, types: nodes.map((node) => node["@type"]) });
}

const logo = await fetch(`${origin}/apple-icon.png`);
assert.equal(logo.status, 200, "Organization logo must load");
console.log(JSON.stringify({ origin, checkedPages: results.length, results }, null, 2));
