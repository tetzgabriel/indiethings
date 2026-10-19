// Run: node tools/sync-things18n.js          copy things18n/things18n.js into every folder that vendors it
//      node tools/sync-things18n.js --check  only report folders that are out of date (exit 1)
var fs = require('fs'), path = require('path');
var root = path.join(__dirname, '..');
var source = path.join(root, 'things18n', 'things18n.js');
var copies = [path.join(root, 'things', 'me_associe', 'things18n.js')];   // add other vendored copies here
var want = fs.readFileSync(source, 'utf8'), stale = 0;
copies.forEach(function (c) {
  var have = fs.existsSync(c) ? fs.readFileSync(c, 'utf8') : null;
  if (have === want) return console.log('ok       ' + path.relative(root, c));
  if (process.argv.indexOf('--check') >= 0) { stale++; return console.log('STALE    ' + path.relative(root, c)); }
  fs.writeFileSync(c, want); console.log('updated  ' + path.relative(root, c));
});
process.exit(stale ? 1 : 0);
