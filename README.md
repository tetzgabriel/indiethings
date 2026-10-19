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

`things18n/` is a tiny translation helper used by the hub and by MeAsocie. Docs (bilingual, with a live demo):
https://meoriente.com.br/indiethings/things18n/

MeAsocie keeps its own copy of `things18n.js` so its folder stays self-contained and works offline.
After changing the library, run `node tools/sync-things18n.js`.

To find untranslated text in any project: `node things18n/check.js` (or add `?i18n=debug` to a page).

## Checks

Needs Node 22+ (and Chrome for the browser tests). Run from the repo root:

```
node things18n/test/logic.test.js   # library logic: plurals, fallbacks, language detection
node tools/check-i18n.js            # runs things18n/check.js on each page + JS key usage, registry kinds, vendored copy in sync
node tools/sync-things18n.js        # copy the library into folders that vendor it (--check to only report)
node tools/validate-banks.js        # MeAsocie word banks follow the rules in their headers
node tools/e2e/run.js               # real browser: library DOM behaviour, the game in both languages, docs, hub
```
