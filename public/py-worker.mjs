// Runs Python in a dedicated worker so a runaway loop can be killed by
// terminating the worker from the main thread.
import { loadPyodide } from "/pyodide/pyodide.mjs";

let ready = null;

self.onmessage = async (e) => {
  const { id, type } = e.data;
  try {
    if (type === "init") {
      ready ??= (async () => {
        const py = await loadPyodide({ indexURL: "/pyodide/" });
        py.runPython(e.data.harness);
        return py;
      })();
      await ready;
      self.postMessage({ id, ok: true });
    } else if (type === "run") {
      const py = await ready;
      const run = py.globals.get("run_tests");
      const out = run(JSON.stringify(e.data.payload));
      run.destroy?.();
      self.postMessage({ id, ok: true, raw: JSON.parse(out) });
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err?.message ?? err) });
  }
};
