// Copies the Pyodide and sql.js runtimes into /public so they are served
// same-origin (cacheable by the service worker, no CDN dependency).
import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const copy = (pkgDir, files, dest) => {
  mkdirSync(join(root, "public", dest), { recursive: true });
  for (const f of files) cpSync(join(root, "node_modules", pkgDir, f), join(root, "public", dest, f));
};

copy("pyodide", ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"], "pyodide");
copy("sql.js/dist", ["sql-wasm.js", "sql-wasm.wasm"], "sqljs");
console.log("runtime assets copied to public/");
