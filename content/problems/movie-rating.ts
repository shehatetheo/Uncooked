import { sql } from "@/lib/types";

const schema = `CREATE TABLE Movies (movie_id INTEGER PRIMARY KEY, title TEXT);
CREATE TABLE Users (user_id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE MovieRating (movie_id INTEGER, user_id INTEGER, rating INTEGER, created_at TEXT, PRIMARY KEY (movie_id, user_id));
`;

export default sql({
  id: "movie-rating",
  title: "Movie Rating",
  difficulty: "Medium",
  tags: ["sql", "group by", "union"],
  statement: `There are three tables. Movies lists each movie. Users lists each user. MovieRating has one row per review: which user rated which movie, the rating, and the date (as text, YYYY-MM-DD).

Write one query that returns two rows in a single column called results:

First, the name of the user who rated the most movies. If several users tie, pick the name that comes first alphabetically.

Second, the title of the movie with the highest average rating in February 2020. If several movies tie, pick the title that comes first alphabetically.

The user row comes first, then the movie row.`,
  examples: [
    {
      input: "The tables shown below",
      output: "Daniel\nFrozen 2",
      note: "Daniel and Monica both rated 3 movies, and Daniel comes first alphabetically. In February 2020, Frozen 2 and Joker both average 3.5, and Frozen 2 comes first.",
    },
  ],
  constraints: ["A user rates a movie at most once", "February 2020 always has at least one rating", "The same text can be a user's name and a movie's title, and both rows must still appear"],
  setup:
    schema +
    `INSERT INTO Movies VALUES (1, 'Avengers'), (2, 'Frozen 2'), (3, 'Joker');
INSERT INTO Users VALUES (1, 'Daniel'), (2, 'Monica'), (3, 'Maria'), (4, 'James');
INSERT INTO MovieRating VALUES
  (1, 1, 3, '2020-01-12'), (1, 2, 4, '2020-02-11'), (1, 3, 2, '2020-02-12'), (1, 4, 1, '2020-01-01'),
  (2, 1, 5, '2020-02-17'), (2, 2, 2, '2020-02-01'), (2, 3, 2, '2020-03-01'),
  (3, 1, 3, '2020-02-22'), (3, 2, 4, '2020-02-25');`,
  hiddenSetups: [
    // one clear winner for each, no ties
    schema +
      `INSERT INTO Movies VALUES (1, 'Alpha'), (2, 'Beta');
INSERT INTO Users VALUES (1, 'Zed'), (2, 'Amy');
INSERT INTO MovieRating VALUES (1, 1, 5, '2020-02-03'), (2, 1, 1, '2020-02-04'), (1, 2, 4, '2020-02-05');`,
    // the best-rated movie overall is not the best in February
    schema +
      `INSERT INTO Movies VALUES (1, 'Old Hit'), (2, 'Feb Film');
INSERT INTO Users VALUES (1, 'Ben'), (2, 'Cara'), (3, 'Dee');
INSERT INTO MovieRating VALUES (1, 1, 5, '2020-01-20'), (1, 2, 5, '2020-03-02'), (1, 3, 1, '2020-02-10'), (2, 1, 3, '2020-02-11'), (2, 2, 4, '2020-02-28');`,
    // a user and a movie share the same text: both rows must stay (UNION ALL, not UNION)
    schema +
      `INSERT INTO Movies VALUES (1, 'Rebecca'), (2, 'Up');
INSERT INTO Users VALUES (1, 'Rebecca'), (2, 'Tom');
INSERT INTO MovieRating VALUES (1, 1, 5, '2020-02-14'), (2, 1, 2, '2020-02-15'), (1, 2, 5, '2020-02-16');`,
    // ratings on the edges of February, and February of another year
    schema +
      `INSERT INTO Movies VALUES (1, 'Edge'), (2, 'Middle'), (3, 'Wrong Year');
INSERT INTO Users VALUES (1, 'Ann'), (2, 'Bob');
INSERT INTO MovieRating VALUES (1, 1, 2, '2020-02-01'), (1, 2, 2, '2020-02-29'), (2, 1, 3, '2020-02-15'), (3, 1, 5, '2021-02-10'), (3, 2, 5, '2020-01-31'), (2, 2, 5, '2020-03-01');`,
  ],
  orderMatters: true,
  solution: [
    "SELECT results FROM (",
    "  SELECT u.name AS results",
    "  FROM MovieRating r JOIN Users u ON u.user_id = r.user_id",
    "  GROUP BY u.user_id",
    "  ORDER BY COUNT(*) DESC, u.name",
    "  LIMIT 1)",
    "UNION ALL",
    "SELECT results FROM (",
    "  SELECT m.title AS results",
    "  FROM MovieRating r JOIN Movies m ON m.movie_id = r.movie_id",
    "  WHERE r.created_at BETWEEN '2020-02-01' AND '2020-02-29'",
    "  GROUP BY m.movie_id",
    "  ORDER BY AVG(r.rating) DESC, m.title",
    "  LIMIT 1);",
  ],
  captions: [
    "First half: the busiest reviewer. It sits in a subquery so it can have its own ORDER BY and LIMIT.",
    "The column must be called results.",
    "Join each rating to the user who wrote it.",
    "One group per user.",
    "Most ratings first; on a tie, alphabetical by name.",
    "Keep only the top row.",
    "Stack the second answer under the first. UNION ALL keeps both rows even if the texts are equal.",
    "Second half: the best movie in February 2020.",
    "Again the column is results.",
    "Join each rating to its movie.",
    "Only ratings dated in February 2020. Filter rows before grouping, so use WHERE.",
    "One group per movie.",
    "Highest average first; on a tie, alphabetical by title.",
    "Keep only the top row.",
  ],
  hints: [
    "This is two separate questions. Solve each on its own first: who rated the most movies, and which movie has the best February 2020 average.",
    "Each half is a GROUP BY with ORDER BY and LIMIT 1. The tie-break is a second ORDER BY column.",
    "Combine the two one-row results with UNION ALL. Wrap each half in a subquery so its ORDER BY and LIMIT apply to that half only.",
  ],
  followUps: ["Why UNION ALL and not UNION? When would the difference change the answer?", "Why does the February filter go in WHERE and not HAVING?"],
  time: "O(n log n)",
  space: "O(n)",
  link: "https://leetcode.com/problems/movie-rating/",
});
