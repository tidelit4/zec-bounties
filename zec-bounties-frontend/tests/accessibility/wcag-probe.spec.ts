import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Fork-only probe: run the wcag.spec.ts check on "/" once the repo filter has rendered.
test("/ with the repo filter rendered", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  const filter = page.getByRole("tablist", { name: "Filter bounties by repository" });
  const rendered = await filter.first().waitFor({ state: "visible", timeout: 15000 }).then(() => true, () => false);
  console.log(`PROBE filter rendered=${rendered}`);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
    .analyze();
  const blocking = results.violations.filter(v => v.impact === "critical" || v.impact === "serious");
  for (const v of blocking) {
    console.log(`PROBE ${v.id} ${v.impact} nodes=${v.nodes.length} ${v.nodes.map(n => n.html.slice(0, 160)).join(" | ")}`);
  }
  expect(blocking.map(v => v.id)).toEqual([]);
});
