import { defineSql } from "@/lib/content/types";

export default defineSql({
  id: "top-two-revenues-per-region",
  title: "Top Two Revenues per Region",
  difficulty: "medium",
  concept: "DENSE_RANK top-N per group",
  tags: ["original"],
  statement: `A sales report is stored in one table.

Table product_revenue has one row per product line per region: region, product, revenue. Several products in the same region can have exactly the same revenue.

For each region, find the two highest distinct revenue values, and return every product whose revenue is one of those two values. Return three columns: region, product, revenue.

Ties count as one level: if the revenues in a region are 900, 900, 700 and 500, the two highest values are 900 and 700, so three products are returned. A region with only one revenue value returns just the products at that value. Row order does not matter.`,
  setup: `CREATE TABLE product_revenue (
  region TEXT NOT NULL,
  product TEXT NOT NULL,
  revenue INTEGER NOT NULL
);
INSERT INTO product_revenue (region, product, revenue) VALUES
  ('North', 'Pumps', 900),
  ('North', 'Valves', 900),
  ('North', 'Seals', 700),
  ('North', 'Filters', 500),
  ('South', 'Pumps', 400),
  ('South', 'Valves', 650),
  ('South', 'Seals', 300),
  ('West', 'Filters', 800),
  ('East', 'Pumps', 500),
  ('East', 'Valves', 500),
  ('East', 'Seals', 500),
  ('East', 'Filters', 200);`,
  hiddenSetups: [
    `CREATE TABLE product_revenue (
  region TEXT NOT NULL,
  product TEXT NOT NULL,
  revenue INTEGER NOT NULL
);
INSERT INTO product_revenue (region, product, revenue) VALUES
  ('Alpine', 'Drills', 100),
  ('Alpine', 'Saws', 100),
  ('Alpine', 'Lathes', 100),
  ('Coastal', 'Drills', 250),
  ('Coastal', 'Saws', 240),
  ('Coastal', 'Lathes', 230),
  ('Coastal', 'Mills', 240);`,
    `CREATE TABLE product_revenue (
  region TEXT NOT NULL,
  product TEXT NOT NULL,
  revenue INTEGER NOT NULL
);
INSERT INTO product_revenue (region, product, revenue) VALUES
  ('Delta', 'Pumps', 10),
  ('Harbor', 'Seals', 10),
  ('Harbor', 'Pumps', 30),
  ('Harbor', 'Valves', 20),
  ('Harbor', 'Filters', 5);`,
  ],
  solution: `SELECT region, product, revenue
FROM (
  SELECT region, product, revenue,
         DENSE_RANK() OVER (
           PARTITION BY region
           ORDER BY revenue DESC
         ) AS rnk
  FROM product_revenue
) AS ranked
WHERE rnk <= 2;`,
  myWords:
    "I number the rows inside each region by revenue, highest first, using DENSE_RANK so tied products share a rank and the next value gets the very next rank. A window function cannot be filtered in the same query's WHERE, so I compute the rank in a subquery and keep rank 1 and 2 outside it.",
  understand: [
    {
      prompt: "What does PARTITION BY region do inside OVER()?",
      choices: [
        "Collapses each region into a single row",
        "Restarts the ranking for each region while keeping every row",
        "Sorts the final output by region",
        "Removes regions with fewer than two products",
      ],
      answer: 1,
      explain: "A window function keeps all rows. PARTITION BY only defines the group in which the ranking is computed, so each region has its own rank 1.",
    },
    {
      prompt: "Revenues in a region are 900, 900, 700, 500. Which ranks do the functions assign to 700?",
      choices: [
        "RANK 2, DENSE_RANK 2, ROW_NUMBER 2",
        "RANK 2, DENSE_RANK 3, ROW_NUMBER 3",
        "RANK 3, DENSE_RANK 3, ROW_NUMBER 3",
        "RANK 3, DENSE_RANK 2, ROW_NUMBER 3",
      ],
      answer: 3,
      explain: "RANK leaves a gap after a tie (1, 1, 3). DENSE_RANK does not (1, 1, 2). ROW_NUMBER ignores ties (1, 2, 3). Only DENSE_RANK puts 700 at the second level.",
    },
    {
      prompt: "Why is the ranking computed in a subquery and filtered outside?",
      choices: [
        "Window functions are evaluated after WHERE, so the rank does not exist yet when WHERE runs",
        "Subqueries are faster than window functions",
        "DENSE_RANK only works inside a subquery",
        "PARTITION BY needs a GROUP BY in the outer query",
      ],
      answer: 0,
      explain: "Logical order is FROM, WHERE, GROUP BY, HAVING, then the SELECT list with its window functions. To filter on a window result you need another query level.",
    },
  ],
  hints: [
    "You need a rank that restarts for each region. That is a window function with PARTITION BY region ORDER BY revenue DESC.",
    "Think about ties: should the product after two tied leaders be rank 2 or rank 3? The statement wants it at level 2.",
    "Compute DENSE_RANK() in a subquery, then SELECT from it WHERE rnk <= 2.",
  ],
  followUps: [
    {
      q: "What would RANK() return here instead of DENSE_RANK()?",
      a: "After two products tied at rank 1, RANK jumps to 3, so the next value is filtered out by rnk <= 2. On the sample data North would lose Seals and East would lose Filters.",
    },
    {
      q: "And ROW_NUMBER()?",
      a: "It gives every row a different number, so exactly two rows per region survive, and which of the tied rows is kept is arbitrary. Use it when you need exactly N rows, not N levels.",
    },
    {
      q: "How would you do this without window functions?",
      a: "With a correlated subquery that counts the distinct higher revenues in the same region: WHERE (SELECT COUNT(DISTINCT p2.revenue) FROM product_revenue p2 WHERE p2.region = p.region AND p2.revenue > p.revenue) < 2. It works, but it is harder to read and usually slower.",
    },
  ],
});
