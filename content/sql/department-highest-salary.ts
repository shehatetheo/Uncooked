import { defineSql } from "@/lib/content/types";

export default defineSql({
  id: "department-highest-salary",
  title: "Department Highest Salary",
  difficulty: "medium",
  concept: "JOIN + GROUP BY (max per group, with ties)",
  tags: ["seed"],
  statement: `Table Department has one row per department: id (primary key), name.

Table Employee has one row per employee: id (primary key), name, salary, departmentId (the id of the employee's department).

For each department, find the employee or employees with the highest salary in that department. Return three columns: Department (the department name), Employee (the employee name), Salary. If several employees tie for the top salary in a department, return all of them. A department with no employees does not appear. Row order does not matter.`,
  setup: `CREATE TABLE Department (
  id INTEGER PRIMARY KEY,
  name TEXT
);
CREATE TABLE Employee (
  id INTEGER PRIMARY KEY,
  name TEXT,
  salary INTEGER,
  departmentId INTEGER
);
INSERT INTO Department (id, name) VALUES
  (1, 'IT'),
  (2, 'Sales'),
  (3, 'HR');
INSERT INTO Employee (id, name, salary, departmentId) VALUES
  (1, 'Joe', 85000, 1),
  (2, 'Jim', 90000, 1),
  (3, 'Max', 90000, 1),
  (4, 'Henry', 95000, 2),
  (5, 'Sam', 90000, 2);`,
  hiddenSetups: [
    `CREATE TABLE Department (
  id INTEGER PRIMARY KEY,
  name TEXT
);
CREATE TABLE Employee (
  id INTEGER PRIMARY KEY,
  name TEXT,
  salary INTEGER,
  departmentId INTEGER
);
INSERT INTO Department (id, name) VALUES
  (1, 'Ops'),
  (2, 'Legal');
INSERT INTO Employee (id, name, salary, departmentId) VALUES
  (1, 'Ava', 5000, 1),
  (2, 'Tess', 5000, 2),
  (3, 'Raj', 6000, 2),
  (4, 'Noor', 4000, 1);`,
    `CREATE TABLE Department (
  id INTEGER PRIMARY KEY,
  name TEXT
);
CREATE TABLE Employee (
  id INTEGER PRIMARY KEY,
  name TEXT,
  salary INTEGER,
  departmentId INTEGER
);
INSERT INTO Department (id, name) VALUES
  (1, 'Finance');
INSERT INTO Employee (id, name, salary, departmentId) VALUES
  (1, 'Uma', 7000, 1),
  (2, 'Vic', 7000, 1),
  (3, 'Wes', 7000, 1),
  (4, 'Xia', 6500, 1);`,
  ],
  solution: `SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM Employee e
JOIN Department d
  ON d.id = e.departmentId
JOIN (
  SELECT departmentId, MAX(salary) AS top_salary
  FROM Employee
  GROUP BY departmentId
) m
  ON m.departmentId = e.departmentId
 AND m.top_salary = e.salary;`,
  myWords:
    "First I compute the top salary per department with GROUP BY departmentId and MAX(salary). Then I join that small result back to the employees on both the department and the salary, so every employee who earns the department maximum is kept, including ties. A last join to Department swaps the id for the name.",
  understand: [
    {
      prompt: "Two employees in IT both earn the top salary of 90000. What should the result contain for IT?",
      choices: [
        "One row, for whichever employee has the lower id",
        "One row with both names combined",
        "No row, because there is no single winner",
        "Two rows, one per employee",
      ],
      answer: 3,
      explain: "The statement asks for all employees who tie for the highest salary, so each of them gets a row.",
    },
    {
      prompt: "Why is GROUP BY departmentId with MAX(salary) alone not enough?",
      choices: [
        "MAX does not work on integers",
        "It gives one row per department with the top salary, but not which employees earn it",
        "GROUP BY cannot be used on a foreign key",
        "It returns departments with no employees",
      ],
      answer: 1,
      explain: "Grouping collapses the employees into one row per department. To get the names back, including ties, you join the per-department maximum back to the employee rows.",
    },
    {
      prompt: "The join back to Employee matches on departmentId AND salary. Why both?",
      choices: [
        "A salary that is the maximum in one department can be an ordinary salary in another",
        "Joins always need two conditions",
        "To remove duplicate employees",
        "To keep departments that have no employees",
      ],
      answer: 0,
      explain: "On the sample data 90000 is the top salary in IT but not in Sales. Matching on salary alone would wrongly return Sam from Sales.",
    },
  ],
  hints: [
    "Start with a smaller question: what is the highest salary in each department?",
    "SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId answers that. Now you need the employees who earn exactly that amount in that department.",
    "Join the grouped result back to Employee on departmentId and salary, then join Department for the name.",
  ],
  followUps: [
    {
      q: "How would you write this with a window function?",
      a: "Rank inside each department: RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) in a subquery, then keep rank = 1 in the outer query. RANK and DENSE_RANK both keep ties at rank 1. ROW_NUMBER would keep only one employee per department.",
    },
    {
      q: "What would a LEFT JOIN from Department return instead?",
      a: "Departments with no employees (HR on the sample data) would appear with NULL for Employee and Salary. The INNER JOIN drops them, which is what the statement asks for.",
    },
    {
      q: "Why can you not just SELECT name, MAX(salary) with GROUP BY departmentId?",
      a: "name is neither grouped nor aggregated, so standard SQL rejects it. SQLite and old MySQL modes accept it but return a single name per group, which loses ties.",
    },
  ],
  links: { leetcode: "https://leetcode.com/problems/department-highest-salary/" },
});
