import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

// This synthetic demo needs one shared key per build, not per server instance.
// Never print or commit the generated file. Rebuilding expires old demo sessions.
const directory = new URL("../../lib/kumo-demo/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL("session-key.generated.json", directory),
  JSON.stringify({ secret: randomBytes(32).toString("base64url") }) + "\n", { mode: 0o600 });
