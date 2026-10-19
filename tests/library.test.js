// things18n itself: messages, language detection, DOM behaviour, key-less mode, auto switcher and debug mode.
// Every test opens a small fixture page (tests/fixtures) in an iframe and talks to its `things18n`.

/* ============================================================ messages */

QUnit.module('library: messages', {
  beforeEach: async function () {
    this.f = await frame('fixtures/logic.html?lang=en');
    this.i = this.f.contentWindow.things18n;
  }
});

QUnit.test('params, nested keys, braces, missing keys', function (assert) {
  var i = this.i;
  assert.strictEqual(i.t('hi', { name: 'Ana' }), 'Hello Ana');
  assert.strictEqual(i.t('ns.deep.key'), 'deep', 'nested keys are joined with dots');
  assert.strictEqual(i.t('lit'), 'Use {braces}', '{{ and }} are literal braces');
  assert.strictEqual(i.t('hi', { name: 'x' }, 'pt-BR'), 'Olá x', 'language can be passed explicitly');
  assert.strictEqual(i.t('nope'), 'nope', 'a missing key returns the key');
  assert.strictEqual(i.t('onlyPt'), 'onlyPt', 'a key the default language lacks returns the key');
});

QUnit.test('plurals: exact matches beat grammar (Portuguese counts 0 as singular)', function (assert) {
  var i = this.i;
  assert.strictEqual(i.t('cards', { count: 0 }), 'No cards');
  assert.strictEqual(i.t('cards', { count: 1 }), '1 card');
  assert.strictEqual(i.t('cards', { count: 5 }), '5 cards');
  i.setLang('pt-BR');
  assert.strictEqual(i.t('cards', { count: 0 }), 'Nenhuma carta', '=0 beats CLDR');
  assert.strictEqual(i.t('cards', { count: 1 }), '1 carta');
  assert.strictEqual(i.t('cards', { count: 2 }), '2 cartas');
});

QUnit.test('fallback to the default language, loose tags, unsupported languages', function (assert) {
  var i = this.i;
  i.setLang('pt-BR');
  assert.strictEqual(i.lang, 'pt-BR');
  assert.strictEqual(i.t('lit'), 'Use {braces}', 'falls back to the default language');
  assert.strictEqual(i.setLang('pt-PT'), true, 'pt-PT maps to pt-BR');
  assert.strictEqual(i.lang, 'pt-BR');
  assert.strictEqual(i.setLang('en-US'), true);
  assert.strictEqual(i.lang, 'en', 'en-US maps to en');
  assert.strictEqual(i.setLang('fr'), false, 'unsupported languages are rejected');
  assert.strictEqual(i.lang, 'en');
});

QUnit.test('pick(), has(), formatNumber()', function (assert) {
  var i = this.i;
  assert.strictEqual(i.pick({ en: 'a', 'pt-BR': 'b' }, 'pt-BR'), 'b');
  assert.strictEqual(i.pick({ en: 'a' }, 'pt-BR'), 'a', 'falls back to the default language');
  assert.strictEqual(i.pick('plain'), 'plain', 'non-objects pass straight through');
  assert.true(i.has('hi'));
  assert.false(i.has('zzz'));
  assert.strictEqual(i.formatNumber(1234.5), '1,234.5');
  i.setLang('pt-BR');
  assert.strictEqual(i.formatNumber(1234.5), '1.234,5');
});

QUnit.test('onChange fires on change only, and can unsubscribe', function (assert) {
  var i = this.i, seen = [];
  var off = i.onChange(function (l, p) { seen.push(p + '>' + l); });
  i.setLang('pt-BR'); i.setLang('pt-BR'); i.setLang('en'); off(); i.setLang('pt-BR');
  assert.strictEqual(seen.join(','), 'en>pt-BR,pt-BR>en');
});

/* ========================================================== detection */

QUnit.module('library: language detection');

[
  ['pt-PT,en', '', 'pt-BR', 'pt-PT maps to pt-BR'],
  ['pt', '', 'pt-BR', 'pt maps to pt-BR'],
  ['en-GB', '', 'en', 'en-GB maps to en'],
  ['fr-FR,es-MX,en', '', 'es', 'first supported language wins (fr unsupported, es-MX is es)'],
  ['fr', '', 'en', 'nothing supported: the default'],
  ['pt-BR', 'en', 'en', 'the saved choice beats the browser'],
  ['pt-BR', 'zz', 'pt-BR', 'an unsupported saved value is ignored'],
  ['', '', 'en', 'no browser languages: the default']
].forEach(function (c) {
  QUnit.test('browser [' + c[0] + '] saved [' + c[1] + '] → ' + c[2], async function (assert) {
    var f = await frame('fixtures/detect.html?nav=' + c[0] + '&stored=' + c[1], { settle: 100 });
    assert.strictEqual(f.contentWindow.things18n.lang, c[2], c[3]);
  });
});

QUnit.test('a language added after start is picked up if the user prefers it', async function (assert) {
  var f = await frame('fixtures/detect.html?nav=pt-BR&late=1', { settle: 100 }), i = f.contentWindow.things18n;
  assert.strictEqual(i.lang, 'en', 'before: only English exists');
  i.add('pt-BR', { a: 'a' });
  assert.strictEqual(i.lang, 'pt-BR', 'after add(): the preferred language is used');
});

/* ========================================================= DOM behaviour */

function dom() { return frame('fixtures/dom.html?lang=en'); }
function visible(f, id) { return f.contentWindow.getComputedStyle(f.contentDocument.getElementById(id)).display !== 'none'; }

QUnit.module('library: DOM', { beforeEach: async function () { this.f = await dom(); this.w = this.f.contentWindow; this.d = this.f.contentDocument; this.$ = this.d.getElementById.bind(this.d); } });

QUnit.test('first render: attributes, html, fallbacks, blocks, switchers', function (assert) {
  var d = this.d, $ = this.$;
  assert.strictEqual(d.documentElement.lang, 'en');
  assert.strictEqual(d.documentElement.dir, 'ltr');
  assert.strictEqual($('h').textContent, 'Hello Ana', 'data-i18n + params');
  assert.strictEqual(d.title, 'EN title', '<title data-i18n> is translated');
  assert.strictEqual(d.querySelector('meta[name=description]').content, 'EN description', 'meta content through data-i18n-attr');
  assert.strictEqual($('orig').textContent.indexOf('Original markup'), 0, 'a key missing everywhere keeps the original markup');
  assert.strictEqual($('html').innerHTML, 'Some <b>bold</b> text', 'data-i18n-html renders markup');
  assert.strictEqual($('inp').placeholder, 'Type here');
  assert.strictEqual($('inp').title, 'Hello Z', 'several attributes in one data-i18n-attr');
  assert.true(visible(this.f, 'blockEn') && !visible(this.f, 'blockPt'), 'data-lang blocks: only English shown');
  assert.strictEqual($('sw').children.length, 3, 'short switcher: one button per language');
  assert.strictEqual($('sw').children[0].textContent, 'EN');
  assert.strictEqual($('sw').children[2].title, 'العربية', 'custom label becomes the tooltip');
  assert.ok(/^Portugu/.test($('sw2').children[1].textContent), 'long switcher uses native names: ' + $('sw2').children[1].textContent);
  assert.strictEqual($('sw').querySelector('[aria-pressed=true]').textContent, 'EN');
  assert.strictEqual($('sel').options.length, 3, 'an empty select fills itself');
  assert.strictEqual($('sel').value, 'en');
});

QUnit.test('clicking the switcher re-translates everything', async function (assert) {
  var d = this.d, $ = this.$;
  $('sw').children[1].click();
  await sleep(60);
  assert.strictEqual(d.documentElement.lang, 'pt-BR');
  assert.strictEqual($('h').textContent, 'Olá Ana');
  assert.strictEqual(d.title, 'Título PT');
  assert.strictEqual($('fb').textContent, 'only in english', 'a key missing in pt-BR falls back to the default dictionary');
  assert.true(!visible(this.f, 'blockEn') && visible(this.f, 'blockPt'), 'blocks flipped');
  assert.strictEqual($('html').innerHTML, 'Texto <b>em negrito</b>');
  assert.strictEqual($('inp').placeholder, 'Digite aqui');
  assert.strictEqual($('sel').value, 'pt-BR');
  assert.strictEqual($('sw').querySelector('[aria-pressed=true]').textContent, 'PT');
  assert.strictEqual(this.w.localStorage.getItem('things18n:lang'), 'pt-BR', 'the choice is remembered');
});

QUnit.test('select, toggle, right-to-left and fallback', async function (assert) {
  var d = this.d, $ = this.$, i = this.w.things18n;
  $('sel').value = 'pt-BR'; $('sel').dispatchEvent(new Event('change', { bubbles: true })); await sleep(40);
  assert.strictEqual(i.lang, 'pt-BR', 'select change switches language');
  $('tog').click(); await sleep(40);
  assert.strictEqual(i.lang, 'ar', 'toggle moves to the next language');
  assert.strictEqual(d.documentElement.dir, 'rtl', 'right-to-left languages get dir=rtl');
  assert.strictEqual($('h').textContent, 'مرحبا Ana');
  assert.strictEqual($('html').innerHTML, 'Some <b>bold</b> text', 'a key missing in ar falls back to the default language');
  assert.strictEqual(i.t('cards', { count: 3 }), '3 cards', 't() falls back too');
});

QUnit.test('events and apply() for markup added later', async function (assert) {
  var d = this.d, $ = this.$, i = this.w.things18n, seen = [], domEvents = 0;
  var off = i.onChange(function (l, p) { seen.push(p + '>' + l); });
  d.addEventListener('things18n:change', function () { domEvents++; });
  i.setLang('pt-BR'); await sleep(30); i.setLang('en'); await sleep(30); off();
  assert.strictEqual(seen.join(), 'en>pt-BR,pt-BR>en', 'onChange callbacks fire');
  assert.strictEqual(domEvents, 2, 'and so does the DOM event');
  $('dyn').innerHTML = '<span id="late" data-i18n="hello" data-i18n-params=\'{"name":"Late"}\'>x</span>';
  i.apply($('dyn'));
  assert.strictEqual($('late').textContent, 'Hello Late', 'apply(root) translates new markup');
  i.setLang('pt-BR'); await sleep(40);
  assert.strictEqual($('late').textContent, 'Olá Late', 'and it re-translates on later changes');
});

QUnit.test('?lang= beats the saved choice, and follows manual switches', async function (assert) {
  localStorage.setItem('things18n:lang', 'en');
  var f = await frame('fixtures/dom.html?lang=pt-BR', { settle: 150 }), w = f.contentWindow;
  assert.strictEqual(w.things18n.lang, 'pt-BR', '?lang=pt-BR wins over the saved choice');
  assert.strictEqual(w.localStorage.getItem('things18n:lang'), 'en', 'and does not overwrite it');
  w.things18n.setLang('en'); await sleep(50);
  assert.ok(/lang=en/.test(w.location.search), 'after a manual switch the URL follows: ' + w.location.search);
});

QUnit.test('dictionary report: gaps between languages and {param} mismatches', function (assert) {
  var i = this.w.things18n;
  i.add('en', { pm: 'Hi {a}', onlyEn: 'x' });
  i.add('pt-BR', { pm: 'Oi {b}' });
  var r = i.report(true).dictionary;
  assert.ok(r.missing['pt-BR'].indexOf('onlyEn') >= 0, 'a key only the default has is a pt-BR gap');
  assert.notOk(r.missing.en, 'the default language never has gaps: its text lives in the HTML');
  assert.ok(r.missing.ar.indexOf('cards') >= 0, 'Arabic lacks keys the others have');
  assert.ok(r.params.some(function (x) { return x.indexOf('pm') === 0; }), '{param} mismatch found');
});

/* ============================================ key-less, switcher, debug */

QUnit.module('library: key-less mode, auto switcher, debug', {
  beforeEach: async function () { this.f = await frame('fixtures/easy.html?lang=pt-BR'); this.w = this.f.contentWindow; this.d = this.f.contentDocument; this.$ = this.d.getElementById.bind(this.d); this.i = this.w.things18n; }
});

QUnit.test('zero config: the default comes from <html lang>, languages from add()', function (assert) {
  assert.strictEqual(this.i.default, 'pt-BR');
  assert.deepEqual(this.i.langs, ['pt-BR', 'en']);
  assert.strictEqual(this.$('a').textContent, 'Olá, mundo', 'the default language leaves your text alone');
  assert.strictEqual(this.$('c').textContent, 'Olá, Ana!', '{params} still get filled in');
});

QUnit.test('data-switcher injects a floating switcher', function (assert) {
  var sw = this.d.querySelector('.things18n-switcher'), cs = this.w.getComputedStyle(sw);
  assert.ok(sw && sw.children.length === 2 && !sw.hidden, 'a button per language');
  assert.strictEqual(cs.position, 'fixed');
  assert.strictEqual(parseInt(cs.top), 12, 'top-right by default');
  assert.strictEqual(sw.querySelector('[aria-pressed=true]').textContent, 'PT');
});

QUnit.test('key-less: the text is the key', async function (assert) {
  var $ = this.$;
  this.d.querySelector('.things18n-switcher [data-i18n-set="en"]').click(); await sleep(60);
  assert.strictEqual($('a').textContent, 'Hello, world', 'text translated');
  assert.strictEqual($('b').textContent, 'Save changes', 'whitespace-insensitive match');
  assert.strictEqual($('c').textContent, 'Hello, Ana!', 'with params');
  assert.strictEqual($('d').placeholder, 'Search here', 'data-t-attr');
  assert.strictEqual($('d').getAttribute('aria-label'), 'Search here', 'several attributes');
  assert.strictEqual($('e').textContent, 'Sem tradução nenhuma', 'untranslated text stays as written');
  assert.strictEqual($('f').innerHTML, 'Misto <b>com tag</b>', 'an element with children is left alone');
  assert.strictEqual(this.i.t('Tchau'), 'Bye', 't() takes source text as the key too');
  assert.strictEqual(this.i.t('Nada'), 'Nada');
  assert.strictEqual(this.d.documentElement.lang, 'en');
  this.i.setLang('pt-BR'); await sleep(60);
  assert.strictEqual($('a').textContent, 'Olá, mundo', 'switching back restores the source text');
  assert.strictEqual($('d').placeholder, 'Buscar aqui');
});

QUnit.test('debug mode: outlines, badge and report', async function (assert) {
  var i = this.i, $ = this.$, d = this.d;
  i.setLang('en'); await sleep(60);
  assert.notOk(d.querySelector('[data-i18n-missing]') || d.querySelector('.things18n-debug'), 'off by default');
  i.debug(true); await sleep(60);
  assert.deepEqual([].map.call(d.querySelectorAll('[data-i18n-missing]'), function (e) { return e.id; }), ['e'], 'only the untranslated element is marked');
  assert.strictEqual(this.w.getComputedStyle($('e')).outlineStyle, 'dashed');
  var badge = d.querySelector('.things18n-debug');
  assert.ok(badge && /en · 1 missing/.test(badge.textContent) && /blocks/.test(badge.textContent), 'badge: ' + (badge && badge.textContent));
  var r = i.report(true);
  assert.strictEqual(r.missing.length, 1);
  assert.strictEqual(r.missing[0].key, 'Sem tradução nenhuma');
  assert.false(r.lopsidedBlocks);
  assert.strictEqual(r.blocks['pt-BR'], 1);
  i.t('another missing one');
  assert.ok(i.report(true).js.indexOf('another missing one') >= 0, 'report() also lists t() keys with no translation');
  i.debug(false); await sleep(40);
  assert.notOk(d.querySelector('[data-i18n-missing]') || d.querySelector('.things18n-debug'), 'debug(false) cleans up');
});

QUnit.test('?i18n=debug turns debug on from the URL', async function (assert) {
  var f = await frame('fixtures/easy.html?i18n=debug&lang=en', { settle: 200 });
  assert.ok(f.contentDocument.querySelector('.things18n-debug'));
});
