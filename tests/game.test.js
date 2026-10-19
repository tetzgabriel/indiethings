// MeAsocie, the real game from its own repo, in both languages.

function enWords(w) { var o = {}; w.WORD_BANK_EN.forEach(function (c) { o[c.nome] = 1; c.palavras.forEach(function (p) { o[p] = 1; }); }); return o; }
function ptWords(w) { var o = {}; w.WORD_BANK.forEach(function (c) { o[c.nome] = 1; c.palavras.forEach(function (p) { o[p] = 1; }); }); return o; }
function cards(w) { return [].map.call(w.document.querySelectorAll('.card:not(.down)'), function (c) { return c.textContent.trim(); }); }
function saved(w, k) { try { return JSON.parse(w.localStorage.getItem(k)); } catch (e) { return null; } }
function catNames(g) { return g.cats.map(function (c) { return c.nome; }).join('|'); }
function allIn(list, set) { return list.length > 0 && list.every(function (t) { return set[t]; }); }

QUnit.module('game');

QUnit.test('a fresh game in English', async function (assert) {
  var f = await frame(GAME + '/index.html?lang=en'), w = f.contentWindow, d = w.document;
  assert.strictEqual(d.documentElement.lang, 'en');
  assert.strictEqual(d.getElementById('undo').textContent, 'Undo');
  assert.strictEqual(d.getElementById('new').textContent, 'New game');
  assert.strictEqual(d.title, 'MeAsocie');
  assert.strictEqual(w.getComputedStyle(d.getElementById('mode')).display, 'none', 'the medical switch is hidden in English');
  assert.true(allIn(cards(w), enWords(w)), 'every visible card is from the English bank');
  var g = saved(w, 'associe:en:v1');
  assert.ok(g && g.v === 2 && g.cats.length === 7, 'saved under associe:en:v1');
  assert.strictEqual(saved(w, 'associe:v2'), null, 'the Portuguese save key is untouched');
  assert.ok(/Draw a card|Empty stock/.test(d.querySelector('.stock').getAttribute('aria-label')), d.querySelector('.stock').getAttribute('aria-label'));
});

QUnit.test('switching language swaps the game on the table and keeps both saves', async function (assert) {
  var f = await frame(GAME + '/index.html?lang=en'), w = f.contentWindow, d = w.document;
  var gEn = saved(w, 'associe:en:v1');
  d.querySelector('[data-i18n-set="pt-BR"]').click(); await sleep(350);
  assert.strictEqual(d.documentElement.lang, 'pt-BR');
  assert.strictEqual(d.getElementById('undo').textContent, 'Desfazer');
  assert.strictEqual(d.getElementById('new').textContent, 'Novo jogo');
  assert.notStrictEqual(w.getComputedStyle(d.getElementById('mode')).display, 'none', 'the medical switch is back');
  assert.true(allIn(cards(w), ptWords(w)), 'cards are Portuguese');
  var gPt = saved(w, 'associe:v2');
  assert.ok(gPt && gPt.cats.length === 7, 'Portuguese game saved under the ORIGINAL key');
  assert.deepEqual(Object.keys(gPt).sort(), ['area', 'cats', 'cols', 'down', 'fc', 'finishedAt', 'history', 'leftAt', 'pool', 'ptr', 'slots', 'startedAt', 'top', 'v'], 'save shape unchanged');
  assert.strictEqual(catNames(saved(w, 'associe:en:v1')), catNames(gEn), 'the English save was kept');
  w.things18n.setLang('en'); await sleep(350);
  assert.strictEqual(catNames(saved(w, 'associe:en:v1')), catNames(gEn), 'English resumes with the same categories');
  assert.true(allIn(cards(w), enWords(w)), 'cards English again');
});

QUnit.test('reloading restores the saved Portuguese game', async function (assert) {
  var f = await frame(GAME + '/index.html?lang=pt-BR'), before = catNames(saved(f.contentWindow, 'associe:v2'));
  f.remove();
  var f2 = await frame(GAME + '/index.html?lang=pt-BR');
  assert.strictEqual(catNames(saved(f2.contentWindow, 'associe:v2')), before);
  assert.strictEqual(f2.contentDocument.documentElement.lang, 'pt-BR');
});

QUnit.test('medical mode: Portuguese only, remembered across a trip through English', async function (assert) {
  var f = await frame(GAME + '/index.html?lang=pt-BR'), w = f.contentWindow, root = w.document.documentElement;
  w.document.getElementById('mode').click(); await sleep(350);
  assert.true(root.classList.contains('med'), 'on in Portuguese');
  w.things18n.setLang('en'); await sleep(350);
  assert.false(root.classList.contains('med'), 'English is never medical');
  w.things18n.setLang('pt-BR'); await sleep(350);
  assert.true(root.classList.contains('med'), 'restored on return');
});

QUnit.test('no raw i18n keys on screen, in either language', async function (assert) {
  for (var L of ['en', 'pt-BR']) {
    var f = await frame(GAME + '/index.html?lang=' + L);
    assert.notOk(/\b(actions|timer|win|msg|aria|board|mode|meta)\.[a-zA-Z]+\b/.test(f.contentDocument.body.innerText), 'no raw keys in ' + L);
  }
});
