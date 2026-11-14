import { defineSql } from "@/lib/content/types";

export default defineSql({
  id: "out-earning-the-manager",
  title: "Out-Earning the Manager",
  difficulty: "easy",
  concept: "Self-join",
  tags: ["original"],
  statement: `HR keeps the whole reporting line in one table.

Table employees has one row per employee: emp_id (primary key), name, salary, manager_id. manager_id is the emp_id of the employee's direct manager, and it is NULL for the person at the top. Two employees can share a name.

Find every employee whose salary is strictly higher than the salary of their direct manager. Return two columns: employee (the employee's name) and manager (the manager's name). Row order does not matter.`,
  setup: `CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  salary INTEGER NOT NULL,
  manager_id INTEGER
);
INSERT INTO employees (emp_id, name, salary, manager_id) VALUES
  (1, 'Priya', 9000, NULL),
  (2, 'Jonas', 7000, 1),
  (3, 'Mei', 7500, 2),
  (4, 'Tomas', 7000, 2),
  (5, 'Aisha', 9500, 1),
  (6, 'Luca', 4000, 5),
  (7, 'Sofia', 6000, 3),
  (8, 'Ben', 8000, 3);`,
  hiddenSetups: [
    `CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  salary INTEGER NOT NULL,
  manager_id INTEGER
);
INSERT INTO employees (emp_id, name, salary, manager_id) VALUES
  (10, 'Alex', 5000, 30),
  (20, 'Alex', 6500, 30),
  (30, 'Dana', 6000, NULL),
  (40, 'Robin', 6500, 20),
  (50, 'Sam', 7000, 20);`,
    `CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  salary INTEGER NOT NULL,
  manager_id INTEGER
);
INSERT INTO employees (emp_id, name, salary, manager_id) VALUES
  (1, 'Ola', 3000, NULL),
  (2, 'Pia', 4000, 1),
  (3, 'Quinn', 5000, 2),
  (4, 'Rhys', 2500, 1);`,
  ],
  solution: `SELECT e.name AS employee, m.name AS manager
FROM employees e
JOIN employees m
  ON m.emp_id = e.manager_id
WHERE e.salary > m.salary;`,
  myWords:
    "The manager is just another row in the same table, so I join employees to itself with two aliases: e for the employee and m for the manager. The join condition links e.manager_id to m.emp_id, which puts both salaries on the same row, and then WHERE compares them.",
  understand: [
    {
      prompt: "The manager's salary is stored in the same table as the employee's. How do you get both onto one row?",
      choices: [
        "GROUP BY manager_id",
        "UNION the table with itself",
        "A subquery in ORDER BY",
        "Join the table to itself under two aliases",
      ],
      answer: 3,
      explain: "A self-join treats one table as two: one copy plays the employee, the other plays the manager. Aliases keep the two roles apart.",
    },
    {
      prompt: "With e as the employee and m as the manager, what is the join condition?",
      choices: [
        "m.emp_id = e.manager_id",
        "m.manager_id = e.emp_id",
        "m.emp_id = e.emp_id",
        "m.manager_id = e.manager_id",
      ],
      answer: 0,
      explain: "The employee row stores the manager's id in manager_id, so the manager is the row whose emp_id equals it. The reversed condition makes m the report, not the manager.",
    },
    {
      prompt: "What happens to the top person, whose manager_id is NULL, in an INNER self-join?",
      choices: [
        "They are returned with a NULL manager",
        "They match every row",
        "They match no manager row and drop out, which is what we want",
        "The query fails on the NULL",
      ],
      answer: 2,
      explain: "NULL equals nothing, so the row has no join partner. A person with no manager cannot out-earn one, so dropping the row is correct.",
    },
  ],
  hints: [
    "You need two rows of the same table side by side: the employee and that employee's manager.",
    "Write FROM employees e JOIN employees m and decide which id column on each side links them.",
    "ON m.emp_id = e.manager_id, then WHERE e.salary > m.salary. Select e.name and m.name.",
  ],
  followUps: [
    {
      q: "What would a LEFT JOIN return here instead of the INNER JOIN?",
      a: "Before the WHERE, the top person would also appear, with NULL manager columns. The WHERE e.salary > m.salary then removes that row again, because a comparison with NULL is not true. The final result is the same.",
    },
    {
      q: "How would you list every employee with their manager's name, including the person at the top?",
      a: "Use the LEFT self-join without the salary filter: FROM employees e LEFT JOIN employees m ON m.emp_id = e.manager_id. The top person gets NULL as manager, or COALESCE(m.name, 'none') for a label.",
    },
    {
      q: "How would you count the direct reports of each manager?",
      a: "Same self-join, grouped by the manager side: SELECT m.name, COUNT(*) FROM employees e JOIN employees m ON m.emp_id = e.manager_id GROUP BY m.emp_id, m.name.",
    },
  ],
});
