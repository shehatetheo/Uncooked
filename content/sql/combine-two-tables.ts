import { defineSql } from "@/lib/content/types";

export default defineSql({
  id: "combine-two-tables",
  title: "Combine Two Tables",
  difficulty: "easy",
  concept: "LEFT JOIN",
  tags: ["seed"],
  statement: `Table Person has one row per person: personId (primary key), lastName, firstName.

Table Address has one row per address: addressId (primary key), personId, city, state. Not every person has an address on file, and an address row may point at a personId that is not in Person.

Return one row for every person in Person with four columns: firstName, lastName, city, state. If a person has no address, city and state must be NULL. Row order does not matter.`,
  setup: `CREATE TABLE Person (
  personId INTEGER PRIMARY KEY,
  lastName TEXT,
  firstName TEXT
);
CREATE TABLE Address (
  addressId INTEGER PRIMARY KEY,
  personId INTEGER,
  city TEXT,
  state TEXT
);
INSERT INTO Person (personId, lastName, firstName) VALUES
  (1, 'Wang', 'Allen'),
  (2, 'Reyes', 'Bianca'),
  (3, 'Meyer', 'Clara'),
  (4, 'Okafor', 'Dayo');
INSERT INTO Address (addressId, personId, city, state) VALUES
  (1, 2, 'Austin', 'Texas'),
  (2, 4, 'Denver', 'Colorado'),
  (3, 7, 'Boise', 'Idaho');`,
  hiddenSetups: [
    `CREATE TABLE Person (
  personId INTEGER PRIMARY KEY,
  lastName TEXT,
  firstName TEXT
);
CREATE TABLE Address (
  addressId INTEGER PRIMARY KEY,
  personId INTEGER,
  city TEXT,
  state TEXT
);
INSERT INTO Person (personId, lastName, firstName) VALUES
  (1, 'Novak', 'Petra'),
  (2, 'Silva', 'Rui'),
  (3, 'Tanaka', 'Emi');`,
    `CREATE TABLE Person (
  personId INTEGER PRIMARY KEY,
  lastName TEXT,
  firstName TEXT
);
CREATE TABLE Address (
  addressId INTEGER PRIMARY KEY,
  personId INTEGER,
  city TEXT,
  state TEXT
);
INSERT INTO Person (personId, lastName, firstName) VALUES
  (10, 'Haddad', 'Omar'),
  (20, 'Lindqvist', 'Freja');
INSERT INTO Address (addressId, personId, city, state) VALUES
  (1, 20, 'Portland', 'Oregon'),
  (2, 10, 'Tampa', 'Florida'),
  (3, 30, 'Reno', 'Nevada'),
  (4, 40, 'Omaha', 'Nebraska');`,
  ],
  solution: `SELECT p.firstName, p.lastName, a.city, a.state
FROM Person p
LEFT JOIN Address a
  ON a.personId = p.personId;`,
  myWords:
    "I need every person, whether or not they have an address, so Person is the table I keep in full. A LEFT JOIN from Person to Address keeps all the people and fills city and state with NULL when there is no match. An INNER JOIN would silently drop the people without an address.",
  understand: [
    {
      prompt: "Which rows must appear in the result?",
      choices: [
        "Only people who have an address",
        "Every address, with the person's name if one exists",
        "Every person, with NULL city and state when there is no address",
        "Every person and every address, matched or not",
      ],
      answer: 2,
      explain:
        "The statement says one row for every person. Addresses that point at nobody in Person are not asked for, and people without an address must still appear.",
    },
    {
      prompt: "Which join gives that result with Person written first?",
      choices: [
        "LEFT JOIN Address: keeps all rows of Person",
        "INNER JOIN Address: keeps only matching pairs",
        "CROSS JOIN Address: every combination",
        "FULL OUTER JOIN Address: keeps unmatched rows of both tables",
      ],
      answer: 0,
      explain:
        "LEFT JOIN keeps every row of the left table (Person). INNER drops people without an address, and FULL OUTER adds address rows that belong to nobody.",
    },
    {
      prompt: "What does the LEFT JOIN put in city and state for a person with no address?",
      choices: ["An empty string", "The row is skipped", "The values from the previous row", "NULL"],
      answer: 3,
      explain: "When no right-side row matches, the outer join fills every right-side column with NULL.",
    },
  ],
  hints: [
    "Decide which table must be kept in full. The statement says every person.",
    "An INNER JOIN only returns matching pairs. You need the join type that keeps unmatched rows from one side.",
    "FROM Person p LEFT JOIN Address a ON a.personId = p.personId, then select the four columns.",
  ],
  followUps: [
    {
      q: "What would an INNER JOIN return here instead?",
      a: "Only the people who have a matching address row. On the sample data that is 2 rows instead of 4, and the people without an address disappear with no error.",
    },
    {
      q: "How would you write the same query with a RIGHT JOIN?",
      a: "Swap the table order: FROM Address a RIGHT JOIN Person p ON a.personId = p.personId. It keeps every row of the right table. Most teams stick to LEFT JOIN because it reads top to bottom.",
    },
    {
      q: "What changes if a person can have two addresses?",
      a: "That person appears twice, once per address. A join returns one row per matching pair, so a one-to-many relationship multiplies the rows of the 'one' side.",
    },
  ],
  links: { leetcode: "https://leetcode.com/problems/combine-two-tables/" },
});
