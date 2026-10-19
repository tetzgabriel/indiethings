#!/usr/bin/env node
/* things18n check — finds missing translations before your visitors do. Optional: the library itself never needs Node.
   Zero dependencies, needs Node 14+.

     node check.js                 checks every .html in the current folder
     node check.js index.html      checks one page (and the scripts it loads)
     node check.js site/ other/    several folders or pages

   For each page it loads the real things18n.js, feeds it your dictionaries (every <script> that calls
   things18n.add(), inline or src=) and reads your markup. It reports:

     - keys used in the HTML (data-i18n, data-i18n-html, data-i18n-attr) that a language doesn't have
     - key-less texts (data-t, data-t-attr) with no translation in a language
     - keys that exist in one language's dictionary but not in another's, or with different {params}
     - uneven data-lang blocks (e.g. 14 English blocks but 13 Portuguese ones)

   It exits with code 1 if it found any problem, so it works in CI too. It reads HTML with regular expressions:
   a safety net, not a validator. Unusual markup (a data-t element holding other elements, keys built in
   JavaScript) is out of its reach. The same dictionary checks run in the browser with ?i18n=debug. */
'use strict';

var fs = require('fs'), path = require('path'), vm = require('vm');
var LIB = fs.readFileSync(path.join(__dirname, 'things18n.js'), 'utf8');

function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
function decode(s) {
  return s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}

function attrsOf(tagSource) {
  var out = {}, re = /([a-zA-Z_:][-\w:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g, m;
  tagSource = tagSource.replace(/^<[a-zA-Z][\w-]*/, '');
  while ((m = re.exec(tagSource))) out[m[1].toLowerCase()] = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : (m[4] !== undefined ? m[4] : ''));
  return out;
}

/* --------------------------------------------------------------- one page */

// Load a page the way a browser would: the real library, plus every dictionary the page loads.
function loadPage(file) {
  var notes = [], dir = path.dirname(file), name = path.basename(file);
  var html = fs.readFileSync(file, 'utf8');

  // settings, the way the browser would read them
  var libTag = (html.match(/<script\b[^>]*src=["'][^"']*things18n[^"']*\.js["'][^>]*>/i) || [''])[0];
  var libAttrs = libTag ? attrsOf(libTag) : {};
  var htmlLang = (html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i) || [])[1];
  var langList = (libAttrs['data-langs'] || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);

  // a fresh copy of the real library, with no DOM, that our dictionaries get loaded into
  var sandbox = { console: { log: function () {}, warn: function () {}, error: function () {}, group: function () {}, groupEnd: function () {} }, Intl: Intl, Promise: Promise };
  vm.runInNewContext(LIB, sandbox);
  var i18n = sandbox.things18n, ctx = vm.createContext(sandbox);
  i18n.init({ default: libAttrs['data-default'] || htmlLang || 'en', langs: langList, warn: false });

  function load(code, label) {
    try { vm.runInContext(code, ctx, { timeout: 2000 }); }
    catch (e) { notes.push(label + ': could not run to read its dictionary (' + e.message + ')'); }
  }

  // dictionaries: inline <script>s and <script src>s that call things18n.add(
  var scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi, m;
  while ((m = scriptRe.exec(html))) {
    var at = attrsOf('<script ' + m[1]);
    if (at.src && !/^(https?:)?\/\//.test(at.src)) {
      var p = path.join(dir, at.src.split(/[?#]/)[0]);
      var text = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
      if (/things18n\.add\s*\(/.test(text) && !/^\/\*! things18n/.test(text)) load(text, at.src);
    } else if (/things18n\.add\s*\(/.test(m[2])) load(m[2], name + ' (inline script)');
  }
  return { file: file, name: name, html: html, i18n: i18n, notes: notes };
}

function checkPage(file) {
  var page = loadPage(file), i18n = page.i18n, html = page.html, name = page.name, notes = page.notes, problems = [], m;
  var def = i18n.default, langs = i18n.langs;
  var others = langs.filter(function (l) { return l !== def; });
  function need(l, text, what) { if (!i18n.has(text, l)) problems.push(name + ': ' + what + ' has no ' + l + ' translation'); }

  // 1. dictionaries against each other: gaps and {param} mismatches (the library does the comparing)
  var dict = i18n.report(true).dictionary;
  Object.keys(dict.missing).forEach(function (l) {
    dict.missing[l].forEach(function (k) { problems.push('"' + k + '" is in another dictionary but missing in ' + l); });
  });
  dict.params.forEach(function (x) { problems.push('different {params} per language: ' + x); });

  // 2. markup: strip scripts, styles and comments first so their contents are not mistaken for tags
  var clean = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
  var tagRe = /<([a-zA-Z][\w-]*)\b[^>]*>/g, usedKeys = {}, blocks = {}, keyless = 0;
  while ((m = tagRe.exec(clean))) {
    var tag = m[1].toLowerCase(), a = attrsOf(m[0]), keys = [];
    if (a['data-lang']) blocks[a['data-lang']] = (blocks[a['data-lang']] || 0) + 1;
    if (a['data-i18n']) keys.push(a['data-i18n']);
    if (a['data-i18n-html']) keys.push(a['data-i18n-html']);
    if (a['data-i18n-attr']) a['data-i18n-attr'].split(';').forEach(function (pair) { var i = pair.indexOf(':'); if (i > 0) keys.push(pair.slice(i + 1).trim()); });
    keys.forEach(function (k) {
      usedKeys[k] = 1;
      others.forEach(function (l) { need(l, k, 'key "' + k + '" (used in <' + tag + '>)'); });
    });
    if ('data-t' in a) {
      var close = clean.indexOf('</' + m[1], tagRe.lastIndex), inner = close < 0 ? '' : clean.slice(tagRe.lastIndex, close);
      if (/</.test(inner)) { notes.push(name + ': <' + tag + ' data-t> contains other elements: things18n will skip it (use data-lang blocks or data-i18n-html)'); continue; }
      var text2 = norm(decode(inner));
      if (text2) { keyless++; others.forEach(function (l) { need(l, text2, '"' + text2 + '" (data-t)'); }); }
    }
    (a['data-t-attr'] || '').split(/[\s,;]+/).filter(Boolean).forEach(function (attr) {
      if (a[attr] === undefined) return;
      var t = norm(decode(a[attr]));
      keyless++;
      if (t) others.forEach(function (l) { need(l, t, '"' + t + '" (' + attr + ')'); });
    });
  }

  // 3. language blocks
  var bl = Object.keys(blocks), counts = bl.map(function (l) { return blocks[l]; });
  if (bl.length > 1 && Math.min.apply(null, counts) !== Math.max.apply(null, counts)) {
    problems.push(name + ': uneven data-lang blocks (' + bl.map(function (l) { return l + ': ' + blocks[l]; }).join(', ') + ')');
  }

  var info = path.relative(process.cwd(), file) + ': ' + langs.length + ' language' + (langs.length === 1 ? '' : 's') + ' (' + langs.join(', ') + '), ' +
    Object.keys(usedKeys).length + ' keys used in markup' + (keyless ? ', ' + keyless + ' key-less texts' : '') +
    (bl.length ? ', blocks ' + bl.map(function (l) { return l + ':' + blocks[l]; }).join(' ') : '');
  return { file: file, info: info, problems: problems, notes: notes };
}

/* -------------------------------------------------------------------- CLI */

function expand(arg) {
  if (fs.statSync(arg).isDirectory()) return fs.readdirSync(arg).filter(function (f) { return /\.html?$/i.test(f); }).map(function (f) { return path.join(arg, f); });
  return [arg];
}

function check(targets) {
  var results = [];
  (targets && targets.length ? targets : ['.']).forEach(function (t) { expand(t).forEach(function (f) { results.push(checkPage(f)); }); });
  return results;
}

if (require.main === module) {
  var results = check(process.argv.slice(2)), bad = 0;
  if (!results.length) { console.log('no .html files found'); process.exit(0); }
  results.forEach(function (r) {
    console.log(r.info);
    r.notes.forEach(function (n) { console.log('  note: ' + n); });
    r.problems.forEach(function (p) { console.log('  PROBLEM: ' + p); });
    bad += r.problems.length;
  });
  console.log(bad ? '\n' + bad + ' problem(s)' : '\nthings18n check: all good');
  process.exit(bad ? 1 : 0);
}

module.exports = { check: check, checkPage: checkPage, loadPage: loadPage };
