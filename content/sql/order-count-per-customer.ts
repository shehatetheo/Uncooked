import { defineSql } from "@/lib/content/types";

export default defineSql({
  id: "order-count-per-customer",
  title: "Order Count per Customer",
  difficulty: "easy",
  concept: "INNER vs LEFT JOIN, COUNT(col) vs COUNT(*)",
  tags: ["original"],
  statement: `A wholesaler keeps two tables.

Table customers has one row per customer account: customer_id (primary key), name. Two different accounts can have the same name.

Table orders has one row per order: order_id (primary key), customer_id, amount. Walk-in sales are stored with customer_id NULL.

Return one row for every customer account with two columns: name and order_count, the number of orders that account has placed. Accounts with no orders must appear with an order_count of 0. Row order does not matter.`,
  setup: `CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  amount REAL NOT NULL
);
INSERT INTO customers (customer_id, name) VALUES
  (1, 'Acme Retail'),
  (2, 'Borealis GmbH'),
  (3, 'Cobalt Foods'),
  (4, 'Delta Logistics'),
  (5, 'Evergreen Ltd');
INSERT INTO orders (order_id, customer_id, amount) VALUES
  (1001, 1, 250.00),
  (1002, 1, 90.50),
  (1003, 2, 410.00),
  (1004, 4, 35.00),
  (1005, 1, 120.00),
  (1006, 4, 600.00),
  (1007, NULL, 15.00);`,
  hiddenSetups: [
    `CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  amount REAL NOT NULL
);
INSERT INTO customers (customer_id, name) VALUES
  (1, 'Nordwind'),
  (2, 'Nordwind'),
  (3, 'Pioneer AG');
INSERT INTO orders (order_id, customer_id, amount) VALUES
  (1, 1, 75.00),
  (2, 1, 20.00),
  (3, 3, 310.00);`,
    `CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  amount REAL NOT NULL
);
INSERT INTO customers (customer_id, name) VALUES
  (1, 'Quartz Inc'),
  (2, 'Rivet Co');
INSERT INTO orders (order_id, customer_id, amount) VALUES
  (1, NULL, 9.99);`,
  ],
  solution: `SELECT c.name, COUNT(o.order_id) AS order_count
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name;`,
  myWords:
    "I LEFT JOIN customers to orders so accounts with no orders are still in the result, then group by the customer. I count o.order_id and not COUNT(*), because a customer with no orders still has one joined row full of NULLs, and COUNT of a column skips NULLs while COUNT(*) would count that row as 1.",
  understand: [
    {
      prompt: "With an INNER JOIN, what happens to an account that has no orders?",
      choices: [
        "It appears with order_count 0",
        "It appears with order_count NULL",
        "It is missing from the result",
        "The query fails",
      ],
      answer: 2,
      explain: "An INNER JOIN only returns matching pairs. An account with no orders has no pair, so it never reaches the GROUP BY.",
    },
    {
      prompt: "After the LEFT JOIN, an account with no orders has one row with NULL order columns. What do the two counts return for it?",
      choices: [
        "COUNT(*) = 1 and COUNT(o.order_id) = 0",
        "COUNT(*) = 0 and COUNT(o.order_id) = 0",
        "COUNT(*) = 1 and COUNT(o.order_id) = 1",
        "COUNT(*) = 0 and COUNT(o.order_id) = NULL",
      ],
      answer: 0,
      explain: "COUNT(*) counts rows, and the NULL-padded row is still a row. COUNT(column) counts only non-NULL values, so it gives the correct 0.",
    },
    {
      prompt: "Why group by customer_id and not only by name?",
      choices: [
        "Grouping by a text column is not allowed",
        "Two accounts can share a name, and grouping by name would merge them into one row",
        "customer_id sorts the output",
        "It makes COUNT skip NULLs",
      ],
      answer: 1,
      explain: "The statement asks for one row per account. The primary key identifies an account; a name does not.",
    },
  ],
  hints: [
    "Every customer must appear, even with no orders. Which table do you keep in full?",
    "customers LEFT JOIN orders, then GROUP BY the customer. Now look at what you are counting for a customer with no orders.",
    "COUNT(o.order_id) ignores the NULL from the unmatched row and returns 0. Group by c.customer_id so accounts with the same name stay separate.",
  ],
  followUps: [
    {
      q: "What would an INNER JOIN return here instead?",
      a: "Only the accounts with at least one order: 3 rows on the sample data instead of 5. Cobalt Foods and Evergreen Ltd disappear, and nothing warns you.",
    },
    {
      q: "Where does the walk-in order with customer_id NULL go?",
      a: "Nowhere. NULL = c.customer_id is never true, so it matches no customer. It would only show up if orders were the preserved side of an outer join.",
    },
    {
      q: "How would you also show the total amount, with 0 for accounts without orders?",
      a: "Add COALESCE(SUM(o.amount), 0). SUM over only NULLs returns NULL, not 0, so COALESCE supplies the default.",
    },
  ],
});
