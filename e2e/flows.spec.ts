import { expect, test, type Page } from "@playwright/test";

const TWO_SUM_BODY = ["seen = {}", "for i, n in enumerate(nums):", "if target - n in seen: return [seen[target - n], i]", "seen[n] = i"].join("\n");
const TWO_SUM = `class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, n in enumerate(nums):
            if target - n in seen: return [seen[target - n], i]
            seen[n] = i
`;

const skipIntro = (page: Page) => page.addInitScript(() => sessionStorage.setItem("uncooked:intro", "1"));
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1000) < 768;

async function setCode(page: Page, code: string) {
  if (isPhone(page)) await page.getByRole("tab", { name: /code/i }).click();
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText(code);
}

test("intro plays once per session and any key skips it", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("press any key to skip")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(page.getByText("press any key to skip")).toBeHidden();
  await page.reload();
  await expect(page.getByTestId("countdown")).toBeVisible();
  await expect(page.getByText("press any key to skip")).toBeHidden();
});

test("home shows the countdown and a drill plan", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/");
  await expect(page.getByTestId("countdown")).toContainText(/\d+d|Today/);
  await expect(page.getByText("What to drill today")).toBeVisible();
  await expect(page.getByRole("link", { name: /Learn: Two Sum/ })).toBeVisible();
});

test("understand: three questions, then on to ghost typing", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/p/two-sum");
  for (let i = 0; i < 3; i++) {
    await expect(page.getByText(`Question ${i + 1} of 3`)).toBeVisible();
    await page.locator("button.choice").first().click();
    await expect(page.getByText(/Correct|Not quite/)).toBeVisible();
    await page.getByRole("button", { name: /Next question|Done/ }).click();
  }
  await expect(page.getByText("first try")).toBeVisible();
  await page.getByRole("button", { name: "Type the ghost" }).click();
  await expect(page.getByTestId("ghost-editor")).toBeVisible();
});

test("ghost typing: errors count, three shadow reps unlock the blind reps", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/settings");
  await page.getByRole("button", { name: "off", exact: true }).click(); // rest off, to keep the test quick
  await page.waitForTimeout(600); // settings are saved on a short debounce
  await page.goto("/p/two-sum");
  await page.getByRole("button", { name: "Ghost type" }).click();
  const editor = page.getByTestId("ghost-editor");
  const input = editor.locator("textarea");

  await input.focus();
  await page.keyboard.type("x"); // wrong key
  await expect(page.getByTestId("ghost-stats")).toContainText("1 ERR");
  await page.keyboard.press("Tab"); // restart
  await expect(page.getByTestId("ghost-stats")).toContainText("0 ERR");
  await expect(page.getByTestId("caption")).toContainText("LINE 01");

  for (let rep = 1; rep <= 3; rep++) {
    await input.focus();
    await page.keyboard.type(TWO_SUM_BODY);
    await expect(page.getByTestId("rep-card")).toBeVisible();
    await expect(page.getByText(`Rep ${rep} of 6 done`)).toBeVisible();
    await page.getByRole("button", { name: /Next rep/ }).click();
  }
  await expect(page.getByText("from memory")).toBeVisible();
  // blind: the untyped code is no longer rendered
  await expect(editor).not.toContainText("enumerate");
  await input.focus();
  await page.keyboard.type(TWO_SUM_BODY);
  await expect(page.getByText("Rep 4 of 6 done")).toBeVisible();

  // the ladder survives a reload (IndexedDB)
  await page.waitForTimeout(600);
  await page.reload();
  await page.getByRole("button", { name: "Ghost type" }).click();
  await expect(page.getByTestId("ladder")).toContainText("■■■");
});

test("phone hides the visual pane but keeps captions; desktop shows it", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/p/two-sum");
  await page.getByRole("button", { name: "Ghost type" }).click();
  await expect(page.getByTestId("caption")).toBeVisible();
  if (isPhone(page)) await expect(page.getByTestId("scene")).toHaveCount(0);
  else await expect(page.getByTestId("scene")).toBeVisible();
});

test("cold solve: run, wrong answer, traceback, timeout, then accepted", async ({ page }) => {
  test.setTimeout(180_000);
  await skipIntro(page);
  await page.goto("/p/two-sum");
  await page.getByRole("button", { name: "Cold solve" }).click();
  const panel = page.getByTestId("tests-panel");
  const submit = page.getByRole("button", { name: "Submit" }).first();

  await setCode(page, "class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]\n");
  await submit.click();
  await expect(panel).toContainText("passed", { timeout: 90_000 });
  await expect(panel).toContainText("FAIL");
  await expect(panel).toContainText("(hidden)");

  await setCode(page, "class Solution:\n    def twoSum(self, nums, target):\n        return nums[99]\n");
  await submit.click();
  await expect(panel).toContainText("IndexError");
  await expect(panel).toContainText("line 3, in twoSum");

  await setCode(page, "class Solution:\n    def twoSum(self, nums, target):\n        while True: pass\n");
  await submit.click();
  await expect(panel).toContainText("Time limit exceeded", { timeout: 30_000 });

  await setCode(page, TWO_SUM);
  await submit.click();
  await expect(page.getByTestId("accepted")).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId("accepted")).toContainText("with no hints");
  await expect(page.getByTestId("accepted")).toContainText("1/2");
});

test("solution panel explains the approach and reveals code only on request", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/p/two-sum");
  await page.getByRole("button", { name: "Cold solve" }).click();
  if (isPhone(page)) await page.getByRole("tab", { name: /problem/i }).click();
  await page.getByRole("tab", { name: "Solution" }).click();
  const panel = page.getByTestId("solution-panel");
  await expect(panel).toContainText("Approach");
  await expect(panel).toContainText("O(n)");
  await expect(panel).not.toContainText("enumerate(nums)");
  await page.getByRole("button", { name: "Reveal the code" }).click();
  await expect(panel).toContainText("enumerate(nums)");
  await expect(page.getByText(/Hints used 3\/3/)).toBeVisible();
});

test("explanations save as you type and survive a reload, with no button pressed", async ({ page }) => {
  await skipIntro(page);
  const notes: Record<string, string> = {
    "two-sum": "Walk the list once with a hash map of number to index. O(n) time, O(n) space.",
    "contains-duplicate": "Put everything in a set. If the set is smaller than the list, something repeated.",
  };
  for (const [id, text] of Object.entries(notes)) {
    await page.goto(`/p/${id}`);
    await page.getByRole("button", { name: "Explain it" }).click();
    await page.getByLabel("Your explanation").fill(text);
    await expect(page.getByTestId("explain-saved")).toContainText("saved on this device");
  }
  // typed last, then left the page straight away: the pagehide flush has to catch it
  await page.goto("/p/valid-anagram");
  await page.getByRole("button", { name: "Explain it" }).click();
  await page.getByLabel("Your explanation").fill("Counter both strings and compare.");
  await expect(page.getByTestId("explain-saved")).toContainText("saved on this device");

  for (const [id, text] of Object.entries(notes)) {
    await page.goto(`/p/${id}`);
    await page.getByRole("button", { name: "Explain it" }).click();
    await expect(page.getByLabel("Your explanation")).toHaveValue(text);
  }
  await page.goto("/stats");
  const saved = page.getByTestId("saved-answers");
  await expect(saved).toContainText("Two Sum");
  await expect(saved).toContainText("Contains Duplicate");
  await expect(saved).toContainText("Counter both strings and compare.");

  // editing again later keeps the earlier version in history instead of overwriting it
  await page.goto("/p/two-sum");
  await page.getByRole("button", { name: "Explain it" }).click();
  await page.getByLabel("Your explanation").fill(notes["two-sum"] + " Edge case: duplicates.");
  await expect(page.getByTestId("explain-saved")).toContainText("saved on this device");
  await page.goto("/stats");
  await expect(page.getByTestId("saved-answers")).toContainText("2 versions");
});

test("sql: wrong query shows expected rows, the right one is accepted", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/sql/customers-who-never-order");
  const result = page.getByTestId("sql-result");
  await setCode(page, "SELECT name FROM Customers");
  await page.getByRole("button", { name: "Run" }).first().click();
  await expect(result).toContainText(/Rows don't match|SQL error/);
  await setCode(page, "SELECT c.name FROM Customers c LEFT JOIN Orders o ON o.customerId = c.id WHERE o.id IS NULL");
  await page.getByRole("button", { name: "Submit" }).first().click();
  await expect(result).toContainText(/Accepted|SQL error/);
});

test("joins lab switches join type live", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/sql?tab=joins");
  const out = page.getByTestId("join-result");
  await expect(out.locator("tbody tr")).toHaveCount(3);
  await page.getByRole("button", { name: "FULL OUTER" }).click();
  await expect(out.locator("tbody tr")).toHaveCount(5);
});

test("quiz session records answers and resume cards reveal key points", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/quiz");
  await page.getByRole("button", { name: "Start 10" }).first().click();
  await page.locator("button.choice").first().click();
  await expect(page.getByText(/Correct|Not quite/)).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Question 2 of 10")).toBeVisible();

  await page.goto("/resume");
  await page.getByRole("button", { name: "Drill 6 weakest" }).click();
  await page.getByLabel("Your answer").fill("I chose Next.js because of file routing. I considered plain React, but wanted API routes.");
  await page.getByRole("button", { name: "Show key points" }).click();
  await expect(page.getByText("A strong answer hits")).toBeVisible();
  await page.getByRole("button", { name: /Got it/ }).click();
  await expect(page.getByText("2/6")).toBeVisible();
});

test("every page renders without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await skipIntro(page);
  for (const path of ["/", "/problems", "/sql", "/quiz", "/resume", "/behavioral", "/review", "/review?mode=night", "/timed", "/stats", "/sheets", "/settings", "/tracks", "/p/number-of-islands", "/p/undo-playlist-order"]) {
    await page.goto(path);
    await expect(page.locator("main")).not.toBeEmpty();
    await expect(page.locator("h1, [data-testid=countdown]").first()).toBeVisible();
    // no horizontal scrolling at any width
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${path} overflows horizontally`).toBe(true);
  }
  expect(errors).toEqual([]);
});
