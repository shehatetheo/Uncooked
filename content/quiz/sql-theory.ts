import { defineQuiz } from "@/lib/content/types";

export default defineQuiz([
  {
    id: "sql-inner-join",
    topic: "sql-theory",
    prompt: "What rows does an INNER JOIN between customers and orders return?",
    choices: [
      "Every customer, with NULLs where a customer has no orders",
      "Only the rows where the join condition matches in both tables",
      "Every row from both tables, matched or not",
      "Every possible pairing of a customer with an order",
    ],
    answer: 1,
    explain:
      "INNER JOIN keeps only matching pairs, so a customer with no orders disappears from the result. The other choices describe LEFT JOIN, FULL OUTER JOIN and CROSS JOIN.",
  },
  {
    id: "sql-left-join",
    topic: "sql-theory",
    prompt:
      "You run customers LEFT JOIN orders ON customers.id = orders.customer_id. One customer has no orders. What happens to that customer?",
    choices: [
      "The row is dropped from the result",
      "The query fails with a join error",
      "The row is kept, with NULL in the orders columns",
      "The row is paired with every order in the orders table",
    ],
    answer: 2,
    explain:
      "LEFT JOIN keeps every row from the left table; where the right side has no match, its columns are filled with NULL. That is how you find customers with no orders: add WHERE orders.id IS NULL.",
  },
  {
    id: "sql-full-outer-join",
    topic: "sql-theory",
    prompt: "How does a FULL OUTER JOIN differ from a LEFT JOIN?",
    choices: [
      "It also keeps unmatched rows from the right table",
      "It removes duplicate rows from the result",
      "It pairs every left row with every right row, like a cross join",
      "It keeps only rows that have a match on both sides",
    ],
    answer: 0,
    explain:
      "LEFT keeps all left rows, RIGHT keeps all right rows, and FULL OUTER keeps the unmatched rows from both sides, padding the missing side with NULLs.",
  },
  {
    id: "sql-primary-key",
    topic: "sql-theory",
    prompt: "Which statement about a primary key is true?",
    choices: [
      "A table can have several primary keys, one per column",
      "It may contain NULL as long as the values are unique",
      "It must be an auto-incrementing integer",
      "It uniquely identifies each row and cannot be NULL",
    ],
    answer: 3,
    explain:
      "A primary key is unique and NOT NULL, and a table has exactly one, although it can span several columns as a composite key. It does not have to be an integer.",
  },
  {
    id: "sql-foreign-key",
    topic: "sql-theory",
    prompt: "orders.customer_id is a foreign key referencing customers.id. What does the database enforce?",
    choices: [
      "Each customer can have at most one order",
      "Each customer_id in orders must exist in customers",
      "The customer_id values in orders must all be unique",
      "customer_id can never be changed after insert",
    ],
    answer: 1,
    explain:
      "A foreign key enforces referential integrity: you cannot insert an order that points at a customer who does not exist. Many orders can share one customer_id, which is exactly a one-to-many relationship.",
  },
  {
    id: "sql-1nf",
    topic: "sql-theory",
    prompt:
      'A students table has a phone_numbers column holding "555-1234, 555-9876" in a single cell. Which normal form does this violate first?',
    choices: [
      "First normal form (1NF)",
      "Second normal form (2NF)",
      "Third normal form (3NF)",
      "None, as long as the column type is text",
    ],
    answer: 0,
    explain:
      "1NF requires atomic values: one value per cell and no repeating groups. The fix is a separate phone numbers table with one row per number.",
  },
  {
    id: "sql-2nf",
    topic: "sql-theory",
    prompt:
      "A table has the composite key (student_id, course_id) and also a student_name column. Why does this break second normal form?",
    choices: [
      "student_name is not unique",
      "The key has more than one column",
      "student_name depends on only part of the key",
      "student_name depends on a non-key column",
    ],
    answer: 2,
    explain:
      "2NF is 1NF plus no partial dependencies: every non-key column must depend on the whole composite key. student_name depends only on student_id, so it belongs in a students table.",
  },
  {
    id: "sql-3nf",
    topic: "sql-theory",
    prompt: "employees(id, name, dept_id, dept_name) is in 2NF. What is the third normal form problem?",
    choices: [
      "id is not a composite key",
      "name could contain duplicates",
      "dept_id should be the primary key instead of id",
      "dept_name depends on dept_id, not the key",
    ],
    answer: 3,
    explain:
      "3NF removes transitive dependencies: a non-key column must not depend on another non-key column. dept_name depends on dept_id, so it moves to a departments table and is stored once.",
  },
  {
    id: "sql-acid-letters",
    topic: "sql-theory",
    prompt: "What does ACID stand for in database transactions?",
    choices: [
      "Availability, Consistency, Integrity, Durability",
      "Atomicity, Consistency, Isolation, Durability",
      "Atomicity, Concurrency, Isolation, Dependability",
      "Accuracy, Consistency, Indexing, Durability",
    ],
    answer: 1,
    explain:
      "Atomicity is all or nothing, consistency means constraints always hold, isolation means concurrent transactions do not interfere, and durability means committed data survives a crash.",
  },
  {
    id: "sql-atomicity",
    topic: "sql-theory",
    prompt:
      "A bank transfer debits account A, then the server crashes before crediting account B. Which ACID property guarantees the debit is rolled back?",
    choices: ["Atomicity", "Isolation", "Durability", "Indexing"],
    answer: 0,
    explain:
      "Atomicity makes a transaction all or nothing: either every statement takes effect or none does. The bank transfer is the standard example to give in an interview.",
  },
  {
    id: "sql-durability",
    topic: "sql-theory",
    prompt: "What does the durability property promise?",
    choices: [
      "Concurrent transactions do not see each other's partial work",
      "A transaction either fully happens or not at all",
      "Once committed, a transaction survives a crash or power loss",
      "Data always satisfies the constraints defined on the tables",
    ],
    answer: 2,
    explain:
      "After COMMIT returns, the change is on persistent storage (typically via a write-ahead log) and will still be there after a restart. The other choices describe isolation, atomicity and consistency.",
  },
  {
    id: "sql-index-tradeoff",
    topic: "sql-theory",
    prompt: "What is the main trade-off of adding an index to a column?",
    choices: [
      "Reads get slower but the table uses less disk",
      "The column can no longer contain duplicates",
      "Queries on other columns stop working",
      "Faster reads, slower writes, more storage",
    ],
    answer: 3,
    explain:
      "An index (usually a B-tree) lets the database find rows without scanning the whole table, but every INSERT, UPDATE and DELETE must also maintain it, and it takes space. Index the columns you filter and join on.",
  },
  {
    id: "sql-injection",
    topic: "sql-theory",
    prompt: "What is SQL injection?",
    choices: [
      "User input ends up executed as part of a SQL statement",
      "Too many queries overload the database server",
      "An attacker guesses the database password by brute force",
      "A script tag saved in the database later runs in a browser",
    ],
    answer: 0,
    explain:
      "It happens when a query is built by concatenating untrusted input, so input like ' OR '1'='1 changes what the query means. The script-tag choice describes stored XSS, a different attack.",
  },
  {
    id: "sql-parameterized-queries",
    topic: "sql-theory",
    prompt:
      'Why does a parameterized query such as cursor.execute("SELECT * FROM users WHERE name = ?", (name,)) prevent SQL injection?',
    choices: [
      "It encrypts the input before sending it",
      "It strips quotes and semicolons out of the input",
      "The input is sent as data, never parsed as SQL",
      "It limits the query to returning one row",
    ],
    answer: 2,
    explain:
      "The SQL text and the values travel separately, so the database treats the value purely as a literal whatever characters it contains. Say it plainly: never build SQL with string concatenation or f-strings.",
  },
  {
    id: "sql-where-vs-having",
    topic: "sql-theory",
    prompt: "What is the difference between WHERE and HAVING?",
    choices: [
      "WHERE works on numbers, HAVING works on text",
      "WHERE filters rows before grouping, HAVING filters groups after",
      "HAVING runs first, then WHERE filters what is left",
      "They are interchangeable, and HAVING is just the older syntax",
    ],
    answer: 1,
    explain:
      "WHERE runs before GROUP BY, so it cannot use aggregates; HAVING runs after, so HAVING COUNT(*) > 5 is legal. Example: departments with more than 5 employees needs HAVING.",
  },
  {
    id: "sql-null-comparison",
    topic: "sql-theory",
    prompt:
      "Some employees have a NULL manager_id. What does SELECT * FROM employees WHERE manager_id = NULL return?",
    choices: ["All rows where manager_id is NULL", "All rows in the table", "A syntax error", "No rows"],
    answer: 3,
    explain:
      "NULL means unknown, so comparing anything to it with = gives unknown rather than true, and the row is filtered out. Use IS NULL or IS NOT NULL instead.",
  },
]);
