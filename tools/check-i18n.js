// Run: node tools/check-i18n.js
// 1. runs the generic things18n check on each page of this repo (dictionary parity, markup keys, language blocks)
// 2. repo-specific extras: keys used from JavaScript, registry kinds, vendored copy in sync
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var problems = [];
var generic = require('../things18n/check.js');

var pages = ['index.html', 'things/me_associe/index.html', 'things18n/index.html'];
generic.check(pages.map(function (p) { return path.join(root, p); })).forEach(function (r) {
  console.log(r.info);
  r.notes.forEach(function (n) { console.log('  note: ' + n); });
  r.problems.forEach(function (p) { problems.push(r.file.replace(root + '/', '') + ': ' + p); });
});

function load(file) {
  var dicts = {};
  var sandbox = { things18n: { add: function (lang, msgs) { dicts[lang] = msgs; return sandbox.things18n; } } };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  return dicts;
}
function flatten(o, p, out) {
  Object.keys(o).forEach(function (k) {
    var v = o[k], key = p ? p + '.' + k : k;
    if (v && typeof v === 'object' && !('other' in v)) flatten(v, key, out);
    else out[key] = v;
  });
  return out;
}

// every key referenced from JS (t('a.b'), setStatus('a.b'), 'msg.x' constants) must exist in every language
[['js/book.js', 'js/i18n.js'], ['things/me_associe/game.js', 'things/me_associe/i18n.js']].forEach(function (p) {
  var code = fs.readFileSync(path.join(root, p[0]), 'utf8');
  var d = load(path.join(root, p[1])), flat = {};
  Object.keys(d).forEach(function (l) { flat[l] = flatten(d[l], '', {}); });
  var used = {}, m;
  var re = /\bt\(\s*'([A-Za-z0-9_.]+)'|setStatus\(\s*'([a-z]+\.[A-Za-z0-9_.]+)'|'((?:msg|status|toast|aria|confirm|css)\.[A-Za-z0-9_.]+)'|i18n\.t\("([A-Za-z0-9_.]+)"/g;
  while ((m = re.exec(code))) used[m[1] || m[2] || m[3] || m[4]] = 1;
  Object.keys(used).forEach(function (k) {
    Object.keys(flat).forEach(function (l) {
      if (k.slice(-1) === '.') {   // dynamic key like t('kind.' + x): the namespace must exist
        if (!Object.keys(flat[l]).some(function (f) { return f.indexOf(k) === 0; })) problems.push(p[0] + ': namespace "' + k + '" is empty in ' + l);
      } else if (!(k in flat[l])) problems.push(p[0] + ': uses key "' + k + '" which is missing in ' + l);
    });
  });
  console.log(p[0] + ': ' + Object.keys(used).length + ' keys used from JS, all present');
});

// every `kind` used in the registry needs a kind.<name> label in the hub dictionary
var reg = fs.readFileSync(path.join(root, 'js/things.js'), 'utf8'), hub = load(path.join(root, 'js/i18n.js'));
(reg.match(/kind:\s*"([a-z]+)"/g) || []).forEach(function (m) {
  var kind = /"([a-z]+)"/.exec(m)[1];
  Object.keys(hub).forEach(function (l) { if (!(hub[l].kind && kind in hub[l].kind)) problems.push('registry kind "' + kind + '" has no label in js/i18n.js (' + l + ')'); });
});

// the vendored copy inside MeAsocie must match the library
if (fs.readFileSync(path.join(root, 'things18n/things18n.js'), 'utf8') !== fs.readFileSync(path.join(root, 'things/me_associe/things18n.js'), 'utf8')) {
  problems.push('things/me_associe/things18n.js differs from things18n/things18n.js (run: node tools/sync-things18n.js)');
}

if (problems.length) { console.error(problems.join('\n') + '\n\n' + problems.length + ' problem(s)'); process.exit(1); }
console.log('i18n OK');
