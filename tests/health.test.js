// Is anything untranslated or inconsistent? The same checks as ?i18n=debug, run on every page in every language,
// plus the word banks the game draws from.

function loadScript(url) {
  return new Promise(function (resolve, reject) {
    var s = document.createElement('script');
    s.src = url; s.onload = resolve; s.onerror = function () { reject(new Error('could not load ' + url)); };
    document.head.appendChild(s);
  });
}

/* ============================================================ translations */

QUnit.module('translations are complete');

[['hub', HUB + '/index.html'], ['docs', HUB + '/things18n/index.html'], ['game', GAME + '/index.html']].forEach(function (page) {
  QUnit.test(page[0] + ': nothing missing in any language', async function (assert) {
    var f = await frame(page[1] + '?i18n=debug&lang=en'), i = f.contentWindow.things18n;
    assert.ok(i.langs.length >= 2, 'languages: ' + i.langs.join(', '));
    for (var L of i.langs) {
      i.setLang(L); await sleep(300);
      var r = i.report(true);
      assert.deepEqual(r.missing.map(function (m) { return m.key; }), [], L + ': every translatable element has its translation');
      assert.deepEqual([].slice.call(r.js), [], L + ': every t() key found a translation');
      assert.false(r.lopsidedBlocks, L + ': data-lang blocks are even ' + JSON.stringify(r.blocks));
      assert.deepEqual(Object.keys(r.dictionary.missing), [], L + ': no dictionary gaps');
      assert.deepEqual([].slice.call(r.dictionary.params), [], L + ': {params} match across languages');
    }
  });
});

// keys that JavaScript asks for have no HTML text to fall back on, so they must exist in every language
[['hub', HUB + '/js/book.js', HUB + '/index.html'], ['game', GAME + '/game.js', GAME + '/index.html']].forEach(function (p) {
  QUnit.test(p[0] + ': keys used from JavaScript exist in every language', async function (assert) {
    var code = await (await fetch(p[1])).text(), f = await frame(p[2]), i = f.contentWindow.things18n;
    var used = {}, m, re = /\bt\(\s*'([A-Za-z0-9_.]+)'|setStatus\(\s*'([a-z]+\.[A-Za-z0-9_.]+)'|'((?:msg|status|toast|aria|confirm|css)\.[A-Za-z0-9_.]+)'|i18n\.t\("([A-Za-z0-9_.]+)"/g;
    while ((m = re.exec(code))) used[m[1] || m[2] || m[3] || m[4]] = 1;
    delete used['kind.'];   // built from the registry at runtime: checked below
    var keys = Object.keys(used);
    assert.ok(keys.length > 0, keys.length + ' keys found in ' + p[1]);
    keys.forEach(function (k) { i.langs.forEach(function (l) { assert.true(i.has(k, l), '"' + k + '" in ' + l); }); });
  });
});

QUnit.test('every kind in the registry has a label in every language', async function (assert) {
  var f = await frame(HUB + '/index.html'), w = f.contentWindow;
  w.THINGS.forEach(function (t) { w.things18n.langs.forEach(function (l) { assert.true(w.things18n.has('kind.' + t.kind, l), t.name + ': kind.' + t.kind + ' in ' + l); }); });
});

/* ================================================================== banks */

// The rules written at the top of each bank file in the game repo.
function bankProblems(label, cats, words) {
  var problems = [], seen = {}, names = cats.map(function (c) { return c.nome.toLowerCase(); });
  cats.forEach(function (c) {
    if (c.palavras.length !== words) problems.push(label + ' / ' + c.nome + ': ' + c.palavras.length + ' words, expected ' + words);
    c.palavras.forEach(function (w) {
      var k = w.toLowerCase();
      if (seen[k]) problems.push(label + ': "' + w + '" repeated (' + seen[k] + ' and ' + c.nome + ')');
      seen[k] = c.nome;
      if (names.indexOf(k) >= 0) problems.push(label + ': word "' + w + '" equals a category name');
      if (Math.max.apply(null, w.split(/[\s-]+/).map(function (s) { return s.length; })) > 11) problems.push(label + ' / ' + c.nome + ': "' + w + '" has a segment over 11 letters');
    });
  });
  return problems;
}

QUnit.module('word banks', { before: async function () {
  await Promise.all([GAME + '/words.js', GAME + '/words.en.js', GAME + '/words-med.js'].map(loadScript));
} });

QUnit.test('Portuguese bank follows its rules', function (assert) {
  assert.deepEqual(bankProblems('words.js', window.WORD_BANK, 12), []);
});

QUnit.test('English bank follows the same rules', function (assert) {
  assert.deepEqual(bankProblems('words.en.js', window.WORD_BANK_EN, 12), []);
  assert.ok(window.WORD_BANK_EN.length >= 7, 'enough categories for a game: ' + window.WORD_BANK_EN.length);
});

QUnit.test('category names are unique inside each bank', function (assert) {
  [['words.js', window.WORD_BANK], ['words.en.js', window.WORD_BANK_EN]].forEach(function (b) {
    var names = b[1].map(function (c) { return c.nome; });
    assert.strictEqual(names.length, new Set(names).size, b[0] + ' has no duplicate category');
  });
});

QUnit.test('medical bank: every area follows the rules and can fill a game', function (assert) {
  window.MED_BANK.forEach(function (a) {
    assert.deepEqual(bankProblems('words-med.js / ' + a.area, a.cats, 12), [], a.area);
    assert.ok(a.cats.length >= 7, a.area + ' has ' + a.cats.length + ' categories');
  });
});
