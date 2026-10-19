// Run: node tools/check-i18n.js
// 1. the generic things18n check on each page of this repo (dictionary parity, markup keys, language blocks)
// 2. repo-specific extras: keys used from JavaScript exist in every language, registry kinds have labels
var fs = require('fs'), path = require('path');
var root = path.join(__dirname, '..');
var generic = require('../things18n/check.js');
var problems = [];
var GAME = process.env.ME_ASSOCIE || path.join(root, '..', 'me_associe');   // MeAsocie lives in its own repo
function rel(p) { return path.join(root, p); }
function game(p) { return path.join(GAME, p); }
var haveGame = fs.existsSync(GAME);
if (!haveGame) console.log('(no MeAsocie checkout at ' + GAME + ': skipping its checks; set ME_ASSOCIE to its folder)');

[rel('index.html'), rel('things18n/index.html')].concat(haveGame ? [game('index.html')] : []).forEach(function (p) {
  var r = generic.checkPage(p);
  console.log(r.info);
  r.notes.forEach(function (n) { console.log('  note: ' + n); });
  r.problems.forEach(function (x) { problems.push(path.basename(path.dirname(p)) + '/' + path.basename(p) + ': ' + x); });
});

// keys referenced from JS (t('a.b'), setStatus('a.b'), 'msg.x' constants) must exist in every language:
// unlike markup, JS has no HTML text to fall back on
[[rel('js/book.js'), rel('index.html')]].concat(haveGame ? [[game('game.js'), game('index.html')]] : []).forEach(function (p) {
  var code = fs.readFileSync(p[0], 'utf8'), i18n = generic.loadPage(p[1]).i18n;
  var used = {}, m;
  var re = /\bt\(\s*'([A-Za-z0-9_.]+)'|setStatus\(\s*'([a-z]+\.[A-Za-z0-9_.]+)'|'((?:msg|status|toast|aria|confirm|css)\.[A-Za-z0-9_.]+)'|i18n\.t\("([A-Za-z0-9_.]+)"/g;
  while ((m = re.exec(code))) used[m[1] || m[2] || m[3] || m[4]] = 1;
  delete used['kind.'];   // built at runtime from the registry; checked below
  Object.keys(used).forEach(function (k) {
    i18n.langs.forEach(function (l) { if (!i18n.has(k, l)) problems.push(path.basename(p[0]) + ': uses key "' + k + '" which is missing in ' + l); });
  });
  console.log(path.basename(p[0]) + ': ' + Object.keys(used).length + ' keys used from JS, all present');
});

// every `kind` in the registry needs a kind.<name> label in the hub dictionary
var hub = generic.loadPage(rel('index.html')).i18n;
(fs.readFileSync(rel('js/things.js'), 'utf8').match(/kind:\s*"([a-z]+)"/g) || []).forEach(function (m) {
  var kind = /"([a-z]+)"/.exec(m)[1];
  hub.langs.forEach(function (l) { if (!hub.has('kind.' + kind, l)) problems.push('registry kind "' + kind + '" has no label in ' + l); });
});

if (problems.length) { console.error(problems.join('\n') + '\n\n' + problems.length + ' problem(s)'); process.exit(1); }
console.log('i18n OK');
