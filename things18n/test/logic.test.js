// Run: node things18n/test/logic.test.js   (pure logic; the DOM side is covered by test/dom.html)
var assert = require('assert');
var i18n = require('../things18n.js');
i18n.init({ default: 'en', langs: ['en', 'pt-BR'], warn: false });
i18n.add('en', { hi: 'Hello {name}', ns: { deep: { key: 'deep' } }, cards: { '=0': 'No cards', one: '{count} card', other: '{count} cards' }, lit: 'Use {{braces}}' });
i18n.add('pt-BR', { hi: 'Olá {name}', cards: { '=0': 'Nenhuma carta', one: '{count} carta', other: '{count} cartas' }, onlyPt: 'só pt' });

var pass = 0;
function eq(a, b, m) { assert.strictEqual(a, b, m); pass++; }

i18n.setLang('en');
eq(i18n.t('hi', { name: 'Ana' }), 'Hello Ana');
eq(i18n.t('ns.deep.key'), 'deep', 'nested keys flatten');
eq(i18n.t('cards', { count: 0 }), 'No cards');
eq(i18n.t('cards', { count: 1 }), '1 card');
eq(i18n.t('cards', { count: 5 }), '5 cards');
eq(i18n.t('lit'), 'Use {braces}');
eq(i18n.t('hi', { name: 'x' }, 'pt-BR'), 'Olá x', 'explicit language arg');
eq(i18n.t('nope'), 'nope', 'missing key returns the key');
eq(i18n.t('onlyPt'), 'onlyPt', 'key missing in the default language returns the key');

i18n.setLang('pt-BR');
eq(i18n.lang, 'pt-BR');
eq(i18n.t('cards', { count: 0 }), 'Nenhuma carta', '=0 beats CLDR (pt treats 0 as "one")');
eq(i18n.t('cards', { count: 1 }), '1 carta');
eq(i18n.t('cards', { count: 2 }), '2 cartas');
eq(i18n.t('lit'), 'Use {braces}', 'falls back to default language');
eq(i18n.setLang('pt-PT'), true, 'pt-PT maps to pt-BR');
eq(i18n.lang, 'pt-BR');
eq(i18n.setLang('en-US'), true); eq(i18n.lang, 'en', 'en-US maps to en');
eq(i18n.setLang('fr'), false, 'unsupported rejected'); eq(i18n.lang, 'en');

eq(i18n.pick({ en: 'a', 'pt-BR': 'b' }, 'pt-BR'), 'b');
eq(i18n.pick({ en: 'a' }, 'pt-BR'), 'a', 'pick falls back to default');
eq(i18n.pick('plain'), 'plain', 'non-objects pass through');
eq(i18n.has('hi'), true); eq(i18n.has('zzz'), false);

var seen = [];
var off = i18n.onChange(function (l, p) { seen.push(p + '>' + l); });
i18n.setLang('pt-BR'); i18n.setLang('pt-BR'); i18n.setLang('en'); off(); i18n.setLang('pt-BR');
eq(seen.join(','), 'en>pt-BR,pt-BR>en', 'events fire on change only; unsubscribe works');
eq(i18n.formatNumber(1234.5), '1.234,5', 'pt-BR number format');
i18n.setLang('en'); eq(i18n.formatNumber(1234.5), '1,234.5');

// ---- language detection: storage > navigator.languages > default (the ?lang= step needs a DOM: see tools/e2e/dom.html)
var vm = require('vm'), fs = require('fs'), path = require('path');
var src = fs.readFileSync(path.join(__dirname, '..', 'things18n.js'), 'utf8');
function fresh(navLangs, stored) {
  var store = stored ? { 'things18n:lang': stored } : {};
  var sb = { navigator: { languages: navLangs, language: navLangs[0] }, console: { warn: function () {}, error: console.error }, Intl: Intl, Promise: Promise,
    localStorage: { getItem: function (k) { return k in store ? store[k] : null; }, setItem: function (k, v) { store[k] = v; } } };
  vm.runInNewContext(src, sb);
  sb.things18n.init({ default: 'en', langs: ['en', 'pt-BR', 'es'], warn: false });
  sb.things18n.add('en', { a: 'a' }); sb.things18n.add('pt-BR', { a: 'a' }); sb.things18n.add('es', { a: 'a' });
  return sb.things18n;
}
eq(fresh(['pt-PT', 'en'], null).lang, 'pt-BR', 'navigator pt-PT -> pt-BR');
eq(fresh(['pt'], null).lang, 'pt-BR', 'navigator pt -> pt-BR');
eq(fresh(['en-GB'], null).lang, 'en', 'navigator en-GB -> en');
eq(fresh(['fr-FR', 'es-MX', 'en'], null).lang, 'es', 'first supported navigator language wins (fr unsupported, es-MX -> es)');
eq(fresh(['fr'], null).lang, 'en', 'nothing supported -> default');
eq(fresh(['pt-BR'], 'en').lang, 'en', 'stored choice beats navigator');
eq(fresh(['pt-BR'], 'zz').lang, 'pt-BR', 'unsupported stored value is ignored');
eq(fresh([], null).lang, 'en', 'no navigator languages -> default');
var late = (function () {  // languages added AFTER init still resolve against the same preference list
  var sb = { navigator: { languages: ['pt-BR'] }, console: { warn: function () {} }, Intl: Intl, Promise: Promise, localStorage: { getItem: function () { return null; }, setItem: function () {} } };
  vm.runInNewContext(src, sb);
  sb.things18n.init({ default: 'en', warn: false });
  var before = sb.things18n.lang;
  sb.things18n.add('pt-BR', { a: 'a' });
  return before + '>' + sb.things18n.lang;
})();
eq(late, 'en>pt-BR', 'a language added after init is picked up automatically if the user prefers it');

console.log('logic tests passed: ' + pass);
