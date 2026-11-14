# Uncooked

Learn it, type the ghost, solve it cold. A technical interview trainer built for the
SAP STAR super day (Fri Nov 20, 2026): coding, SQL, CS fundamentals, resume defense and
behavioral prep, in one app that works on a phone.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. `npm run dev` and `npm run build` first copy the Python and
SQL runtimes into `public/` and regenerate the content index.

## Checks

```bash
npm test
```

Runs every reference solution against every visible and hidden test in real Pyodide,
every SQL reference query against every dataset, and the logic tests (ghost-typing
scoring, spaced repetition, output comparison). A broken solution or a bad test fails here.

```bash
npm run build && npm run e2e
```

Playwright flows at desktop and iPhone viewport sizes. CI runs all of the above.

## How it works

- **Four phases per problem:** Understand (3 questions) → Ghost type (3 reps with the
  shadow, 3 from memory, optional rest between) → Cold solve (Run / Submit, hints,
  Solution panel) → Explain it (out loud, checked, self-rated).
- **Mastered** needs a hint-free cold solve on two different days. The rating button
  alone can't grant it.
- **Python** runs in the browser with Pyodide in a Web Worker (`public/py-worker.mjs`).
  A run that exceeds 6 seconds is killed by terminating the worker.
- **SQL** runs in the browser with sql.js. Your rows are compared with the reference
  query's rows on the visible dataset and on hidden ones.
- **Progress** is stored on the device in IndexedDB. Settings → Export / Import moves it
  between devices. Every row carries a `userId` so a sync backend can be added later.
- **Offline:** `public/sw.js` caches the app shell, every route, and the runtimes after
  first use. Installable as a PWA.

## Content is data

Adding a problem means adding one file. The index is generated; schemas are validated
at build time and invalid content fails the build.

| What | Where | Schema |
|---|---|---|
| Coding problem | `content/problems/<id>.ts` | `Problem` in `src/lib/content/types.ts` |
| SQL problem | `content/sql/<id>.ts` | `SqlProblem` |
| Quiz questions | `content/quiz/<topic>.ts` | `QuizQuestion` |
| Resume / behavioral / SAP / SQL-concept cards | `content/cards/<name>.ts` | `OpenCard` |
| Presentation drills | `content/drills.ts` | |
| Picture for a problem | `public/art/<id>.webp` | picked up by file name |
| Clip for a problem | `public/clips/<id>.mp4` | picked up by file name |

## Design rules

All colours, fonts and radii are tokens in `src/app/globals.css`. Use only the tokens.
Spacing sits on a 4px grid. Pixel fonts are for headings and labels; everything else is
JetBrains Mono. No rounded corners, gradients, drop shadows or emoji.
