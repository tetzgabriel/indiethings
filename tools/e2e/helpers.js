// Shared by the e2e pages: ok(cond, message), sleep(ms), $(id), finish().
// run.js waits for #out to say "ALL PASSED" or "FAILED".
var out = [], failed = 0;
function ok(c, m) { out.push((c ? 'PASS ' : 'FAIL ') + m); if (!c) failed++; }
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function $(id) { return document.getElementById(id); }
function finish() { $('out').textContent = out.join('\n') + '\n' + (failed ? failed + ' FAILED' : 'ALL PASSED'); }
