"use client";
import type { SqlJsStatic } from "sql.js";

let loading: Promise<SqlJsStatic> | null = null;

/** Load sql.js (SQLite compiled to WebAssembly) from /public on first use. */
export function loadSql(): Promise<SqlJsStatic> {
  loading ??= new Promise<SqlJsStatic>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "/sqljs/sql-wasm.js";
    s.onload = () => {
      const init = (window as unknown as { initSqlJs: (c: { locateFile: (f: string) => string }) => Promise<SqlJsStatic> }).initSqlJs;
      init({ locateFile: (f) => `/sqljs/${f}` }).then(resolve, reject);
    };
    s.onerror = () => {
      loading = null;
      reject(new Error("Could not load the SQL engine."));
    };
    document.head.appendChild(s);
  });
  return loading;
}
