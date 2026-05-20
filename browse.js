const { chromium } = require('playwright');

(async () => {
  // Launch Chrome in non-headless mode (visible browser window)
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000  // Optional: slow down actions by 1 second for visibility
  });

  // Create a new page/tab
  const page = await browser.newPage();

  // Navigate to the website
  await page.goto('https://www.rahulshettyacademy.com', {
    waitUntil: 'networkidle'
  });

  console.log('✓ Navigated to https://www.rahulshettyacademy.com');
  console.log('✓ Chrome is open in non-headless mode');
  console.log('Press Ctrl+C to close the browser...');

  // Keep the browser open until user stops the script
  // Uncomment the line below to auto-close after 30 seconds
  // await new Promise(resolve => setTimeout(resolve, 30000));
  // await browser.close();
})();
