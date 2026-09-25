import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import ts from "typescript";

// Compile application modules in-memory, with explicit database doubles for import tests.
export function loadTypeScript(filename, overrides = {}, cache = new Map()) {
  const absolute = resolve(filename);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const module = { exports: {} };
  cache.set(absolute, module);
  const require = createRequire(absolute);
  const localRequire = (name) => {
    if (Object.hasOwn(overrides, name)) return overrides[name];
    return name.startsWith(".")
      ? loadTypeScript(
          resolve(dirname(absolute), `${name}.ts`),
          overrides,
          cache,
        )
      : require(name);
  };
  const { outputText } = ts.transpileModule(readFileSync(absolute, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  new Function("require", "module", "exports", outputText)(
    localRequire,
    module,
    module.exports,
  );
  return module.exports;
}
