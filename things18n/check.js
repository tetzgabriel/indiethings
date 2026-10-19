#!/usr/bin/env node
/* things18n check — finds missing translations before your visitors do. Zero dependencies, needs Node 14+.

     node check.js                 checks every .html in the current folder
     node check.js index.html      checks one page (and the scripts it loads)
     node check.js site/ other/    several folders or pages

   For each page it reads the dictionaries (every <script> that calls things18n.add(), inline or src=)
   and the markup, and reports problems. It exits with code 1 if it found any, so it works in CI too.

     - keys used in the HTML (data-i18n, data-i18n-html, data-i18n-attr) that a language doesn't have
     - key-less texts (data-t, data-t-attr) with no translation in a language
     - keys that exist in one language's dictionary but not in another's, or with different {params}
     - uneven data-lang blocks (e.g. 14 English blocks but 13 Portuguese ones)

   It reads HTML with regular expressions, so it is a safety net and not a validator: unusual markup
   (a data-t element holding other elements, keys built in JavaScript) is out of its reach. */
'use strict';

var fs = require('fs'), path = require('path'), vm = require('vm');

/* ------------------------------------------------------------ small helpers */

function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
function decode(s) {
  return s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}
function lc(s) { return String(s).toLowerCase(); }

function flatten(o, prefix, out) {
  Object.keys(o).forEach(function (k) {
    var v = o[k], key = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object' && !('other' in v)) flatten(v, key, out);
    else out[key] = v;
  });
  return out;
}

function paramsOf(v) {
  var strs = typeof v === 'string' ? [v] : Object.keys(v).map(function (k) { return String(v[k]); });
  var set = {};
  strs.forEach(function (s) {
    (s.replace(/\{\{|\}\}/g, '').match(/\{[A-Za-z0-9_.$-]+\}/g) || []).forEach(function (m) { set[m] = 1; });
  });
  return Object.keys(set).sort().join(', ');
}

// Run a script that calls things18n.add(...) against a stub, and collect what it registers.
function collect(code, dicts, label, notes) {
  var stub = {};
  stub.add = function (lang, messages) {
    dicts[lang] = dicts[lang] || {};
    flatten(messages || {}, '', dicts[lang]);
    return stub;
  };
  try { vm.runInNewContext(code, { things18n: stub, console: { log: function () {}, warn: function () {} } }, { timeout: 2000 }); }
  catch (e) { notes.push(label + ': could not run to read its dictionary (' + e.message + ')'); }
}

function attrsOf(tagSource) {
  var out = {}, re = /([a-zA-Z_:][-\w:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g, m;
  tagSource = tagSource.replace(/^<[a-zA-Z][\w-]*/, '');
  while ((m = re.exec(tagSource))) out[lc(m[1])] = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : (m[4] !== undefined ? m[4] : ''));
  return out;
}

/* --------------------------------------------------------------- one page */

function checkPage(file) {
  var problems = [], notes = [], dir = path.dirname(file);
  var html = fs.readFileSync(file, 'utf8');
  var dicts = {};

  // dictionaries: inline <script>s and <script src>s that call things18n.add(
  var scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi, m;
  while ((m = scriptRe.exec(html))) {
    var at = attrsOf('<script ' + m[1]), code = m[2];
    if (at.src && !/^(https?:)?\/\//.test(at.src)) {
      var p = path.join(dir, at.src.split(/[?#]/)[0]);
      if (fs.existsSync(p)) {
        var text = fs.readFileSync(p, 'utf8');
        if (/things18n\.add\s*\(/.test(text) && !/^\/\*! things18n/.test(text)) collect(text, dicts, at.src, notes);
      }
    } else if (/things18n\.add\s*\(/.test(code)) collect(code, dicts, path.basename(file) + ' (inline script)', notes);
  }

  // settings
  var libTag = (html.match(/<script\b[^>]*src=["'][^"']*things18n[^"']*\.js["'][^>]*>/i) || [''])[0];
  var libAttrs = libTag ? attrsOf(libTag) : {};
  var htmlLang = ((html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i) || [])[1]) || null;
  var def = libAttrs['data-default'] || htmlLang || 'en';
  var langs = Object.keys(dicts);
  (libAttrs['data-langs'] || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (l) {
    if (!langs.some(function (x) { return lc(x) === lc(l); })) langs.push(l);
  });
  if (!langs.some(function (x) { return lc(x) === lc(def); })) langs.push(def);
  var others = langs.filter(function (l) { return lc(l) !== lc(def); });

  // normalise dictionary keys the same way key-less texts are matched
  var normDict = {};
  Object.keys(dicts).forEach(function (l) {
    normDict[l] = {};
    Object.keys(dicts[l]).forEach(function (k) { normDict[l][norm(k)] = dicts[l][k]; });
  });
  function has(lang, key) { return !!normDict[lang] && Object.prototype.hasOwnProperty.call(normDict[lang], norm(key)); }

  // 1. parity between dictionaries
  var all = {};
  Object.keys(dicts).forEach(function (l) { Object.keys(dicts[l]).forEach(function (k) { all[norm(k)] = 1; }); });
  Object.keys(all).forEach(function (k) {
    others.forEach(function (l) {
      if (!has(l, k)) problems.push('"' + k + '" is in another dictionary but missing in ' + l);
    });
    var seen = {};
    Object.keys(dicts).forEach(function (l) { if (has(l, k)) seen[l] = paramsOf(normDict[l][norm(k)]); });
    var distinct = Object.keys(seen).map(function (l) { return seen[l]; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    if (distinct.length > 1) problems.push('"' + k + '" uses different {params} per language: ' + Object.keys(seen).map(function (l) { return l + ' [' + seen[l] + ']'; }).join(' vs '));
    Object.keys(dicts).forEach(function (l) {
      var v = has(l, k) ? normDict[l][norm(k)] : null;
      if (v && typeof v === 'object' && !('other' in v)) problems.push('plural "' + k + '" in ' + l + ' needs an "other" form');
    });
  });

  // 2. markup: strip scripts, styles and comments first so their contents are not mistaken for tags
  var clean = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
  var tagRe = /<([a-zA-Z][\w-]*)\b[^>]*>/g, usedKeys = {}, blocks = {}, keyless = 0;
  while ((m = tagRe.exec(clean))) {
    var tag = m[0], name = lc(m[1]), a = attrsOf(tag), keys = [];
    if (a['data-lang']) blocks[a['data-lang']] = (blocks[a['data-lang']] || 0) + 1;
    if (a['data-i18n']) keys.push(a['data-i18n']);
    if (a['data-i18n-html']) keys.push(a['data-i18n-html']);
    if (a['data-i18n-attr']) a['data-i18n-attr'].split(';').forEach(function (pair) { var i = pair.indexOf(':'); if (i > 0) keys.push(pair.slice(i + 1).trim()); });
    keys.forEach(function (k) {
      usedKeys[k] = 1;
      others.forEach(function (l) { if (!has(l, k)) problems.push(path.basename(file) + ': key "' + k + '" (used in <' + name + '>) is missing in ' + l); });
    });
    if ('data-t' in a) {
      var close = clean.indexOf('</' + m[1], tagRe.lastIndex), inner = close < 0 ? '' : clean.slice(tagRe.lastIndex, close);
      if (/</.test(inner)) { notes.push(path.basename(file) + ': <' + name + ' data-t> contains other elements: things18n will skip it (use data-lang blocks or data-i18n-html)'); continue; }
      var text = norm(decode(inner));
      if (text) {
        keyless++;
        others.forEach(function (l) { if (!has(l, text)) problems.push(path.basename(file) + ': "' + text + '" (data-t) has no ' + l + ' translation'); });
      }
    }
    if (a['data-t-attr']) {
      a['data-t-attr'].split(/[\s,;]+/).filter(Boolean).forEach(function (attr) {
        if (a[attr] === undefined) return;
        var t = norm(decode(a[attr]));
        keyless++;
        if (t) others.forEach(function (l) { if (!has(l, t)) problems.push(path.basename(file) + ': "' + t + '" (' + attr + ') has no ' + l + ' translation'); });
      });
    }
  }

  // 3. language blocks
  var bl = Object.keys(blocks);
  if (bl.length > 1) {
    var counts = bl.map(function (l) { return blocks[l]; });
    if (Math.min.apply(null, counts) !== Math.max.apply(null, counts)) {
      problems.push(path.basename(file) + ': uneven data-lang blocks (' + bl.map(function (l) { return l + ': ' + blocks[l]; }).join(', ') + ')');
    }
  }

  var info = path.relative(process.cwd(), file) + ': ' + langs.length + ' language' + (langs.length === 1 ? '' : 's') + ' (' + langs.join(', ') + '), ' +
    Object.keys(all).length + ' dictionary keys, ' + Object.keys(usedKeys).length + ' keys used in markup' +
    (keyless ? ', ' + keyless + ' key-less texts' : '') + (bl.length ? ', blocks ' + bl.map(function (l) { return l + ':' + blocks[l]; }).join(' ') : '');
  return { file: file, info: info, problems: problems, notes: notes };
}

/* -------------------------------------------------------------------- CLI */

function expand(arg) {
  var st = fs.statSync(arg);
  if (st.isDirectory()) return fs.readdirSync(arg).filter(function (f) { return /\.html?$/i.test(f); }).map(function (f) { return path.join(arg, f); });
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

module.exports = { check: check, checkPage: checkPage };
