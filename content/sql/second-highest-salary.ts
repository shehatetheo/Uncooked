import { defineSql } from "@/lib/content/types";

export default defineSql({
  id: "second-highest-salary",
  title: "Second Highest Salary",
  difficulty: "medium",
  concept: "DISTINCT + ORDER BY + LIMIT/OFFSET",
  tags: ["seed"],
  statement: `Table Employee has one row per employee: id (primary key), salary. Several employees can earn the same salary.

Return the second highest distinct salary, in a single column called SecondHighestSalary. If the two best-paid employees both earn 300 and the next one earns 200, the answer is 200.

The result must always be exactly one row. If there is no second highest salary (for example, everyone earns the same amount), return a single row containing NULL.`,
  setup: `CREATE TABLE Employee (
  id INTEGER PRIMARY KEY,
  salary INTEGER
);
INSERT INTO Employee (id, salary) VALUES
  (1, 300),
  (2, 200),
  (3, 300),
  (4, 100);`,
  hiddenSetups: [
    `CREATE TABLE Employee (
  id INTEGER PRIMARY KEY,
  salary INTEGER
);
INSERT INTO Employee (id, salary) VALUES
  (1, 150),
  (2, 150);`,
    `CREATE TABLE Employee (
  id INTEGER PRIMARY KEY,
  salary INTEGER
);
INSERT INTO Employee (id, salary) VALUES
  (1, 90),
  (2, 400),
  (3, 500),
  (4, 400);`,
  ],
  solution: `SELECT (
  SELECT DISTINCT salary
  FROM Employee
  ORDER BY salary DESC
  LIMIT 1 OFFSET 1
) AS SecondHighestSalary;`,
  myWords:
    "I take the distinct salaries, sort them from high to low, skip the first one and take the next one. I wrap that in an outer SELECT because a subquery used as a value returns NULL when it finds no row, which gives me the required single NULL row instead of an empty result.",
  understand: [
    {
      prompt: "The salaries are 300, 300, 200, 100. What is the second highest salary?",
      choices: ["300", "200", "100", "NULL"],
      answer: 1,
      explain: "The question is about distinct salary values. The values are 300, 200, 100, so the second highest is 200. Without DISTINCT you would get 300.",
    },
    {
      prompt: "What does LIMIT 1 OFFSET 1 do after ORDER BY salary DESC?",
      choices: [
        "Returns the highest salary",
        "Returns the two highest salaries",
        "Returns the lowest salary",
        "Skips the first row and returns the next one",
      ],
      answer: 3,
      explain: "OFFSET 1 skips one row (the highest), LIMIT 1 then takes one row (the second highest).",
    },
    {
      prompt: "Why wrap the query in an outer SELECT ( ... )?",
      choices: [
        "A scalar subquery with no row evaluates to NULL, so the outer SELECT still returns one row",
        "It makes the query faster",
        "DISTINCT is only allowed inside a subquery",
        "LIMIT is only allowed inside a subquery",
      ],
      answer: 0,
      explain: "On its own the inner query returns zero rows when there is no second salary. Used as a value in an outer SELECT, the missing row becomes NULL.",
    },
  ],
  hints: [
    "Sort the salaries from highest to lowest. The answer is the second row, once duplicates are removed.",
    "SELECT DISTINCT salary ... ORDER BY salary DESC LIMIT 1 OFFSET 1 gets the value, but returns no row at all when there is no second salary.",
    "Put that query in parentheses inside another SELECT. A scalar subquery that finds nothing evaluates to NULL.",
  ],
  followUps: [
    {
      q: "Can you do it without LIMIT?",
      a: "SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee). MAX over zero rows is NULL, so the NULL case works without extra wrapping.",
    },
    {
      q: "How would you generalise it to the Nth highest salary?",
      a: "Use OFFSET N - 1 with the same DISTINCT and ORDER BY, or rank the salaries with DENSE_RANK() OVER (ORDER BY salary DESC) in a subquery and filter on rank = N.",
    },
    {
      q: "Why DENSE_RANK and not RANK or ROW_NUMBER for the window version?",
      a: "With salaries 300, 300, 200, RANK gives 1, 1, 3 so there is no rank 2, and ROW_NUMBER gives 1, 2, 3 so row 2 is still 300. DENSE_RANK gives 1, 1, 2, which matches the idea of distinct salary levels.",
    },
  ],
  links: { leetcode: "https://leetcode.com/problems/second-highest-salary/" },
});
