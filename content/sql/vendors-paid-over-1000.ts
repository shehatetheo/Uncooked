import { defineSql } from "@/lib/content/types";

export default defineSql({
  id: "vendors-paid-over-1000",
  title: "Vendors Paid Over 1000",
  difficulty: "easy",
  concept: "WHERE vs HAVING",
  tags: ["original"],
  statement: `The accounts payable team keeps one table.

Table invoices has one row per invoice: invoice_id (primary key), vendor, status, amount. status is one of 'paid', 'open' or 'void'.

For each vendor, add up the amounts of its paid invoices only. Return the vendors whose paid total is strictly greater than 1000, with two columns: vendor and paid_total. Open and void invoices must not count towards the total. Row order does not matter.`,
  setup: `CREATE TABLE invoices (
  invoice_id INTEGER PRIMARY KEY,
  vendor TEXT NOT NULL,
  status TEXT NOT NULL,
  amount INTEGER NOT NULL
);
INSERT INTO invoices (invoice_id, vendor, status, amount) VALUES
  (1, 'Helix Supply', 'paid', 600),
  (2, 'Helix Supply', 'paid', 700),
  (3, 'Kestrel Parts', 'paid', 400),
  (4, 'Kestrel Parts', 'open', 900),
  (5, 'Lumen Tools', 'paid', 1500),
  (6, 'Mosaic Freight', 'void', 2000),
  (7, 'Mosaic Freight', 'paid', 300),
  (8, 'Orchid Labs', 'paid', 1000),
  (9, 'Kestrel Parts', 'paid', 500);`,
  hiddenSetups: [
    `CREATE TABLE invoices (
  invoice_id INTEGER PRIMARY KEY,
  vendor TEXT NOT NULL,
  status TEXT NOT NULL,
  amount INTEGER NOT NULL
);
INSERT INTO invoices (invoice_id, vendor, status, amount) VALUES
  (1, 'Atlas Metals', 'paid', 250),
  (2, 'Atlas Metals', 'paid', 250),
  (3, 'Atlas Metals', 'paid', 250),
  (4, 'Atlas Metals', 'paid', 251),
  (5, 'Brink Chemicals', 'open', 5000),
  (6, 'Brink Chemicals', 'paid', 1000),
  (7, 'Cedar Packaging', 'paid', 999),
  (8, 'Cedar Packaging', 'void', 2);`,
    `CREATE TABLE invoices (
  invoice_id INTEGER PRIMARY KEY,
  vendor TEXT NOT NULL,
  status TEXT NOT NULL,
  amount INTEGER NOT NULL
);
INSERT INTO invoices (invoice_id, vendor, status, amount) VALUES
  (1, 'Dune Energy', 'paid', 2000),
  (2, 'Dune Energy', 'void', 2000),
  (3, 'Ember Print', 'paid', 1200),
  (4, 'Ember Print', 'paid', 1200),
  (5, 'Flint Tools', 'open', 3000),
  (6, 'Flint Tools', 'paid', 800);`,
  ],
  solution: `SELECT vendor, SUM(amount) AS paid_total
FROM invoices
WHERE status = 'paid'
GROUP BY vendor
HAVING SUM(amount) > 1000;`,
  myWords:
    "There are two filters and they happen at different times. WHERE status = 'paid' removes single invoices before grouping, so only paid amounts get summed. HAVING SUM(amount) > 1000 runs after grouping and removes whole vendors whose total is too small.",
  understand: [
    {
      prompt: "The condition status = 'paid' is about single invoices. Where does it go?",
      choices: [
        "In HAVING, after the GROUP BY",
        "In WHERE, before the GROUP BY",
        "In ORDER BY",
        "In the SELECT list",
      ],
      answer: 1,
      explain: "WHERE filters rows before they are grouped. Only invoices that pass it are added into the sum.",
    },
    {
      prompt: "The condition 'paid total greater than 1000' is about a whole vendor. Where does it go?",
      choices: [
        "In WHERE, as amount > 1000",
        "In WHERE, as SUM(amount) > 1000",
        "In GROUP BY",
        "In HAVING, as SUM(amount) > 1000",
      ],
      answer: 3,
      explain: "The total only exists after grouping, so the test belongs in HAVING. WHERE amount > 1000 tests single invoices and would miss a vendor paid 600 + 700.",
    },
    {
      prompt: "What goes wrong if you leave out WHERE status = 'paid'?",
      choices: [
        "Open and void invoices are added into the totals, so vendors pass the threshold that should not",
        "The query fails because status is not in GROUP BY",
        "Nothing, HAVING already ignores unpaid invoices",
        "Vendors with no paid invoices get a total of NULL",
      ],
      answer: 0,
      explain: "On the sample data Kestrel Parts would reach 1800 and Mosaic Freight 2300, although their paid totals are 900 and 300.",
    },
  ],
  hints: [
    "There are two conditions. One is about a single invoice, the other is about a vendor's total.",
    "Row conditions go in WHERE and run before GROUP BY. Conditions on an aggregate go in HAVING and run after it.",
    "WHERE status = 'paid', GROUP BY vendor, HAVING SUM(amount) > 1000.",
  ],
  followUps: [
    {
      q: "What happens if you write WHERE amount > 1000 instead of the HAVING?",
      a: "You filter single invoices, not totals. Helix Supply (600 + 700) drops out even though its paid total is 1300. Only vendors with one large invoice survive.",
    },
    {
      q: "Could you put status = 'paid' in HAVING instead of WHERE?",
      a: "No. By the time HAVING runs, the rows are already collapsed and the unpaid amounts are already in the sum. Standard SQL also rejects a non-grouped column in HAVING. Filtering in WHERE is correct and faster, because fewer rows get grouped.",
    },
    {
      q: "How would you show every vendor with its paid total, including vendors with no paid invoices?",
      a: "Drop the WHERE and move the condition inside the aggregate: SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), grouped by vendor. Every vendor keeps a row and unpaid invoices add 0.",
    },
  ],
});
