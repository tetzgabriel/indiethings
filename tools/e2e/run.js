// Run: node tools/e2e/run.js [page ...]     (default: every page listed below)
// Serves the repo on a random port, opens each test page in headless Chrome over the DevTools protocol,
// waits until the page writes "ALL PASSED" / "FAILED" into #out, and prints it. Needs Chrome + Node 22+.
var http = require('http'), fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
var root = path.join(__dirname, '..', '..');
var pages = process.argv.slice(2);
if (!pages.length) pages = ['/tools/e2e/dom.html', '/tools/e2e/game.html', '/tools/e2e/docs.html'];
var CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
var TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

var server = http.createServer(function (req, res) {
  var p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  var file = path.join(root, p);
  if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404); return res.end('nope'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

server.listen(0, '127.0.0.1', async function () {
  var port = server.address().port, dbg = 9300 + Math.floor(Math.random() * 500);
  var profile = fs.mkdtempSync(path.join(os.tmpdir(), 'things18n-e2e-'));
  var chrome = cp.spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=' + dbg, '--user-data-dir=' + profile, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  var failed = 0;
  try {
    var targets;
    for (var i = 0; i < 50; i++) {
      try { targets = await (await fetch('http://127.0.0.1:' + dbg + '/json/list')).json(); if (targets.length) break; } catch (e) { /* not up yet */ }
      await sleep(200);
    }
    var tab = targets.filter(function (t) { return t.type === 'page'; })[0];
    var ws = new WebSocket(tab.webSocketDebuggerUrl), id = 0, waiting = {};
    await new Promise(function (r) { ws.onopen = r; });
    ws.onmessage = function (m) { var d = JSON.parse(m.data); if (d.id && waiting[d.id]) { waiting[d.id](d); delete waiting[d.id]; } };
    var send = function (method, params) { return new Promise(function (r) { var n = ++id; waiting[n] = r; ws.send(JSON.stringify({ id: n, method: method, params: params || {} })); }); };
    for (var pg of pages) {
      await send('Page.navigate', { url: 'http://127.0.0.1:' + port + pg });
      var text = '';
      for (var k = 0; k < 150; k++) {
        await sleep(200);
        var r = await send('Runtime.evaluate', { expression: "(document.getElementById('out')||{}).textContent||''", returnByValue: true });
        text = (r.result && r.result.result && r.result.result.value) || '';
        if (/ALL PASSED|FAILED/.test(text)) break;
      }
      console.log('\n== ' + pg + '\n' + (text || '(no result: the page never reported)'));
      if (!/ALL PASSED/.test(text)) failed++;
    }
    ws.close();
  } finally { chrome.kill(); server.close(); try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {} }
  process.exit(failed ? 1 : 0);
});
