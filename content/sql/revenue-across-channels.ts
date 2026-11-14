import { defineSql } from "@/lib/content/types";

export default defineSql({
  id: "revenue-across-channels",
  title: "Revenue Across Channels",
  difficulty: "medium",
  concept: "UNION vs UNION ALL",
  tags: ["original"],
  statement: `A hardware retailer records sales in two separate tables, one per sales channel.

Table online_sales has one row per web shop sale: sale_id (primary key), product, amount.

Table store_sales has one row per in-store sale: sale_id (primary key), product, amount. The two tables number their sales independently, so the same sale_id can exist in both.

Return the total revenue per product across both channels, with two columns: product and total_revenue. Every sale counts, including sales of the same product for the same amount. A product sold in only one channel must still appear. Row order does not matter.`,
  setup: `CREATE TABLE online_sales (
  sale_id INTEGER PRIMARY KEY,
  product TEXT NOT NULL,
  amount INTEGER NOT NULL
);
CREATE TABLE store_sales (
  sale_id INTEGER PRIMARY KEY,
  product TEXT NOT NULL,
  amount INTEGER NOT NULL
);
INSERT INTO online_sales (sale_id, product, amount) VALUES
  (1, 'Laptop', 1200),
  (2, 'Monitor', 300),
  (3, 'Laptop', 1200),
  (4, 'Keyboard', 80),
  (5, 'Dock', 150);
INSERT INTO store_sales (sale_id, product, amount) VALUES
  (1, 'Laptop', 1200),
  (2, 'Monitor', 300),
  (3, 'Mouse', 40),
  (4, 'Keyboard', 95),
  (5, 'Mouse', 40);`,
  hiddenSetups: [
    `CREATE TABLE online_sales (
  sale_id INTEGER PRIMARY KEY,
  product TEXT NOT NULL,
  amount INTEGER NOT NULL
);
CREATE TABLE store_sales (
  sale_id INTEGER PRIMARY KEY,
  product TEXT NOT NULL,
  amount INTEGER NOT NULL
);
INSERT INTO online_sales (sale_id, product, amount) VALUES
  (1, 'Router', 200),
  (2, 'Router', 200),
  (3, 'Switch', 450);`,
    `CREATE TABLE online_sales (
  sale_id INTEGER PRIMARY KEY,
  product TEXT NOT NULL,
  amount INTEGER NOT NULL
);
CREATE TABLE store_sales (
  sale_id INTEGER PRIMARY KEY,
  product TEXT NOT NULL,
  amount INTEGER NOT NULL
);
INSERT INTO online_sales (sale_id, product, amount) VALUES
  (1, 'Cable', 10),
  (2, 'Hub', 60);
INSERT INTO store_sales (sale_id, product, amount) VALUES
  (1, 'Cable', 10),
  (2, 'Cable', 10),
  (3, 'Hub', 55),
  (4, 'Stand', 35);`,
  ],
  solution: `SELECT product, SUM(amount) AS total_revenue
FROM (
  SELECT product, amount FROM online_sales
  UNION ALL
  SELECT product, amount FROM store_sales
) AS all_sales
GROUP BY product;`,
  myWords:
    "The two tables have the same shape, so I stack them into one list of sales and then group by product. It has to be UNION ALL: plain UNION removes duplicate rows, and two Laptop sales for 1200 are two real sales, not a duplicate. With UNION the revenue would be too low and nothing would look wrong.",
  understand: [
    {
      prompt: "Two tables with the same columns need to become one longer list of rows. Which operation does that?",
      choices: [
        "INNER JOIN on product",
        "CROSS JOIN",
        "UNION or UNION ALL",
        "GROUP BY product",
      ],
      answer: 2,
      explain: "Set operations stack result sets vertically. Joins put columns side by side and would pair every online sale of a product with every store sale of it.",
    },
    {
      prompt: "What is the difference between UNION and UNION ALL?",
      choices: [
        "UNION ALL keeps every row; UNION removes duplicate rows from the combined result",
        "UNION keeps every row; UNION ALL removes duplicates",
        "UNION ALL also includes rows with NULL; UNION skips them",
        "There is no difference in the result, only in speed",
      ],
      answer: 0,
      explain: "UNION behaves like UNION ALL followed by DISTINCT over the whole row. UNION ALL just appends, which is also cheaper.",
    },
    {
      prompt: "On the sample data there are three Laptop sales of 1200. What total does plain UNION give for Laptop?",
      choices: ["3600", "2400", "0", "1200"],
      answer: 3,
      explain: "The three rows ('Laptop', 1200) are identical, so UNION keeps one of them. The correct total with UNION ALL is 3600.",
    },
  ],
  hints: [
    "Both tables describe the same thing. First turn them into one combined list of (product, amount) rows.",
    "Stack the two SELECTs with a set operation inside a subquery, then GROUP BY product outside it.",
    "Check what happens to two identical sales. UNION collapses them, UNION ALL keeps both.",
  ],
  followUps: [
    {
      q: "When is plain UNION the right choice?",
      a: "When you want a distinct list, for example every product that was sold in either channel: SELECT product FROM online_sales UNION SELECT product FROM store_sales. Here duplicates carry no information.",
    },
    {
      q: "Why not join the two tables on product and add the amounts?",
      a: "An INNER JOIN drops products sold in only one channel, and for the others it pairs every online sale with every store sale, so amounts are counted several times. A join combines columns; this task needs more rows.",
    },
    {
      q: "Which is faster, UNION or UNION ALL?",
      a: "UNION ALL. UNION has to sort or hash the combined rows to find duplicates. If you know the inputs cannot overlap, or you want every row, use UNION ALL.",
    },
  ],
});
