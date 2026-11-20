# Uncooked

Mock coding interviews with an AI interviewer, on SAP-reported LeetCode questions. Python (and one SQL problem) runs in the browser.

## How it works

Each question goes through four phases:

1. **Talk** – the interviewer gives the problem out loud; you restate it and explain your approach. No code yet.
2. **Ghost** – you type the solution with the reference shown faintly, one captioned line at a time. Done when your code passes every test, however you wrote it.
3. **Blind** – the reference is hidden and the editor is reset. You solve it alone while the interviewer interviews you.
4. **Feedback** – a scorecard: five areas scored 1–5 with one tip each, and a hire / lean hire / lean no call.

## The AI interviewer

- Vercel AI SDK through Vercel AI Gateway, authenticated with the project's OIDC token. **There is no API key.** Don't add an `AI_GATEWAY_API_KEY` variable: a key would override OIDC.
- The model is one constant: `INTERVIEWER_MODEL` in `src/lib/ai/config.ts`. The fallbacks next to it are tried if it is rate limited.
- The interviewer's instructions are in `src/lib/ai/prompt.ts`.
- If the gateway fails, the app says why and everything except the interviewer keeps working.

Local development needs the OIDC token:

```bash
vercel link
```

```bash
vercel env pull
```

```bash
npm run dev
```

## Problems

One typed file per problem in `content/problems/`, listed in order in `content/index.ts`. Fields are documented in `src/lib/types.ts`.

## Checks

```bash
npm run check
```

runs every reference solution against every visible and hidden test, with the same Python harness the browser uses.

```bash
npm test
```

```bash
npm run build && npm run e2e
```
