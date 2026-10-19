<h1 align="center">🌍 things18n</h1>

<p align="center">
  <em>translate a page with one script tag<br>no build, no dependencies, no Node</em>
</p>

<p align="center">
  <a href="https://meoriente.com.br/indiethings/things18n/"><b>full docs + live demo</b></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/tetzgabriel/indiethings">indiethings</a>
  &nbsp;·&nbsp;
  <a href="README.pt-BR.md">🇧🇷 português</a>
</p>

Make a page speak two languages:

```html
<html lang="en">
<head>
  <script src="https://meoriente.com.br/indiethings/things18n/things18n.js" data-switcher></script>
  <script>
    things18n.add('pt-BR', { 'Hello, world': 'Olá, mundo' });
  </script>
</head>
<body>
  <h1 data-t>Hello, world</h1>
</body>
```

That's it: a language switcher appears, visitors get their browser's language, and the choice is remembered.

## What you get

- **The text is the key.** `data-t` needs no invented names. Prefer keys? `data-i18n` does that too.
- **Zero config.** The default language is your `<html lang>`; the others are whatever you `add()`.
- **Plurals done right**, including Portuguese's "0 is singular" gotcha. Params, nested keys, fallbacks.
- **Long text?** Write one block per language: `<div data-lang="en">…</div>`.
- **Find what's missing** by adding `?i18n=debug` to any page: red outlines, a counter, a console report.
- **Works with JavaScript off** (it shows one language, not all of them), and handles right-to-left languages.

## Files

| file | what |
|---|---|
| [`things18n.js`](things18n.js) | the library (browser only) |
| [`things18n.css`](things18n.css) | optional: show one language, not all, with JS off |
| [`index.html`](index.html) | the docs, bilingual, with a live demo |

## Install

Nothing to install. Link the script, from here or from your own copy:

```html
<script src="https://meoriente.com.br/indiethings/things18n/things18n.js"></script>
```

Everything else (markup, switchers, messages, the API, language detection, adding a language, gotchas) is in the
**[docs](https://meoriente.com.br/indiethings/things18n/)**, in English and Portuguese.

## Tests

They live with the rest of the notebook, in [`../tests/`](../tests/) (QUnit, runs in the browser).

---

<p align="center"><sub>part of <a href="../README.md">indiethings</a> · keep it weird ✌︎</sub></p>
