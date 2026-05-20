const { test, expect } = require('@playwright/test');

test.use({ channel: 'chrome' });

test('homepage has title', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com');
  console.log(await page.title());
  await expect(page).toHaveURL('https://rahulshettyacademy.com/');
});
