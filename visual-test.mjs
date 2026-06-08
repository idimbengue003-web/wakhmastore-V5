import { chromium } from 'playwright';
import { spawn } from 'child_process';

const BASE = 'http://localhost:3000';

async function main() {
  // Start the dev server as a child process
  console.log('Starting dev server...');
  const server = spawn('bun', ['run', 'dev'], {
    cwd: '/home/z/my-project',
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });
  
  server.stdout.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('Ready')) console.log('Server ready:', msg.trim());
  });
  server.stderr.on('data', (data) => {
    // ignore
  });

  // Wait for server to be ready
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const resp = await fetch(BASE);
      if (resp.ok) { ready = true; break; }
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  
  if (!ready) {
    console.error('Server did not start!');
    process.exit(1);
  }
  console.log('Server is ready!');

  const browser = await chromium.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] 
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // 1. Homepage
  console.log('\n=== 1. HOMEPAGE ===');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/01-homepage.png', fullPage: true });
  console.log('Title:', await page.title());
  console.log('URL:', page.url());
  const homeText = await page.evaluate(() => document.body.innerText);
  console.log('Text preview:', homeText.substring(0, 500));

  // 2. Annonces list
  console.log('\n=== 2. ANNONCES LIST ===');
  await page.goto(BASE + '/annonces', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/02-annonces.png', fullPage: true });
  console.log('Title:', await page.title());
  console.log('URL:', page.url());
  const annoncesText = await page.evaluate(() => document.body.innerText);
  console.log('Text preview:', annoncesText.substring(0, 800));

  // 3. Click "Voir l'annonce" on first card
  console.log('\n=== 3. ANNONCE DETAIL ===');
  const voirLink = page.locator('a:has-text("Voir l\'annonce")').first();
  const annonceLink = page.locator('a[href*="/annonces/"]').first();
  
  let detailUrl = null;
  if (await voirLink.count() > 0) {
    detailUrl = await voirLink.getAttribute('href');
    console.log('Found "Voir l\'annonce" link:', detailUrl);
    await voirLink.click();
  } else if (await annonceLink.count() > 0) {
    detailUrl = await annonceLink.getAttribute('href');
    console.log('Found annonce link:', detailUrl);
    await annonceLink.click();
  } else {
    console.log('No annonce links found, listing all links...');
    const allLinks = await page.locator('a').all();
    for (const link of allLinks) {
      const href = await link.getAttribute('href');
      const text = await link.innerText().catch(() => '');
      console.log('  Link:', href, '-', text.substring(0, 50));
    }
  }
  
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/03-annonce-detail.png', fullPage: true });
  console.log('Title:', await page.title());
  console.log('URL:', page.url());
  const detailText = await page.evaluate(() => document.body.innerText);
  console.log('Text preview:', detailText.substring(0, 800));

  // 4. Login
  console.log('\n=== 4. LOGIN ===');
  await page.goto(BASE + '/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/04-login-page.png', fullPage: true });
  console.log('Title:', await page.title());
  console.log('URL:', page.url());
  
  // Fill login form
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="mot"]').first();
  
  if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
    await emailInput.fill('demo@wakhmastore.com');
    await passwordInput.fill('Demo1234');
    console.log('Filled email and password');
    
    // Click submit
    const submitBtn = page.locator('button[type="submit"], button:has-text("Se connecter"), button:has-text("Connexion"), button:has-text("Login"), button:has-text("connecter")').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      console.log('Clicked submit button');
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3000);
    } else {
      console.log('Could not find submit button');
      // List all buttons
      const buttons = await page.locator('button').all();
      for (const btn of buttons) {
        console.log('  Button:', await btn.innerText().catch(() => ''));
      }
    }
  } else {
    console.log('Could not find email/password inputs');
    const inputs = await page.locator('input').all();
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      console.log('  Input:', { type, name, placeholder });
    }
  }
  
  await page.screenshot({ path: '/tmp/05-after-login.png', fullPage: true });
  console.log('Title after login:', await page.title());
  console.log('URL after login:', page.url());
  const afterLoginText = await page.evaluate(() => document.body.innerText);
  console.log('Text preview:', afterLoginText.substring(0, 500));

  // 5. Annonce detail as logged-in user
  console.log('\n=== 5. ANNONCE DETAIL (LOGGED IN) ===');
  await page.goto(BASE + '/annonces', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // If we know the detail URL from before, use it directly
  if (detailUrl) {
    await page.goto(BASE + detailUrl, { waitUntil: 'networkidle', timeout: 30000 });
  } else {
    const annonceLinks2 = await page.locator('a[href*="/annonces/"]').all();
    if (annonceLinks2.length > 0) {
      const href = await annonceLinks2[0].getAttribute('href');
      console.log('Navigating to annonce:', href);
      await annonceLinks2[0].click();
    }
  }
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/06-annonce-detail-logged-in.png', fullPage: true });
  console.log('Title:', await page.title());
  console.log('URL:', page.url());
  const detailLoggedInText = await page.evaluate(() => document.body.innerText);
  console.log('Text preview:', detailLoggedInText.substring(0, 800));

  // 6. Deposer form
  console.log('\n=== 6. DEPOSER FORM ===');
  await page.goto(BASE + '/deposer', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/07-deposer.png', fullPage: true });
  console.log('Title:', await page.title());
  console.log('URL:', page.url());
  const deposerText = await page.evaluate(() => document.body.innerText);
  console.log('Text preview:', deposerText.substring(0, 1000));
  // Check for phone and WhatsApp fields
  const phoneInput = page.locator('input[name="phone"], input[placeholder*="téléphone"], input[placeholder*="phone"], input[placeholder*="Téléphone"]').first();
  const whatsappInput = page.locator('input[name="whatsapp"], input[placeholder*="WhatsApp"], input[placeholder*="whatsapp"]').first();
  console.log('Phone field found:', await phoneInput.count() > 0);
  console.log('WhatsApp field found:', await whatsappInput.count() > 0);

  // 7. Parrainage page
  console.log('\n=== 7. PARRAINAGE PAGE ===');
  await page.goto(BASE + '/parrainage', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/08-parrainage.png', fullPage: true });
  console.log('Title:', await page.title());
  console.log('URL:', page.url());
  const parrainageText = await page.evaluate(() => document.body.innerText);
  console.log('Text preview:', parrainageText.substring(0, 800));

  await browser.close();
  
  // Kill the server
  server.kill();
  
  console.log('\n=== ALL TESTS COMPLETE ===');
}

main().catch(e => { console.error(e); process.exit(1); });
