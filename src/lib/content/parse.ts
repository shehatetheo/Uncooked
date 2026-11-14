import type { z } from "zod";

/** Parse content at module load. Invalid content throws, which fails the build. */
export function parseAll<S extends z.ZodType>(schema: S, items: unknown[], kind: string): z.infer<S>[] {
  const out: z.infer<S>[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const r = schema.safeParse(item);
    const id = (item as { id?: string })?.id ?? "?";
    if (!r.success) throw new Error(`Invalid ${kind} "${id}":\n${r.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`);
    if (seen.has(id)) throw new Error(`Duplicate ${kind} id "${id}"`);
    seen.add(id);
    out.push(r.data);
  }
  return out;
}
