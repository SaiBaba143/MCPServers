const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('https://www.rahulshettyacademy.com', { waitUntil: 'networkidle' });
    console.log('Opened rahulshettyacademy');

    // Click QA Jobs or Jobs link (may open in same tab or new tab)
    const qaLocator = page.locator("text=QA Jobs").first();
    const jobsLocator = page.locator("text=Jobs").first();
    let targetPage = page;

    if (await qaLocator.count() > 0) {
      const [newPage] = await Promise.all([
        context.waitForEvent('page').catch(() => null),
        qaLocator.click(),
      ]);
      targetPage = newPage || page;
      console.log('Clicked QA Jobs');
    } else if (await jobsLocator.count() > 0) {
      const [newPage] = await Promise.all([
        context.waitForEvent('page').catch(() => null),
        jobsLocator.click(),
      ]);
      targetPage = newPage || page;
      console.log('Clicked Jobs');
    } else {
      console.log('QA Jobs/Jobs link not found');
    }

    if (targetPage) await targetPage.waitForLoadState('networkidle');

    // Click Sign Up — handle cases where it opens a modal or a new page
    const signUpSelector = "text=Sign Up";
    // Proactively close/remove overlays or welcome modal that may block clicks
    try {
      // Dismiss native dialogs
      page.on('dialog', async dialog => {
        console.log('Dialog detected:', dialog.message());
        try { await dialog.dismiss(); } catch(e) { try { await dialog.accept(); } catch(e2){} }
      });

      // Remove blocking overlay elements (common pattern on the site)
      await targetPage.evaluate(() => {
        const overlays = Array.from(document.querySelectorAll('div'))
          .filter(e => (e.className || '').includes('fixed') && (e.className || '').includes('z-50'));
        for (const o of overlays) o.remove();
      }).catch(() => {});

      // If a popup page exists with the welcome message, close it
      for (const p of context.pages()) {
        try {
          const html = await p.content();
          if (html && html.includes('Welcome to TechSmartHire!')) {
            if (p !== targetPage) {
              await p.close();
              console.log('Closed popup page with welcome message');
            } else {
              // try to close modal inside targetPage
              const closeBtn = p.locator("button:has-text('Close'), button:has-text('close'), button[aria-label='close'), button:has-text('×')").first();
              if (await closeBtn.count() > 0) {
                await closeBtn.click();
                console.log('Clicked close button inside welcome modal');
              } else {
                await p.keyboard.press('Escape');
                console.log('Pressed Escape to close welcome modal');
              }
            }
          }
        } catch (e) { }
      }

      // Also try to find the welcome text inside frames and close modal
      for (const frame of targetPage.frames()) {
        try {
          const fHtml = await frame.content();
          if (fHtml && fHtml.includes('Welcome to TechSmartHire!')) {
            const closeBtn = frame.locator("button:has-text('Close'), button:has-text('×')").first();
            if (await closeBtn.count() > 0) {
              await closeBtn.click();
              console.log('Closed welcome modal inside iframe');
            }
          }
        } catch(e) {}
      }
    } catch (e) { console.log('Overlay cleanup error', e); }

    // Now attempt to click Sign Up
    if (await targetPage.locator(signUpSelector).count() > 0) {
      const [maybePage] = await Promise.all([
        context.waitForEvent('page').catch(() => null),
        targetPage.locator(signUpSelector).first().click(),
      ]);
      if (maybePage) targetPage = maybePage;
      console.log('Clicked Sign Up');
    } else if (await targetPage.locator('button:has-text("Sign Up")').count() > 0) {
      await targetPage.locator('button:has-text("Sign Up")').first().click();
      console.log('Clicked Sign Up button');
    } else {
      console.log('Sign Up not found on target page');
    }

    await targetPage.waitForLoadState('networkidle');

    // Now search for "I'm a Candidate" option
    const candidateLocator = targetPage.locator("text=I'm a Candidate").first();
    let candidateFound = false;

    // Remove blocking overlays repeatedly (some are re-rendered dynamically)
    for (let i = 0; i < 6; i++) {
      const overlays = await targetPage.locator("div[class*='fixed'][class*='z-50']").count();
      if (overlays === 0) break;
      await targetPage.evaluate(() => {
        Array.from(document.querySelectorAll('div')).forEach(e => {
          const cls = e.className || '';
          if (cls.includes('fixed') && cls.includes('z-50')) e.remove();
        });
      }).catch(() => {});
      await targetPage.waitForTimeout(300);
    }

    if (await candidateLocator.count() > 0) {
      try {
        await candidateLocator.click({ timeout: 5000 });
        console.log("Clicked \"I'm a Candidate\"");
        candidateFound = true;
      } catch (e) {
        // try force click as fallback
        await candidateLocator.click({ force: true }).catch(()=>{});
        console.log('Attempted force click on "I\'m a Candidate"');
        candidateFound = true;
      }
    } else {
      // try alternative texts
      const alt = targetPage.locator("text=I am a Candidate").first();
      if (await alt.count() > 0) {
        await alt.click().catch(() => {});
        console.log('Clicked "I am a Candidate"');
        candidateFound = true;
      } else {
        console.log("I'm a Candidate option not found");
      }
    }

    // Robust email field search: placeholder, aria-label, common names
    const emailSelectors = [
      "input[type='email']",
      "input[name*='email']",
      "input[id*='email']",
      "input[placeholder*='Email']",
      "input[aria-label*='Email']",
      "textarea[placeholder*='Email']",
    ];
    let filled = false;
    for (const sel of emailSelectors) {
      const loc = targetPage.locator(sel).first();
      if (await loc.count() > 0) {
        await loc.fill('saibabakaradi4@gmail.com');
        console.log('Filled email using selector:', sel);
        filled = true;
        break;
      }
    }
    if (!filled) console.log('Email field not found with common selectors');

    console.log('Form filled but NOT submitted');
    await targetPage.waitForTimeout(3000);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    // keep browser open for manual inspection; do not close automatically
  }
})();
