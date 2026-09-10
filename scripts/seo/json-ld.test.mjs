import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { JsonLd } from "../../components/seo/json-ld.tsx";
import {
  getBreadcrumbSchema,
  getCaseStudySchema,
  getFaqSchema,
  getOrganizationSchema,
  getServiceSchema,
  getWebPageSchema,
  getWebSiteSchema,
  serializeJsonLd
} from "../../lib/seo/json-ld.ts";
import { siteConfig } from "../../lib/site-data.ts";

const origin = siteConfig.url;
const organizationId = `${origin}/#organization`;
const websiteId = `${origin}/#website`;

test("organization and website share a stable identity and the site's actual contact details", async () => {
  const organization = getOrganizationSchema();
  const website = getWebSiteSchema();

  assert.equal(organization["@type"], "Organization");
  assert.equal(organization["@id"], organizationId);
  assert.equal(organization.name, siteConfig.name);
  assert.equal(organization.description, siteConfig.description);
  assert.equal(organization.email, siteConfig.email);
  assert.equal(organization.logo, `${origin}/apple-icon.png`);
  const logo = await readFile(new URL("../../app/apple-icon.png", import.meta.url));
  assert.equal(logo.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.ok(logo.readUInt32BE(16) >= 112 && logo.readUInt32BE(20) >= 112);
  assert.equal(organization.contactPoint.email, siteConfig.email);
  assert.equal(organization.contactPoint.url, `${origin}/contact`);
  for (const property of ["address", "sameAs", "founder", "aggregateRating", "review", "areaServed"]) {
    assert.equal(Object.hasOwn(organization, property), false, `must not invent ${property}`);
  }
  assert.equal(website["@id"], websiteId);
  assert.deepEqual(website.publisher, { "@id": organizationId });
});

test("page, service, case study, and breadcrumb references resolve within the graph", () => {
  const service = getServiceSchema({
    slug: "frontend-implementation",
    title: "Frontend Implementation",
    summary: "Interfaces built from the approved designs."
  });
  const servicesPage = getWebPageSchema({
    pathname: "/services",
    title: "Services",
    description: "Our services.",
    type: "CollectionPage",
    mainEntity: [{ "@id": service["@id"] }]
  });
  const servicesBreadcrumb = getBreadcrumbSchema([
    { name: "Home", pathname: "/" },
    { name: "Services", pathname: "/services" }
  ], "/services");
  const study = getCaseStudySchema({
    slug: "example-project",
    title: "Example project",
    summary: "A supplied case study summary."
  }, "/images/example-project.png");
  const studyPage = getWebPageSchema({
    pathname: "/work/example-project",
    title: "Example project",
    description: "A supplied case study summary.",
    mainEntity: { "@id": study["@id"] }
  });
  const studyBreadcrumb = getBreadcrumbSchema([
    { name: "Home", pathname: "/" },
    { name: "Work", pathname: "/work" },
    { name: "Example project", pathname: "/work/example-project" }
  ], "/work/example-project");
  const graph = [getOrganizationSchema(), getWebSiteSchema(), service, servicesPage,
    servicesBreadcrumb, study, studyPage, studyBreadcrumb];
  const ids = new Set(graph.map((node) => node["@id"]));

  function assertReferencesResolve(value) {
    if (Array.isArray(value)) return value.forEach(assertReferencesResolve);
    if (value && typeof value === "object") {
      if (Object.keys(value).length === 1 && "@id" in value) {
        assert.ok(ids.has(value["@id"]), `unresolved reference: ${value["@id"]}`);
      }
      Object.values(value).forEach(assertReferencesResolve);
    }
  }

  graph.forEach(assertReferencesResolve);
  assert.equal(service.url, `${origin}/services#frontend-implementation`);
  assert.equal(servicesPage["@type"], "CollectionPage");
  assert.equal(study["@type"], "CreativeWork");
  assert.equal(study.image, `${origin}/images/example-project.png`);
  assert.deepEqual(studyBreadcrumb.itemListElement.map(({ position, name, item }) => ({ position, name, item })), [
    { position: 1, name: "Home", item: `${origin}/` },
    { position: 2, name: "Work", item: `${origin}/work` },
    { position: 3, name: "Example project", item: `${origin}/work/example-project` }
  ]);
});

test("page types preserve supplied content and the home page does not reference missing breadcrumbs", () => {
  for (const type of ["WebPage", "AboutPage", "ContactPage", "CollectionPage", "FAQPage"]) {
    const page = getWebPageSchema({
      pathname: "/",
      title: "A supplied page title",
      description: "A supplied page description",
      type
    });
    assert.equal(page["@type"], type);
    assert.equal(page.name, "A supplied page title");
    assert.equal(page.description, "A supplied page description");
    assert.equal(Object.hasOwn(page, "breadcrumb"), false);
    assert.equal(Object.hasOwn(page, "mainEntity"), false);
    assert.deepEqual(page.isPartOf, { "@id": websiteId });
    assert.deepEqual(page.about, { "@id": organizationId });
  }
});

test("service and case-study descriptions use supplied visible copy without invented claims", () => {
  const visibleService = Object.freeze({
    slug: "workflow-automation",
    title: "Workflow Automation",
    summary: "Connect the tools your team already uses."
  });
  const visibleStudy = Object.freeze({
    slug: "client-platform",
    title: "Client Platform",
    summary: "A workspace for the client's operations team.",
    year: "2026"
  });
  const service = getServiceSchema(visibleService);
  const study = getCaseStudySchema(visibleStudy, "https://images.example.com/project.png");

  assert.equal(service.name, visibleService.title);
  assert.equal(service.description, visibleService.summary);
  assert.equal(study.name, visibleStudy.title);
  assert.equal(study.description, visibleStudy.summary);
  assert.equal(study.image, "https://images.example.com/project.png");
  for (const node of [service, study]) {
    for (const property of ["datePublished", "dateModified", "review", "aggregateRating", "offers"]) {
      assert.equal(Object.hasOwn(node, property), false, `must not invent ${property}`);
    }
  }
});

test("FAQ schema preserves every supplied visible question and answer", () => {
  const visibleFaqs = Object.freeze([
    Object.freeze({ question: "How do projects begin?", answer: "We start with a discovery call." }),
    Object.freeze({ question: "Can you work with an existing team?", answer: "Yes, we can work with your team." })
  ]);
  const faq = getFaqSchema(visibleFaqs, "/pricing");
  const pricingPage = getWebPageSchema({
    pathname: "/pricing",
    title: "Engagements and pricing",
    description: "Find answers about project scope and pricing.",
    type: "FAQPage",
    mainEntity: faq.mainEntity
  });
  const breadcrumb = getBreadcrumbSchema([
    { name: "Home", pathname: "/" },
    { name: "Pricing", pathname: "/pricing" }
  ], "/pricing");

  assert.equal(faq["@type"], "FAQPage");
  assert.equal(faq["@id"], `${origin}/pricing#webpage`);
  assert.deepEqual(faq.isPartOf, { "@id": websiteId });
  assert.equal(pricingPage["@type"], "FAQPage");
  assert.equal(pricingPage["@id"], faq["@id"]);
  assert.deepEqual(pricingPage.isPartOf, { "@id": websiteId });
  assert.deepEqual(pricingPage.breadcrumb, { "@id": breadcrumb["@id"] });
  assert.notEqual(pricingPage.isPartOf["@id"], pricingPage["@id"]);
  assert.deepEqual(pricingPage.mainEntity.map(({ name, acceptedAnswer }) => ({
    question: name,
    answer: acceptedAnswer.text
  })), visibleFaqs);
});

test("serialization prevents script breakout and preserves content after JSON parsing", () => {
  const payload = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: '</ScRiPt><script>alert("injected")</script><!--',
    description: "Quotes: \"hello\"; ampersand &; Unicode: café; separators: \u2028\u2029"
  };
  const serialized = serializeJsonLd(payload);

  assert.equal(serialized.includes("<"), false);
  assert.deepEqual(JSON.parse(serialized), payload);
  assert.deepEqual(JSON.parse(serializeJsonLd([payload])), [payload]);

  const html = renderToStaticMarkup(JsonLd({ id: "page-schema", data: payload }));
  assert.match(html, /^<script id="page-schema" type="application\/ld\+json">/);
  assert.equal((html.match(/<script\b/gi) ?? []).length, 1);
  assert.equal((html.match(/<\/script>/gi) ?? []).length, 1);
  const scriptContent = html.slice(html.indexOf(">") + 1, html.lastIndexOf("</script>"));
  assert.deepEqual(JSON.parse(scriptContent), payload);
});
