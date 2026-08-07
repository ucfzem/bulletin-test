// Test d'intégration navigateur (Playwright headless).
// Check = bascule FR→AR traduit bien Rang + Remarque,
// et que l'aperçu interagit sans erreur de console.
import { chromium } from 'playwright';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function serveStatic() {
  return http.createServer(async (req, res) => {
    try {
      const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
      const file = join('/tmp/opencode/bulletin-test', urlPath);
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
      res.end(data);
    } catch {
      res.writeHead(404); res.end('not found');
    }
  });
}

const server = serveStatic();
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const { port } = server.address();
const baseURL = `http://127.0.0.1:${port}/index.html`;

function assert(cond, msg) {
  if (!cond) { console.error('✗ FAIL: ' + msg); process.exitCode = 1; }
  else console.log('✓ ' + msg);
}

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(baseURL, { waitUntil: 'networkidle' });

// Vérifie l'état FR initial.
assert((await page.inputValue('#inputSchool')) === 'École Ibn Sina', 'FR: école traduite → École Ibn Sina');
assert((await page.inputValue('#f-rank')) === '2ᵉ de la classe', 'FR: rang en français');
assert((await page.inputValue('#inputTeachers')) === 'Al-Morabit · Al-Fassi', 'FR: professeurs traduits → Al-Morabit · Al-Fassi');

// Clique le bouton arabe.
await page.click('[data-lang="ar"]');
await page.waitForTimeout(200);

assert((await page.inputValue('#f-rank')) === 'الثاني في القسم', 'AR: rang traduit → الثاني في القسم');
assert((await page.inputValue('#f-remark')) === 'تلميذ جاد ومجتهد', 'AR: remarque traduite → تلميذ جاد ومجتهد');
assert((await page.inputValue('#inputTeachers')) === 'المرابط · الفاسي', 'AR: professeurs → المرابط · الفاسي');
assert((await page.$eval('html', (el) => el.getAttribute('dir'))) === 'rtl', 'AR: dir=rtl');

// Retour FR, tout revient.
await page.click('[data-lang="fr"]');
await page.waitForTimeout(200);
assert((await page.inputValue('#f-rank')) === '2ᵉ de la classe', 'FR: rang restauré');
assert((await page.inputValue('#f-remark')) === 'Élève sérieux et travailleur', 'FR: remarque restaurée');

// Saisie d'une note puis bascule AR : la note est conservée (bug historique).
await page.click('[data-lang="ar"]');
await page.waitForTimeout(200);
await page.fill('#g-isl1', '8.5');
assert((await page.inputValue('#g-isl1')) === '8.5', 'AR: note saisie (8.5)');
await page.click('[data-lang="fr"]');
await page.waitForTimeout(200);
assert((await page.inputValue('#g-isl1')) === '8.5', 'Note conservée après bascule FR');

// Aperçu mobile.
await page.click('#btnPreview');
await page.waitForTimeout(200);
assert(await page.isVisible('#mobile-card-render'), 'Aperçu mobile affiché');
const previewText = await page.textContent('#mobile-card-render');
assert(previewText.includes('Al-Morabit · Al-Fassi'), 'Aperçu: professeurs affichés');
assert(previewText.includes('22 '), 'Aperçu: effectif (22) affiché');
await page.click('#btnEdit');
await page.waitForTimeout(100);
assert(await page.isVisible('#form-view'), 'Retour au formulaire (Éditer)');

assert(errors.length === 0, 'Aucune erreur console (got: ' + errors.join(' | ') + ')');

await browser.close();
server.close();
console.log(process.exitCode ? '\nRESULT: ÉCHEC' : '\nRESULT: TOUT OK');
process.exit(process.exitCode || 0);