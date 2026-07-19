const NAMESPACE_RE = /[^a-z0-9_-]+/g;

/**
 * Separates production, preview, test, and local queue records even when they
 * share one Atlas database. Every queue document and query carries this value.
 */
export function cmsJobNamespace(): string {
  const raw =
    process.env.CMS_QUEUE_NAMESPACE ||
    process.env.CMS_DATA_NAMESPACE ||
    process.env.VERCEL_ENV ||
    (process.env.NODE_ENV === "production" ? "production" : "development");
  const clean = raw.toLowerCase().replace(NAMESPACE_RE, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  if (!clean) throw new Error("CMS_QUEUE_NAMESPACE resolves to an empty namespace");
  return clean;
}
