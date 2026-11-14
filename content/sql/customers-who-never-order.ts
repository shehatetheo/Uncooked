import { defineSql } from "@/lib/content/types";

export default defineSql({
  id: "customers-who-never-order",
  title: "Customers Who Never Order",
  difficulty: "easy",
  concept: "LEFT JOIN + IS NULL",
  tags: ["seed"],
  statement: `Table Customers has one row per customer: id (primary key), name. Two different customers can share a name.

Table Orders has one row per order: id (primary key), customerId (the id of the customer who placed it). A customer can have many orders or none.

Return the name of every customer who has never placed an order, in a single column called Customers. Row order does not matter.`,
  setup: `CREATE TABLE Customers (
  id INTEGER PRIMARY KEY,
  name TEXT
);
CREATE TABLE Orders (
  id INTEGER PRIMARY KEY,
  customerId INTEGER
);
INSERT INTO Customers (id, name) VALUES
  (1, 'Joe'),
  (2, 'Henry'),
  (3, 'Sam'),
  (4, 'Max'),
  (5, 'Ines');
INSERT INTO Orders (id, customerId) VALUES
  (1, 3),
  (2, 1),
  (3, 1);`,
  hiddenSetups: [
    `CREATE TABLE Customers (
  id INTEGER PRIMARY KEY,
  name TEXT
);
CREATE TABLE Orders (
  id INTEGER PRIMARY KEY,
  customerId INTEGER
);
INSERT INTO Customers (id, name) VALUES
  (1, 'Ana'),
  (2, 'Bo');`,
    `CREATE TABLE Customers (
  id INTEGER PRIMARY KEY,
  name TEXT
);
CREATE TABLE Orders (
  id INTEGER PRIMARY KEY,
  customerId INTEGER
);
INSERT INTO Customers (id, name) VALUES
  (1, 'Sam'),
  (2, 'Lee'),
  (3, 'Sam'),
  (4, 'Kim');
INSERT INTO Orders (id, customerId) VALUES
  (1, 1),
  (2, 2),
  (3, 2);`,
  ],
  solution: `SELECT c.name AS Customers
FROM Customers c
LEFT JOIN Orders o
  ON o.customerId = c.id
WHERE o.id IS NULL;`,
  myWords:
    "I LEFT JOIN customers to orders so every customer survives the join, even with no orders. Customers without an order get NULL in all the order columns, so I keep only the rows where the order id IS NULL. This is called an anti-join.",
  understand: [
    {
      prompt: "After Customers LEFT JOIN Orders, what does a customer with no orders look like?",
      choices: [
        "The customer is missing from the joined rows",
        "One row with the customer's columns and NULL in every Orders column",
        "One row per order in the whole Orders table",
        "One row with 0 in the Orders columns",
      ],
      answer: 1,
      explain: "A LEFT JOIN keeps unmatched left rows and fills the right side with NULL. That NULL is the signal to filter on.",
    },
    {
      prompt: "Which filter keeps only the customers without orders?",
      choices: ["WHERE o.id = NULL", "WHERE o.id = 0", "HAVING COUNT(*) = 0", "WHERE o.id IS NULL"],
      answer: 3,
      explain: "NULL is never equal to anything, including NULL, so = NULL matches no rows. IS NULL is the test for a missing value.",
    },
    {
      prompt: "Why does an INNER JOIN not work here?",
      choices: [
        "It only returns matching pairs, so the customers you want are exactly the ones it drops",
        "It is slower than a LEFT JOIN",
        "It cannot join on customerId",
        "It returns duplicate customers",
      ],
      answer: 0,
      explain: "An INNER JOIN returns customers that have at least one order. The answer is the set with no match, which only an outer join (or NOT EXISTS) can expose.",
    },
  ],
  hints: [
    "You are looking for rows in Customers with no partner in Orders. Start from Customers and keep all of them.",
    "After a LEFT JOIN, unmatched customers have NULL in the Orders columns.",
    "Filter with WHERE o.id IS NULL and select the name with the alias Customers.",
  ],
  followUps: [
    {
      q: "What would an INNER JOIN return here instead?",
      a: "Only customers who have orders, one row per order. Adding WHERE o.id IS NULL after an INNER JOIN returns nothing, because every surviving row has a real order id.",
    },
    {
      q: "Can you write it without a join?",
      a: "Yes: SELECT name FROM Customers c WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.customerId = c.id). NOT IN (SELECT customerId FROM Orders) also works, but only while customerId is never NULL.",
    },
    {
      q: "Why is NOT IN risky when the subquery can return NULL?",
      a: "x NOT IN (1, NULL) is never true: the comparison with NULL is unknown, so the whole condition is unknown and every row is filtered out. NOT EXISTS and LEFT JOIN + IS NULL do not have this problem.",
    },
  ],
  links: { leetcode: "https://leetcode.com/problems/customers-who-never-order/" },
});
