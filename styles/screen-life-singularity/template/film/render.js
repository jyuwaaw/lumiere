// usage: node render.js frames <outdir> <fps> <worker> <nworkers>  |  node render.js stills <outdir> t1 t2 ...
const puppeteer = require('puppeteer-core'); const fs = require('fs'); const path = require('path');
(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/chromium', headless: 'new',
    args: ['--no-sandbox', '--force-device-scale-factor=' + (process.env.SCALE || 1), '--window-size=1920,1080', '--font-render-hinting=none', '--disable-lcd-text', '--hide-scrollbars'] });
  const page = await browser.newPage();
  page.on('console', m => console.log('[page]', m.text())); page.on('pageerror', e => console.log('[err]', e.message));
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: +(process.env.SCALE || 1) });
  await page.goto('file://' + path.resolve(__dirname, 'index.html'), { timeout: 0 });
  await page.waitForFunction('window.READY === true', { timeout: 0 });
  const meta = await page.evaluate(() => ({ duration: FILM.duration, SFX: FILM.SFX, marks: FILM.marks }));
  if (mode === 'stills') {
    for (const ts of rest) { const t = +ts; await page.evaluate(t => FILM.seek(t), t); await page.screenshot({ path: `${out}/t${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 88 }); }
    fs.writeFileSync(`${out}/meta.json`, JSON.stringify(meta, null, 1));
  } else if (mode === 'range') {
    const fps = +rest[0], a = +rest[1], b = +rest[2];
    for (let f = a; f <= b; f++) { await page.evaluate(t => FILM.seek(t), f / fps); await page.screenshot({ path: `${out}/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 }); }
  } else {
    const fps = +rest[0], wk = +rest[1], nw = +rest[2]; const N = Math.ceil(meta.duration * fps);
    if (wk === 0) fs.writeFileSync(`${out}/../meta.json`, JSON.stringify(meta));
    const per = Math.ceil(N / nw), a = wk * per, b = Math.min(N, a + per); const t0 = Date.now();
    for (let f = a; f < b; f++) {
      await page.evaluate(t => FILM.seek(t), f / fps);
      await page.screenshot({ path: `${out}/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 });
      if ((f - a) % 300 === 0) console.log(`w${wk} ${f - a}/${b - a} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
  }
  await browser.close();
})();
