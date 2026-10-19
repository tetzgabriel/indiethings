// The real pages: the hub, the things18n docs, what visitors without JavaScript see, and language sharing.

QUnit.module('hub');

QUnit.test('Portuguese: blocks, count line, registry, kind labels', async function (assert) {
  var f = await frame(HUB + '/index.html?lang=pt-BR'), d = f.contentDocument;
  assert.strictEqual(d.documentElement.lang, 'pt-BR');
  assert.ok(shownBlocks(f).length > 4 && shownBlocks(f).every(function (l) { return l === 'pt-BR'; }), 'only Portuguese blocks are visible');
  assert.ok(/coisas por enquanto/.test(d.getElementById('thing-count').textContent), d.getElementById('thing-count').textContent);
  assert.strictEqual(d.querySelectorAll('#things li').length, 2, 'two things in the registry');
  assert.ok(/Paciência/.test(d.getElementById('things').textContent), 'registry rendered in Portuguese');
  assert.ok(/jogo/.test(d.querySelector('#things .kind').textContent), 'kind label translated');
});

QUnit.test('switching to English re-renders the list, blocks and date', async function (assert) {
  var f = await frame(HUB + '/index.html?lang=pt-BR'), d = f.contentDocument;
  d.querySelector('.langswitch [data-i18n-set="en"]').click(); await sleep(100);
  assert.ok(/Word solitaire/.test(d.getElementById('things').textContent), 'list in English');
  assert.ok(/things so far/.test(d.getElementById('thing-count').textContent));
  assert.ok(shownBlocks(f).every(function (l) { return l === 'en'; }), 'English blocks only');
  var date = d.querySelector('[data-today]').textContent;
  assert.ok(/\d{4}/.test(date) && !/outubro|janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|novembro|dezembro/i.test(date), 'date formatted in English: ' + date);
});

QUnit.test('the registry links to the game, which lives in its own repo', async function (assert) {
  var f = await frame(HUB + '/index.html?lang=en'), links = [].map.call(f.contentDocument.querySelectorAll('#things a.thing'), function (a) { return a.getAttribute('href'); });
  assert.ok(links.indexOf(GAME + '/') >= 0, 'MeAsocie link: ' + links.join(', '));
});

QUnit.module('docs');

QUnit.test('English: one language visible, live demo with plurals', async function (assert) {
  var f = await frame(HUB + '/things18n/index.html?lang=en'), d = f.contentDocument;
  assert.strictEqual(d.documentElement.lang, 'en');
  assert.ok(shownBlocks(f).length > 20 && shownBlocks(f).every(function (l) { return l === 'en'; }), 'only English blocks visible (' + shownBlocks(f).length + ')');
  assert.ok(d.title.indexOf('translations for plain HTML') > 0);
  var cards = d.getElementById('demo-cards');
  assert.strictEqual(cards.textContent, 'You have no cards.');
  d.getElementById('demo-add').click();
  assert.strictEqual(cards.textContent, 'You have 1 card.');
  d.getElementById('demo-add').click();
  assert.strictEqual(cards.textContent, 'You have 2 cards.');
});

QUnit.test('Portuguese: demo re-renders, formats numbers, translates key-less text', async function (assert) {
  var f = await frame(HUB + '/things18n/index.html?lang=en'), d = f.contentDocument, cards = d.getElementById('demo-cards');
  d.getElementById('demo-add').click(); d.getElementById('demo-add').click();
  d.querySelector('.langswitch [data-i18n-set="pt-BR"]').click(); await sleep(100);
  assert.strictEqual(cards.textContent, 'Você tem 2 cartas.', 're-rendered in Portuguese');
  assert.ok(shownBlocks(f).every(function (l) { return l === 'pt-BR'; }));
  d.getElementById('demo-reset').click();
  assert.strictEqual(cards.textContent, 'Você não tem cartas.', 'pt "=0"');
  d.getElementById('demo-add').click();
  assert.strictEqual(cards.textContent, 'Você tem 1 carta.');
  assert.ok(d.getElementById('demo-number').textContent.indexOf('1.234.567,891') > 0, d.getElementById('demo-number').textContent);
  assert.ok(/Esta frase não tem chave/.test(d.body.textContent), 'key-less data-t line translated');
  assert.strictEqual(d.getElementById('demo-input').placeholder, 'escreva alguma coisa…');
});

QUnit.module('JavaScript turned off');

// A sandboxed iframe without allow-scripts runs no scripts at all.
[HUB + '/index.html', HUB + '/things18n/index.html'].forEach(function (url) {
  QUnit.test(url + ' shows exactly one language', async function (assert) {
    var f = await frame(url + '?lang=pt-BR', { sandbox: 'allow-same-origin', settle: 200 }), shown = shownBlocks(f);
    assert.ok(shown.length > 4, shown.length + ' blocks visible');
    assert.ok(shown.every(function (l) { return l === 'en'; }), 'all of them in the <html lang> language (en)');
  });
});

QUnit.module('language is shared between pages');

QUnit.test('the language chosen on the hub is the game\'s language too', async function (assert) {
  var h = await frame(HUB + '/index.html?lang=pt-BR');
  h.contentDocument.querySelector('.langswitch [data-i18n-set="en"]').click(); await sleep(100);
  var g = await frame(GAME + '/index.html');
  assert.strictEqual(g.contentWindow.things18n.lang, 'en');
});
