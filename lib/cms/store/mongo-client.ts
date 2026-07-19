import { MongoClient, type Db } from "mongodb";

const globalForCmsMongo = globalThis as unknown as {
  __rapidCmsMongoClientPromise?: Promise<MongoClient>;
  __rapidCmsMongoUri?: string;
};

export function getCmsMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  return uri;
}

/** Shared, lazily connected Mongo client for the CMS and its job queue. */
export function getCmsMongoClient(): Promise<MongoClient> {
  const uri = getCmsMongoUri();
  if (globalForCmsMongo.__rapidCmsMongoClientPromise && globalForCmsMongo.__rapidCmsMongoUri === uri) {
    return globalForCmsMongo.__rapidCmsMongoClientPromise;
  }

  const client = new MongoClient(uri, { ignoreUndefined: true });
  const connection = client.connect().catch((error) => {
    if (globalForCmsMongo.__rapidCmsMongoClientPromise === connection) {
      delete globalForCmsMongo.__rapidCmsMongoClientPromise;
      delete globalForCmsMongo.__rapidCmsMongoUri;
    }
    throw error;
  });
  globalForCmsMongo.__rapidCmsMongoUri = uri;
  globalForCmsMongo.__rapidCmsMongoClientPromise = connection;
  return connection;
}

export async function getCmsMongoDb(): Promise<Db> {
  const client = await getCmsMongoClient();
  return client.db(process.env.MONGODB_DB || "rapidstudios_cms");
}
