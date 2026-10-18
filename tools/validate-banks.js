// Run: node tools/validate-banks.js
// Checks the MeAsocie word banks against the rules written at the top of each bank file.
var path = require('path');
var dir = path.join(__dirname, '..', 'things', 'me_associe');
var problems = [], checked = 0;

function segLen(w) { return Math.max.apply(null, w.split(/[\s-]+/).map(function (s) { return s.length; })); }
function bad(msg) { problems.push(msg); }

function checkCats(label, cats, opts) {
  var seen = {}, names = cats.map(function (c) { return c.nome.toLowerCase(); });
  cats.forEach(function (c) {
    if (!c.nome) bad(label + ': category without name');
    if (c.palavras.length !== opts.words) bad(label + ' / ' + c.nome + ': ' + c.palavras.length + ' words, expected ' + opts.words);
    c.palavras.forEach(function (w) {
      checked++;
      var k = w.toLowerCase();
      if (seen[k]) bad(label + ': "' + w + '" repeated (' + seen[k] + ' and ' + c.nome + ')');
      seen[k] = c.nome;
      if (names.indexOf(k) >= 0) bad(label + ': word "' + w + '" equals a category name');
      if (segLen(w) > 11) bad(label + ' / ' + c.nome + ': "' + w + '" has a segment over 11 letters');
    });
  });
}

var pt = require(path.join(dir, 'words.js'));
var en = require(path.join(dir, 'words.en.js'));
var med = require(path.join(dir, 'words-med.js'));

checkCats('words.js', pt, { words: 12 });
checkCats('words.en.js', en, { words: 12 });
if (en.length < 7) bad('words.en.js: needs at least 7 categories');
// a category name must be unique inside its bank
[['words.js', pt], ['words.en.js', en]].forEach(function (p) {
  var n = {}; p[1].forEach(function (c) { if (n[c.nome]) bad(p[0] + ': duplicate category ' + c.nome); n[c.nome] = 1; });
});
med.forEach(function (a) { checkCats('words-med.js / ' + a.area, a.cats, { words: 12 }); if (a.cats.length < 7) bad('words-med.js / ' + a.area + ': needs 7+ categories'); });

if (problems.length) { console.error(problems.join('\n')); console.error('\n' + problems.length + ' problem(s)'); process.exit(1); }
console.log('banks OK: ' + pt.length + ' pt categories, ' + en.length + ' en categories, ' + med.length + ' medical areas, ' + checked + ' words checked');
