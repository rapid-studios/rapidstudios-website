const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

interface CmsMutationContext {
  method: string;
  expectedOrigin: string;
  origin: string | null;
  fetchSite: string | null;
  hasCookieSession: boolean;
  hasBearerSession: boolean;
}

/** Return a client-safe rejection message, or null when the request is safe. */
export function cmsMutationRejection(context: CmsMutationContext): string | null {
  if (SAFE_METHODS.has(context.method.toUpperCase())) return null;

  if (context.fetchSite && context.fetchSite !== "same-origin" && context.fetchSite !== "none") {
    return "Cross-origin CMS requests are not allowed.";
  }

  if (context.origin) {
    try {
      if (new URL(context.origin).origin !== context.expectedOrigin) {
        return "Cross-origin CMS requests are not allowed.";
      }
    } catch {
      return "Invalid request origin.";
    }
  }

  if (context.hasCookieSession && !context.hasBearerSession && !context.origin) {
    return "An Origin header is required for cookie-authenticated mutations.";
  }

  return null;
}
