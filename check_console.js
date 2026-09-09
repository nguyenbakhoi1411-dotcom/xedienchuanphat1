const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('[CONSOLE ERROR]', msg.text());
    }
  });

  await page.goto('http://localhost:3000/login');
  
  await page.fill('input[type="email"], input[type="text"]', 'admin@chuanphat.vn');
  await page.fill('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');

  await page.waitForNavigation();
  
  // Wait a few seconds for dashboard to load and errors to appear
  await page.waitForTimeout(5000);
  
  await browser.close();
})();
