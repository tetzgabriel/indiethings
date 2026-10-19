<h1 align="center">✏️ indiethings</h1>

<p align="center">
  <em>a notebook of small, free, weird stuff<br>made by people, for people</em>
</p>

<p align="center">
  <a href="https://meoriente.com.br/indiethings/"><b>open the notebook</b></a>
  &nbsp;·&nbsp;
  <a href="https://meoriente.com.br/indiethings/things18n/">things18n docs</a>
  &nbsp;·&nbsp;
  <a href="https://meoriente.com.br/me_associe/">play MeAsocie</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/tetzgabriel/indieshelf">get indieshelf</a>
  &nbsp;·&nbsp;
  <a href="README.pt-BR.md">🇧🇷 português</a>
</p>

```
 ┌───────────────────────────────────────────────────────────┐
 │ ◦  │                                                      │
 │ ◦  │   no ads.                                            │
 │ ◦  │   no tracking.                                       │
 │ ◦  │   no "sign up to continue".                          │
 │ ◦  │                                                      │
 │ ◦  │   ~~~~~~~~~~~~~                                      │
 │ ◦  │   just things.                                       │
 │ ◦  │                                                      │
 └───────────────────────────────────────────────────────────┘
```

Remember when the web was **weird**? When somebody would spend a weekend making a little game, or a silly
calculator, and then just… *put it up*? Free. For anyone.

This is a tiny, stubborn **"no."** to the funnel. It's a hub for small independent things, written like a
notebook (ruled paper, blue ballpoint, red-pen arrows pointing the way), and it follows seven rules:

- [x] **Free.** Actually free. Like a library book: you walk in, you use it, you walk out.
- [x] **No ads, no trackers, nothing creepy.** If a thing remembers something, it stays in *your* browser.
- [x] **No accounts.** You're not a "user". You're a person who wanted to play solitaire.
- [x] **Plain HTML, CSS and JS.** ~~webpack, npm install, 900MB of node_modules~~ View source and it makes sense.
- [x] **One thing, done well** (or at least done charmingly). Small is a feature.
- [x] **Works offline-ish, loads fast, respects your battery.**
- [x] **Be weird. Be kind.**

## What's inside

| | what | where |
|---|---|---|
| 📓 | **The notebook**: the hub, in English and Portuguese, with a wandering layout and hand-drawn arrows | [`index.html`](index.html) |
| 🌍 | **things18n**: a translation package for plain HTML/CSS/JS. One script tag, no build, no dependencies | [`things18n/`](things18n/) |
| 🃏 | **MeAsocie**: word solitaire in Portuguese and English, with a medical mode. Lives in [its own repo](https://github.com/tetzgabriel/me_associe); the notebook just links to it | [`/me_associe/`](https://meoriente.com.br/me_associe/) |
| 🗂️ | **indieshelf**: a drag-and-drop shelf for the Mac menu bar. Shake while dragging files to open it. A Mac app, so it lives in [its own repo](https://github.com/tetzgabriel/indieshelf) | [download](https://github.com/tetzgabriel/indieshelf/releases/latest) |

## things18n

The notebook speaks English and Portuguese thanks to **things18n**, a tiny translation package: one script tag,
no build, no dependencies. It has its own README: **[things18n/README.md](things18n/README.md)**
(and [live docs](https://meoriente.com.br/indiethings/things18n/)).

## Tests: in the browser, no Node

The tests are plain HTML with [QUnit](https://qunitjs.com/) loaded from a CDN. They drive the real pages
(the notebook, the docs, the game) in both languages, and check the translations and word banks for gaps.

Serve the folder that holds **both** repos (`indiethings` and `me_associe`) with any static server, so the paths
match the live site, and open:

```
/indiethings/tests/
```

Or skip the setup: it runs live at **https://meoriente.com.br/indiethings/tests/**.
Tick **remote** in the toolbar to also test loading the library from GitHub Pages and jsDelivr.

## How it's laid out

```
indiethings/
├── index.html           the notebook (English + Portuguese)
├── css/notebook.css     paper, ink, margin line, arrows
├── js/
│   ├── things.js        the registry: one entry per thing
│   ├── book.js          draws the list, re-draws when the language changes
│   └── i18n.js          the few strings JavaScript builds
├── things18n/           the translation package
│   ├── things18n.js     the library (browser only)
│   ├── things18n.css    optional: one language, not all, with JS off
│   ├── README.md        its own readme (+ README.pt-BR.md)
│   └── index.html       the docs, bilingual, with a live demo
└── tests/               QUnit, runs in the browser
```

Published with GitHub Pages straight from `main`, with no build step.

## Add your thing

1. Make a folder, `things/your-thing/index.html`, and put whatever you want in it. Link
   `css/notebook.css` for the paper look, or don't. (Or keep it in its own repo and point `href` at it.)
2. Add one entry to [`js/things.js`](js/things.js): name, kind, a one-line description, maybe a snarky note.
3. Send it. If it follows the rules, it goes in the notebook, with your name on it, in pen.

---

<p align="center"><sub>keep it weird ✌︎ — the indiethings crew</sub></p>
