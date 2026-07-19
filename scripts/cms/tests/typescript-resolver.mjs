import { readFile, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const candidateExtensions = ["", ".ts", ".tsx", ".mjs", ".js", ".json"];

async function regularFile(candidate) {
  try {
    return (await stat(candidate)).isFile();
  } catch {
    return false;
  }
}

async function resolveCandidate(candidate) {
  for (const extension of candidateExtensions) {
    const file = `${candidate}${extension}`;
    if (await regularFile(file)) return pathToFileURL(file).href;
  }
  for (const extension of candidateExtensions.slice(1)) {
    const file = path.join(candidate, `index${extension}`);
    if (await regularFile(file)) return pathToFileURL(file).href;
  }
  return null;
}

/** Test-only resolver for the repo's extensionless TypeScript imports and @/ alias. */
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const resolved = await resolveCandidate(path.join(repositoryRoot, specifier.slice(2)));
    if (resolved) return { url: resolved, shortCircuit: true };
  }

  if ((specifier.startsWith(".") || specifier.startsWith("/")) && context.parentURL) {
    const candidate = fileURLToPath(new URL(specifier, context.parentURL));
    const resolved = await resolveCandidate(candidate);
    if (resolved) return { url: resolved, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}

/** Transpile only for test execution; production compilation remains Next/TypeScript-owned. */
export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) {
    const parsed = JSON.parse(await readFile(fileURLToPath(url), "utf8"));
    return {
      format: "module",
      source: `export default ${JSON.stringify(parsed)};`,
      shortCircuit: true,
    };
  }

  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    const fileName = fileURLToPath(url);
    const source = await readFile(fileName, "utf8");
    const output = ts.transpileModule(source, {
      fileName,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
        isolatedModules: true,
      },
    });
    return { format: "module", source: output.outputText, shortCircuit: true };
  }

  return nextLoad(url, context);
}
