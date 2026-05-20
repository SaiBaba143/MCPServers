const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('https://www.rahulshettyacademy.com', { waitUntil: 'networkidle' });
    console.log('Opened main page');

    // Click QA Jobs or Jobs
    const qa = page.locator('text=QA Jobs').first();
    const jobs = page.locator('text=Jobs').first();
    let targetPage = page;
    if (await qa.count() > 0) {
      const [newPage] = await Promise.all([
        context.waitForEvent('page').catch(() => null),
        qa.click(),
      ]);
      targetPage = newPage || page;
      console.log('Clicked QA Jobs');
    } else if (await jobs.count() > 0) {
      const [newPage] = await Promise.all([
        context.waitForEvent('page').catch(() => null),
        jobs.click(),
      ]);
      targetPage = newPage || page;
      console.log('Clicked Jobs');
    } else console.log('No QA Jobs/Jobs');

    await targetPage.waitForLoadState('networkidle');

    // Click sign up
    if (await targetPage.locator('text=Sign Up').count() > 0) {
      const [maybePage] = await Promise.all([
        context.waitForEvent('page').catch(() => null),
        targetPage.locator('text=Sign Up').first().click(),
      ]);
      targetPage = maybePage || targetPage;
      console.log('Clicked Sign Up');
    } else if (await targetPage.locator('button:has-text("Sign Up")').count() > 0) {
      await targetPage.locator('button:has-text("Sign Up")').first().click();
      console.log('Clicked Sign Up button');
    } else console.log('Sign Up not found');

    await targetPage.waitForLoadState('networkidle');
    console.log('Sign up page URL:', targetPage.url());

    const inputs = await targetPage.$$eval('input', els => els.map(e => ({type: e.type, name: e.name, id: e.id, placeholder: e.placeholder, outerHTML: e.outerHTML.slice(0,200)})) );
    console.log('Found inputs:', JSON.stringify(inputs, null, 2));

    const labels = await targetPage.$$eval('label', els => els.map(e => ({text: e.innerText, outerHTML: e.outerHTML.slice(0,200)})));
    console.log('Found labels:', JSON.stringify(labels, null, 2));

    // Save to file for inspection
    const fs = require('fs');
    const content = await targetPage.content();
    fs.writeFileSync('signup_page_dump.html', content);
    console.log('Wrote signup_page_dump.html to current folder');

  } catch (e) {
    console.error('Debug error:', e);
  } finally {
    // leave browser open for manual inspection
  }
})();
