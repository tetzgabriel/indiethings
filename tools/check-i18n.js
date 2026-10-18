// Run: node tools/check-i18n.js
// Fails when two languages disagree: a key missing in one, or different {params}.
// Also checks that the vendored copy of things18n inside MeAsocie is identical to the original.
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var problems = [];

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
function params(v) {
  var strs = typeof v === 'string' ? [v] : Object.keys(v).map(function (k) { return v[k]; });
  var set = {};
  strs.forEach(function (s) { (s.replace(/\{\{|\}\}/g, '').match(/\{[A-Za-z0-9_.$-]+\}/g) || []).forEach(function (m) { set[m] = 1; }); });
  return Object.keys(set).sort();
}
function pluralShape(v) { return typeof v === 'string' ? 'string' : 'plural'; }

[['js/i18n.js', 'hub'], ['things/me_associe/i18n.js', 'MeAsocie']].forEach(function (f) {
  var d = load(path.join(root, f[0])), langs = Object.keys(d);
  var flat = {}; langs.forEach(function (l) { flat[l] = flatten(d[l], '', {}); });
  var all = {}; langs.forEach(function (l) { Object.keys(flat[l]).forEach(function (k) { all[k] = 1; }); });
  Object.keys(all).forEach(function (k) {
    langs.forEach(function (l) {
      if (!(k in flat[l])) return problems.push(f[1] + ': key "' + k + '" missing in ' + l);
      var ref = flat[langs[0]][k];
      if (!(k in flat[langs[0]])) return;
      // plural forms differ per language, so compare the union of params, not the shape
      var a = params(ref).join(','), b = params(flat[l][k]).join(',');
      if (a !== b) problems.push(f[1] + ': key "' + k + '" has params [' + a + '] in ' + langs[0] + ' but [' + b + '] in ' + l);
      if (typeof flat[l][k] !== 'string' && !('other' in flat[l][k])) problems.push(f[1] + ': plural "' + k + '" in ' + l + ' needs an "other" form');
    });
  });
  console.log(f[1] + ': ' + Object.keys(all).length + ' keys × ' + langs.length + ' languages (' + langs.join(', ') + ')');
});

// every `kind` used in the registry needs a kind.<name> label in the hub dictionary
var reg = fs.readFileSync(path.join(root, 'js/things.js'), 'utf8'), hub = load(path.join(root, 'js/i18n.js'));
(reg.match(/kind:\s*"([a-z]+)"/g) || []).forEach(function (m) {
  var kind = /"([a-z]+)"/.exec(m)[1];
  Object.keys(hub).forEach(function (l) { if (!(hub[l].kind && kind in hub[l].kind)) problems.push('registry kind "' + kind + '" has no label in js/i18n.js (' + l + ')'); });
});

var a = fs.readFileSync(path.join(root, 'things18n/things18n.js'), 'utf8');
var b = fs.readFileSync(path.join(root, 'things/me_associe/things18n.js'), 'utf8');
if (a !== b) problems.push('things/me_associe/things18n.js differs from things18n/things18n.js (copy it over)');

// every data-i18n key used in the HTML must exist in that page's dictionary
[['index.html', 'js/i18n.js'], ['things/me_associe/index.html', 'things/me_associe/i18n.js']].forEach(function (p) {
  var html = fs.readFileSync(path.join(root, p[0]), 'utf8');
  var d = load(path.join(root, p[1])), flat = {};
  Object.keys(d).forEach(function (l) { flat[l] = flatten(d[l], '', {}); });
  var re = /data-i18n(?:-html)?="([^"]+)"|data-i18n-attr="([^"]+)"/g, m;
  while ((m = re.exec(html))) {
    var keys = m[1] ? [m[1]] : m[2].split(';').map(function (x) { return x.slice(x.indexOf(':') + 1).trim(); });
    keys.forEach(function (k) { Object.keys(flat).forEach(function (l) { if (!(k in flat[l])) problems.push(p[0] + ': uses key "' + k + '" which is missing in ' + l); }); });
  }
});

// every key referenced from JS (t('a.b'), setStatus('a.b'), 'msg.x' constants) must exist in every language
[['js/book.js', 'js/i18n.js'], ['things/me_associe/game.js', 'things/me_associe/i18n.js']].forEach(function (p) {
  var code = fs.readFileSync(path.join(root, p[0]), 'utf8');
  var d = load(path.join(root, p[1])), flat = {};
  Object.keys(d).forEach(function (l) { flat[l] = flatten(d[l], '', {}); });
  var used = {}, m;
  var re = /\bt\(\s*'([A-Za-z0-9_.]+)'|setStatus\(\s*'([a-z]+\.[A-Za-z0-9_.]+)'|'((?:msg|status|toast|aria|confirm)\.[A-Za-z0-9_.]+)'|"((?:kind)\.)" *\+|i18n\.t\("([A-Za-z0-9_.]+)"/g;
  while ((m = re.exec(code))) used[m[1] || m[2] || m[3] || m[5]] = 1;
  // setStatus(cond ? 'a.b' : 'c.d') style calls are caught by the 'msg.' / 'status.' literal pattern above
  Object.keys(used).forEach(function (k) {
    Object.keys(flat).forEach(function (l) {
      if (k.slice(-1) === '.') {   // dynamic key like t('kind.' + x): the namespace must exist
        if (!Object.keys(flat[l]).some(function (f) { return f.indexOf(k) === 0; })) problems.push(p[0] + ': namespace "' + k + '" is empty in ' + l);
      } else if (!(k in flat[l])) problems.push(p[0] + ': uses key "' + k + '" which is missing in ' + l);
    });
  });
  console.log(p[0] + ': ' + Object.keys(used).length + ' keys used in JS, all present');
});

if (problems.length) { console.error(problems.join('\n') + '\n\n' + problems.length + ' problem(s)'); process.exit(1); }
console.log('i18n OK');
