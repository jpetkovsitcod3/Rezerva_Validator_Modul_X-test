import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
const failedRequests = [];

page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('requestfailed', req => {
  failedRequests.push(`${req.failure()?.errorText} — ${req.url()}`);
});

await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });

const title = await page.title();
const bodyText = await page.locator('body').innerText().catch(() => '(no text)');
const bodyChars = bodyText.length;
await page.screenshot({ path: 'C:/Users/Sitcd3/Documents/Rezerva DESIGN_Validator/Validator_Modul_X-test/email-validator/frontend/live_preview.png', fullPage: false });
const headings = await page.locator('h1,h2,h3').allInnerTexts().catch(() => []);
const buttons = await page.locator('button').allInnerTexts().catch(() => []);

await browser.close();

console.log(JSON.stringify({
  title,
  bodyChars,
  headings,
  buttons,
  consoleErrors: errors.filter(e => !e.includes('favicon')),
  failedRequests: failedRequests.filter(r => !r.includes('favicon')),
  screenshotPath: 'C:/Users/Sitcd3/Documents/Rezerva DESIGN_Validator/Validator_Modul_X-test/email-validator/frontend/live_preview.png'
}, null, 2));
