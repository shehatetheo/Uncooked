import { defineSql } from "@/lib/content/types";

export default defineSql({
  id: "pending-shipments-queue",
  title: "Pending Shipments Queue",
  difficulty: "easy",
  concept: "IS NULL + COALESCE + ORDER BY",
  tags: ["original"],
  orderMatters: true,
  statement: `The warehouse tracks outbound freight in one table.

Table shipments has one row per shipment: shipment_id (primary key), destination, carrier, weight_kg, shipped_at. shipped_at is NULL until the shipment has left the warehouse. carrier is NULL until a carrier has been assigned.

Build the loading queue: return every shipment that has not been shipped yet, with four columns in this order: shipment_id, destination, carrier, weight_kg. Where no carrier is assigned, show the text UNASSIGNED in the carrier column.

Row order matters. Sort by weight_kg from heaviest to lightest, and for shipments with the same weight sort by destination from A to Z.`,
  setup: `CREATE TABLE shipments (
  shipment_id INTEGER PRIMARY KEY,
  destination TEXT NOT NULL,
  carrier TEXT,
  weight_kg INTEGER NOT NULL,
  shipped_at TEXT
);
INSERT INTO shipments (shipment_id, destination, carrier, weight_kg, shipped_at) VALUES
  (101, 'Hamburg', 'DHL', 120, NULL),
  (102, 'Lyon', NULL, 340, NULL),
  (103, 'Turin', 'UPS', 340, '2026-03-02'),
  (104, 'Porto', NULL, 75, '2026-03-03'),
  (105, 'Gdansk', 'Maersk', 340, NULL),
  (106, 'Vienna', NULL, 120, NULL),
  (107, 'Malmo', 'DHL', 50, NULL);`,
  hiddenSetups: [
    `CREATE TABLE shipments (
  shipment_id INTEGER PRIMARY KEY,
  destination TEXT NOT NULL,
  carrier TEXT,
  weight_kg INTEGER NOT NULL,
  shipped_at TEXT
);
INSERT INTO shipments (shipment_id, destination, carrier, weight_kg, shipped_at) VALUES
  (1, 'Oslo', NULL, 10, NULL),
  (2, 'Bergen', NULL, 10, NULL),
  (3, 'Aarhus', 'Posten', 10, NULL),
  (4, 'Riga', 'DPD', 99, '2026-04-11'),
  (5, 'Tartu', NULL, 8, NULL);`,
    `CREATE TABLE shipments (
  shipment_id INTEGER PRIMARY KEY,
  destination TEXT NOT NULL,
  carrier TEXT,
  weight_kg INTEGER NOT NULL,
  shipped_at TEXT
);
INSERT INTO shipments (shipment_id, destination, carrier, weight_kg, shipped_at) VALUES
  (21, 'Cork', 'An Post', 15, '2026-05-01'),
  (22, 'Nantes', NULL, 400, NULL),
  (23, 'Bilbao', 'SEUR', 400, NULL),
  (24, 'Bruges', NULL, 400, '2026-05-02'),
  (25, 'Leiden', 'PostNL', 900, NULL);`,
  ],
  solution: `SELECT shipment_id,
       destination,
       COALESCE(carrier, 'UNASSIGNED') AS carrier,
       weight_kg
FROM shipments
WHERE shipped_at IS NULL
ORDER BY weight_kg DESC, destination ASC;`,
  myWords:
    "Not shipped yet means shipped_at has no value, so I filter with IS NULL, because = NULL never matches anything. COALESCE swaps a missing carrier for the text UNASSIGNED. The order is part of the answer, so I sort by weight descending and add destination as a second sort key to settle ties.",
  understand: [
    {
      prompt: "How do you select the shipments that have not been shipped?",
      choices: [
        "WHERE shipped_at = NULL",
        "WHERE shipped_at = ''",
        "WHERE shipped_at IS NULL",
        "WHERE NOT shipped_at",
      ],
      answer: 2,
      explain: "Any comparison with NULL using = gives unknown, which WHERE treats as not true, so = NULL returns no rows. IS NULL is the dedicated test.",
    },
    {
      prompt: "What does COALESCE(carrier, 'UNASSIGNED') return?",
      choices: [
        "carrier when it is not NULL, otherwise 'UNASSIGNED'",
        "Always 'UNASSIGNED'",
        "NULL when carrier is NULL",
        "The two values joined into one string",
      ],
      answer: 0,
      explain: "COALESCE returns its first argument that is not NULL. It is the standard way to supply a default for a missing value.",
    },
    {
      prompt: "Two pending shipments both weigh 340 kg. What decides their order with ORDER BY weight_kg DESC alone?",
      choices: [
        "The lower shipment_id always comes first",
        "They are sorted alphabetically by destination",
        "The query fails on the tie",
        "Nothing: the database may return them in any order",
      ],
      answer: 3,
      explain: "Rows that tie on the sort key have no guaranteed order. Add a second key, here destination ASC, to make the result deterministic.",
    },
  ],
  hints: [
    "Three separate jobs: filter the unshipped rows, replace a missing carrier, sort the result.",
    "A missing value is tested with IS NULL, and replaced with COALESCE(column, default).",
    "ORDER BY takes several keys: ORDER BY weight_kg DESC, destination ASC. The second key only matters when the first one ties.",
  ],
  followUps: [
    {
      q: "Why does WHERE shipped_at = NULL return no rows?",
      a: "NULL means unknown, and comparing anything with unknown gives unknown, not true. WHERE keeps only rows where the condition is true. That is why SQL has IS NULL and IS NOT NULL.",
    },
    {
      q: "How would you count pending shipments that already have a carrier?",
      a: "SELECT COUNT(carrier) FROM shipments WHERE shipped_at IS NULL. COUNT(column) skips NULLs, so unassigned shipments are not counted. COUNT(*) would count all pending shipments.",
    },
    {
      q: "Where do NULLs end up if you sort by a column that contains them?",
      a: "It depends on the database. SQLite and MySQL treat NULL as the smallest value, so NULLs come first in ascending order. PostgreSQL and Oracle put them last. NULLS FIRST or NULLS LAST makes it explicit where the database supports it.",
    },
  ],
});
