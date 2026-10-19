// Shared by the test files. Everything runs in the browser: no Node, no build.
// The tests drive real pages inside iframes, so serve the folder that holds BOTH repos
// (indiethings and me_associe), the way the live site lays them out:  /indiethings/ and /me_associe/.

var HUB = location.pathname.replace(/\/tests\/.*$/, '');   // "/indiethings", wherever the hub is mounted
var GAME = '/me_associe';                                   // the game lives in its own repo, one level up

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

// Open `url` in a hidden iframe and wait until it has loaded and settled. opts.sandbox = '' runs it with scripts off.
function frame(url, opts) {
  opts = opts || {};
  return new Promise(function (resolve) {
    var f = document.createElement('iframe');
    f.style.cssText = 'width:900px;height:900px';
    if (opts.sandbox !== undefined) f.setAttribute('sandbox', opts.sandbox);
    f.onload = function () { setTimeout(function () { resolve(f); }, opts.settle || 350); };
    f.src = url;
    document.getElementById('frames').appendChild(f);
  });
}

// data-lang values of the blocks that are actually visible in a frame
function shownBlocks(f) {
  return [].filter.call(f.contentDocument.querySelectorAll('[data-lang]'), function (e) {
    return f.contentWindow.getComputedStyle(e).display !== 'none';
  }).map(function (e) { return e.getAttribute('data-lang'); });
}

QUnit.config.testTimeout = 30000;
QUnit.testStart(function () { try { localStorage.clear(); } catch (e) { /* storage blocked */ } });
QUnit.testDone(function () { document.getElementById('frames').textContent = ''; });
