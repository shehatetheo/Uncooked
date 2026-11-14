import { PageHeader, Panel } from "@/components/ui";

const COMPLEXITY: [string, string, string][] = [
  ["list[i], list.append(x), list.pop()", "O(1)", "append is amortized O(1)"],
  ["x in list, list.index(x), list.insert(0, x), list.pop(0)", "O(n)", "use a set for membership, deque for the front"],
  ["x in set / dict, d[k], d[k] = v, set.add(x)", "O(1) avg", "hashing; worst case O(n) is rare"],
  ["sorted(xs), xs.sort()", "O(n log n)", "Timsort, stable; O(n) if already sorted"],
  ["Counter(xs), set(xs), ''.join(parts)", "O(n)", "one pass"],
  ["s + t in a loop", "O(n²) total", "strings are immutable; build a list and join"],
  ["slicing xs[a:b], xs[::-1]", "O(k)", "copies k items"],
  ["binary search", "O(log n)", "input must be sorted"],
  ["heapq.heappush / heappop", "O(log n)", "heapify is O(n)"],
  ["deque.append / appendleft / popleft", "O(1)", "queue for BFS"],
  ["DFS / BFS on a tree or grid", "O(nodes)", "recursion uses O(depth) stack space"],
  ["two nested loops over n", "O(n²)", "the usual brute force to beat"],
];

const SORTS: [string, string, string, string][] = [
  ["Merge sort", "O(n log n)", "O(n)", "stable"],
  ["Quicksort", "O(n log n) avg, O(n²) worst", "O(log n)", "not stable"],
  ["Timsort (Python)", "O(n log n), O(n) best", "O(n)", "stable"],
  ["Heap sort", "O(n log n)", "O(1)", "not stable"],
  ["Insertion / bubble", "O(n²)", "O(1)", "stable"],
  ["Counting / bucket", "O(n + k)", "O(n + k)", "not a comparison sort"],
];

const TRICKS: [string, string, string][] = [
  ["sorted with a key", "sorted(students, key=lambda s: (-s[1], s[0]))", "Grade descending, then name ascending. Negate a number to flip its order."],
  ["Counter.most_common", "Counter(words).most_common(1)[0][0]", "The most frequent item. most_common(k) gives the top k as (item, count) pairs."],
  ["defaultdict", "g = defaultdict(list); g[key].append(x)", "Group things without checking whether the key exists first."],
  ["enumerate", "for i, x in enumerate(xs):", "Index and value together. Never write range(len(xs)) to get both."],
  ["zip", "for a, b in zip(xs, xs[1:]):", "Walk neighbouring pairs, or two lists in step."],
  ["slicing", "s[::-1]   xs[-k:]   xs[:k]", "Reverse, last k, first k. Slices copy."],
  ["join, not +=", '"".join(parts)', "Strings are immutable, so += in a loop is O(n²). Collect then join."],
  ["str cleanup", "c.isalnum()   s.lower()   s.split()", "split() with no argument also drops extra spaces."],
  ["tuple swap", "a, b = b, a + b", "The right side is evaluated first, so no temp variable."],
  ["dict.get", "seen.get(x, 0) + 1", "Read with a default instead of an if."],
  ["any / all", "any(a < b for a, b in zip(xs, xs[1:]))", "Short-circuit over a generator."],
  ["set operations", "set(a) & set(b)   set(a) - set(b)", "Intersection and difference in O(n)."],
  ["infinity", 'lo = float("inf")', "A starting value any real number beats."],
  ["integer division", "m = (l + r) // 2", "// floors. / always gives a float."],
];

const Cell = ({ children, code }: { children: React.ReactNode; code?: boolean }) => (
  <td className={`border-b border-line px-3 py-2 align-top ${code ? "whitespace-pre-wrap text-accent" : ""}`}>{children}</td>
);

export default function SheetsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader kicker="Cheat sheets" title="Know these by heart">Read them once a day. In the interview, say the complexity before they ask.</PageHeader>

      <Panel title="Big-O of common Python operations">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {COMPLEXITY.map(([op, big, note]) => (
                <tr key={op}><Cell code>{op}</Cell><Cell><span className="whitespace-nowrap text-second">{big}</span></Cell><Cell><span className="text-dim">{note}</span></Cell></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Sorting algorithms">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="label text-left"><th className="px-3 py-2">Sort</th><th className="px-3 py-2">Time</th><th className="px-3 py-2">Space</th><th className="px-3 py-2">Stable?</th></tr></thead>
            <tbody>
              {SORTS.map(([n, t, sp, st]) => <tr key={n}><Cell>{n}</Cell><Cell><span className="text-second">{t}</span></Cell><Cell>{sp}</Cell><Cell><span className="text-dim">{st}</span></Cell></tr>)}
            </tbody>
          </table>
        </div>
        <p className="px-3 py-2 text-xs text-dim">Stable means equal items keep their original order. That's why sorting by name, then by grade, leaves names ordered within a grade.</p>
      </Panel>

      <Panel title="Python tricks">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {TRICKS.map(([name, code, why]) => (
                <tr key={name}><Cell><span className="whitespace-nowrap">{name}</span></Cell><Cell code>{code}</Cell><Cell><span className="text-dim">{why}</span></Cell></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
