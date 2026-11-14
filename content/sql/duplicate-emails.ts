import { defineSql } from "@/lib/content/types";

export default defineSql({
  id: "duplicate-emails",
  title: "Duplicate Emails",
  difficulty: "easy",
  concept: "GROUP BY + HAVING",
  tags: ["seed"],
  statement: `Table Person has one row per account: id (primary key), email. Emails are lowercase and never NULL, but the same email can be stored on more than one row.

Return every email that appears more than once, in a single column called Email. Each duplicated email must be listed exactly once, no matter how many times it repeats. Row order does not matter.`,
  setup: `CREATE TABLE Person (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL
);
INSERT INTO Person (id, email) VALUES
  (1, 'ana@example.com'),
  (2, 'carl@example.com'),
  (3, 'ana@example.com'),
  (4, 'dee@example.com'),
  (5, 'carl@example.com'),
  (6, 'carl@example.com');`,
  hiddenSetups: [
    `CREATE TABLE Person (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL
);
INSERT INTO Person (id, email) VALUES
  (1, 'kim@corp.com'),
  (2, 'lou@corp.com'),
  (3, 'kim@corp.com'),
  (4, 'kim@corp.com'),
  (5, 'kim@corp.com'),
  (6, 'mia@corp.com');`,
    `CREATE TABLE Person (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL
);
INSERT INTO Person (id, email) VALUES
  (1, 'solo@example.com'),
  (2, 'only@example.com'),
  (3, 'once@example.com');`,
  ],
  solution: `SELECT email AS Email
FROM Person
GROUP BY email
HAVING COUNT(*) > 1;`,
  myWords:
    "I group the rows by email so each email becomes one group, then count the rows in each group. HAVING keeps only the groups with a count above 1. It has to be HAVING and not WHERE, because the count does not exist until after the grouping.",
  understand: [
    {
      prompt: "An email is stored on three rows. How many times should it appear in the result?",
      choices: ["Three times", "Twice", "Once", "Not at all"],
      answer: 2,
      explain: "The result is a list of duplicated emails, each listed once. GROUP BY gives one output row per distinct email.",
    },
    {
      prompt: "Where does the condition COUNT(*) > 1 belong?",
      choices: [
        "In HAVING, because it filters groups after aggregation",
        "In WHERE, because it filters rows",
        "In ORDER BY, because it sorts the groups",
        "In the ON clause of a join",
      ],
      answer: 0,
      explain: "WHERE runs before GROUP BY and sees single rows, so an aggregate is not available there. HAVING runs after grouping and can test COUNT(*).",
    },
    {
      prompt: "What does GROUP BY email do to the rows?",
      choices: [
        "Sorts the rows by email",
        "Collapses all rows with the same email into one group",
        "Removes rows whose email is unique",
        "Adds a count column automatically",
      ],
      answer: 1,
      explain: "GROUP BY collapses rows that share a value into one group. Aggregates like COUNT(*) are then computed once per group.",
    },
  ],
  hints: [
    "You need to count how many rows share each email.",
    "GROUP BY email gives one group per email. COUNT(*) is the size of the group.",
    "Filter the groups with HAVING COUNT(*) > 1.",
  ],
  followUps: [
    {
      q: "Why not WHERE COUNT(*) > 1?",
      a: "WHERE is evaluated row by row before any grouping happens, so there is no count to compare yet. Aggregate conditions go in HAVING, which runs after GROUP BY.",
    },
    {
      q: "Can you solve it with a self-join?",
      a: "Yes: SELECT DISTINCT a.email FROM Person a JOIN Person b ON a.email = b.email AND a.id <> b.id. The DISTINCT is required, otherwise an email stored three times is returned six times.",
    },
    {
      q: "How would you delete the duplicates and keep the row with the smallest id?",
      a: "DELETE FROM Person WHERE id NOT IN (SELECT MIN(id) FROM Person GROUP BY email). The subquery picks the one survivor per email.",
    },
  ],
  links: { leetcode: "https://leetcode.com/problems/duplicate-emails/" },
});
