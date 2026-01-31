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

test('Neg_UI_0001 — Invalid input does not produce Sinhala output', async ({ page }) => {
  await page.goto('https://www.swifttranslator.com/');

  const input = await getSinglishInput(page);

  // Invalid / gibberish input
  const invalidSinglish = 'asdf qwer zxcv 1234 !!!';
  
  // Type invalid input
  await input.fill('');
  await input.type(invalidSinglish, { delay: 50 });

  // Expect **no Sinhala translation** to appear
  await expect(page.locator('body')).not.toContainText(/අ|ම|ඔ|එ|ගෙ|ය|න|ව/ , {
    timeout: 10000,
  });

  // Optional: Clear button still works
  const clearBtn = page.locator(
    'button:has-text("Clear"), button[aria-label*="Clear" i]'
  ).first();

  await expect(clearBtn).toBeVisible({ timeout: 5000 });
  await clearBtn.click();

  // Input should be cleared
  await expect(input).toHaveValue('');
});
