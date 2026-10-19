// Needs internet, so it only runs when you tick "remote" in the QUnit toolbar (or add ?remote to the address).
// Proves the "no download, no Node" install: the library loaded straight from GitHub Pages and from jsDelivr.

QUnit.config.urlConfig.push({ id: 'remote', label: 'remote', tooltip: 'Also run the tests that need internet (library loaded from GitHub Pages and jsDelivr)' });

QUnit.module('remote import');

(QUnit.urlParams.remote ? QUnit.test : QUnit.skip)('the library works when loaded from meoriente.com.br and jsDelivr', async function (assert) {
  var f = await frame('fixtures/remote.html', { settle: 600 }), w = f.contentWindow, d = f.contentDocument;
  assert.ok(w.things18n && /^\d+\.\d+\.\d+$/.test(w.things18n.version), 'loaded from meoriente.com.br, version ' + (w.things18n && w.things18n.version));
  assert.ok(d.querySelector('.things18n-switcher'), 'data-switcher works from the remote copy');
  w.things18n.setLang('en'); await sleep(60);
  assert.strictEqual(d.getElementById('h').textContent, 'Hello, world', 'key-less translation works');
  assert.strictEqual(typeof w.things18n.report(true).dictionary, 'object', 'in-browser debug report is there');
  var js = await (await fetch('https://cdn.jsdelivr.net/gh/tetzgabriel/indiethings@main/things18n/things18n.js')).text();
  assert.ok(/things18n 1\.\d+\.\d+/.test(js), 'jsDelivr serves the file from GitHub with CORS');
  var css = await (await fetch('https://meoriente.com.br/indiethings/things18n/things18n.css')).text();
  assert.ok(/html:lang\(pt\)/.test(css), 'things18n.css is reachable cross-origin');
});
