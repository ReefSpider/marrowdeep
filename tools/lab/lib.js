// headless harness: serves the repo from disk (three.js and PeerJS are in lib/ since v45), blocks fonts
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path');
const ROOT = process.env.GAME || '/home/claude/marrowdeep';
const THREE = path.join(__dirname, 'node_modules/three/build/three.min.js');
const MIME = { js: 'application/javascript', html: 'text/html', css: 'text/css', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', json: 'application/json', ogg: 'audio/ogg', svg: 'image/svg+xml' };
async function open(q = '', opt = {}) {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  const page = await browser.newPage({ viewport: opt.vp || { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e && e.stack || e)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.route('**/*', async r => {
    const u = new URL(r.request().url());
    if (u.hostname.includes('cdnjs')) return r.fulfill({ body: fs.readFileSync(THREE), contentType: MIME.js });
    if (u.hostname !== 'game.local') return r.abort();
    let p = path.join(ROOT, decodeURIComponent(u.pathname)); if (p.endsWith('/')) p += 'index.html';
    if (!fs.existsSync(p)) return r.fulfill({ status: 404, body: '' });
    return r.fulfill({ body: fs.readFileSync(p), contentType: MIME[p.split('.').pop()] || 'application/octet-stream' });
  });
  await page.goto('http://game.local/index.html' + q);
  await page.waitForFunction(() => typeof mode !== 'undefined' && mode === 'title', null, { timeout: 60000 });
  return { browser, page, errs };
}
module.exports = { open };
