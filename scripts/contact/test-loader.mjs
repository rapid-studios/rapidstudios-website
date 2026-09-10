import { resolve as resolveTypeScript } from "../cms/tests/typescript-resolver.mjs";

export { load } from "../cms/tests/typescript-resolver.mjs";

// Replace the mail provider before any application module loads. These tests
// never instantiate the real Resend SDK or contact an email service.
export async function resolve(specifier, context, nextResolve) {
  if (specifier === "resend") {
    return { url: new URL("./mock-resend.mjs", import.meta.url).href, shortCircuit: true };
  }
  if (specifier === "next/server") {
    return nextResolve("next/server.js", context);
  }
  return resolveTypeScript(specifier, context, nextResolve);
}
