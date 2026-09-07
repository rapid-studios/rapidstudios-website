import "server-only";
import deals from "./deals.json";
import generatedKey from "./session-key.generated.json";
import { createKumoDemoHandler, deploymentOrigins } from "./handler";

// The build-generated key is bundled only into the Node server route. A configured
// secret can keep demo sessions valid between deploys; neither key is sent to clients.
export const handleKumoDemo = createKumoDemoHandler({
  signingKey: process.env.KUMO_SESSION_SECRET ?? generatedKey.secret,
  allowedOrigins: deploymentOrigins([
    process.env.VERCEL_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]),
  deals,
  allowLocalHttp: process.env.NODE_ENV !== "production",
});
