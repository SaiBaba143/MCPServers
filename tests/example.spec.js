const { test, expect } = require('@playwright/test');

test('homepage has title', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com');
  await console.log(page.title())
  await expect(page).toHaveURL('https://rahulshettyacademy.com/');
});
