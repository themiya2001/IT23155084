const { test, expect } = require('@playwright/test');

async function getSinglishInput(page) {
  const byRole = page.getByRole('textbox', { name: /Singlish/i });
  if (await byRole.count() > 0) return byRole.first();

  const ta = page.locator('textarea');
  if (await ta.count() > 0) return ta.first();

  const input = page.locator('input[type="text"], input');
  if (await input.count() > 0) return input.first();

  throw new Error('Singlish input field not found');
}

test('Pos_UI_0001 — Real-time output then Clear resets input', async ({ page }) => {
  await page.goto('https://www.swifttranslator.com/');

  const input = await getSinglishInput(page);

  const singlish = 'mama oyath ekka  gedhara yanna enna hithan innavaa.';
  const expectedTokens = ['මම', 'ඔයත්', 'එක්ක', 'ගෙදර', 'යන්න', 'හිතන්'];


  // Type Singlish (simulate real typing)
  await input.fill('');
  await input.type(singlish, { delay: 50 });

  // Wait until at least ONE Sinhala word appears
  await expect(page.locator('body')).toContainText('මම', {
    timeout: 15000,
  });

  // Verify all expected tokens
  for (const token of expectedTokens) {
    await expect(page.locator('body')).toContainText(token);
  }

  // Robust Clear button locator
  const clearBtn = page.locator(
    'button:has-text("Clear"), button[aria-label*="Clear" i]'
  ).first();

  await expect(clearBtn).toBeVisible({ timeout: 5000 });
  await clearBtn.click();

  // Input should be cleared
  await expect(input).toHaveValue('');

  // Output should eventually disappear
  await expect(page.locator('body')).not.toContainText('මම', {
    timeout: 10000,
  });
});
