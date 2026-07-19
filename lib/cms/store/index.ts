// lib/cms/store/index.ts
// Backend selector. Routes import the store from here, never a concrete
// adapter, so the engine is swappable.
//
// Selection:
//   CMS_STORE=mongo                  -> Mongo (requires MONGODB_URI)
//   CMS_STORE=file                   -> filesystem
//   production                       -> requires CMS_STORE=mongo + MONGODB_URI
//   local, unset + MONGODB_URI       -> Mongo
//   local, unset + no MONGODB_URI    -> filesystem

import type { CmsStore } from "../types";
import { fileStore } from "./file-store";
import { mongoStore } from "./mongo-store";

function pick(): { store: CmsStore; backend: "mongo" | "file" } {
  const explicit = (process.env.CMS_STORE || "").toLowerCase();
  // Next evaluates route modules while collecting build metadata. No CMS
  // request is served in that phase, so allow the local adapter long enough
  // for `next build` to finish; the module is evaluated again in the deployed
  // runtime, where the production checks below still fail closed.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    if (explicit === "mongo" && process.env.MONGODB_URI) {
      return { store: mongoStore, backend: "mongo" };
    }
    return { store: fileStore, backend: "file" };
  }
  if (process.env.NODE_ENV === "production") {
    if (explicit !== "mongo") {
      throw new Error("Production CMS storage requires CMS_STORE=mongo");
    }
    if (!process.env.MONGODB_URI) {
      throw new Error("Production CMS storage requires MONGODB_URI");
    }
    return { store: mongoStore, backend: "mongo" };
  }
  if (explicit === "mongo" || explicit === "mongodb") {
    if (!process.env.MONGODB_URI) throw new Error("CMS_STORE=mongo requires MONGODB_URI");
    return { store: mongoStore, backend: "mongo" };
  }
  if (explicit === "file") return { store: fileStore, backend: "file" };
  // Local development smart default.
  if (process.env.MONGODB_URI) return { store: mongoStore, backend: "mongo" };
  return { store: fileStore, backend: "file" };
}

const picked = pick();
export const store: CmsStore = picked.store;
export const STORE_BACKEND = picked.backend;
