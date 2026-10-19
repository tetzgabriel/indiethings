# indiethings

A notebook-style hub of small, free, independent things for the web.
Plain HTML, CSS and JS. No build step, no dependencies, no tracking.
Live at https://meoriente.com.br/indiethings/ (English and Portuguese).

Open `index.html` in a browser (or `python3 -m http.server`). Deploy anywhere that serves static files.

## Add a thing

1. Create `things/your-thing/index.html` (link `../../css/notebook.css` for the paper look, or don't).
2. Add an entry to `js/things.js` (`desc` and `note` can be a string or `{ en: '…', 'pt-BR': '…' }`).
3. Done.

## things18n

`things18n/` is a tiny translation helper used by the hub and by MeAsocie. Plain browser JavaScript: load it straight from `https://meoriente.com.br/indiethings/things18n/things18n.js` (or via jsDelivr from this repo, or copy the file). No Node needed to use it. Docs (bilingual, with a live demo):
https://meoriente.com.br/indiethings/things18n/

The library exists once, in `things18n/`. MeAsocie lives in its own repo (https://github.com/tetzgabriel/me_associe), is published at `/me_associe/` on the same site, and loads the library from `/indiethings/things18n/things18n.js`. The hub only links to it.

To find untranslated text: add `?i18n=debug` to a page (works in any browser). `node things18n/check.js` does the same from a terminal, optionally.

## Checks (for developing this repo)

These are for working on the repo, not for using the package. They need Node 22+, and Chrome for the browser tests. The checks that involve MeAsocie expect its repo checked out next to this one as `../me_associe` (or set `ME_ASSOCIE=/path/to/it`) and skip themselves if it isn't there. Run from the repo root:

```
node things18n/test/logic.test.js   # library logic: plurals, fallbacks, language detection
node tools/check-i18n.js            # runs things18n/check.js on each page + keys used from JS and registry kinds
node tools/validate-banks.js        # MeAsocie word banks follow the rules in their headers
node tools/e2e/run.js               # real browser: library DOM behaviour, the game in both languages, docs, hub
```
