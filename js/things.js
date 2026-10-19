// The registry. Every "thing" in the hub is one entry in this list.
//
// To add yours:
//   1. make a folder in /things/your-thing/ with an index.html in it
//      (or keep it in its own repo and point `href` at wherever it is published)
//   2. add an entry below (desc and note can be a plain string, or one string per language)
//   3. that's it. no build step. no framework. go touch grass.
//
// (it's a .js file instead of .json so the site works when you just
//  double-click index.html. no server needed. we like that.)

window.THINGS = [
  {
    href: "/me_associe/",             // lives in its own repo (tetzgabriel/me_associe); the hub only links to it
    name: "MeAsocie",
    kind: "game",
    desc: {
      "en": "Word solitaire. Match words to their categories: no score, no move limit. Plays in Portuguese or English (and there's a medical mode in Portuguese).",
      "pt-BR": "Paciência de palavras. Ligue palavras às suas categorias, sem pontuação e sem limite de jogadas. Joga em português ou inglês (e tem modo médico em português).",
    },
    note: {
      "en": "installs on your phone and works offline.",
      "pt-BR": "instala no celular e funciona offline.",
    },
  },
  {
    href: "things18n/",
    name: "things18n",
    kind: "tool",
    desc: {
      "en": "A tiny translation helper for plain HTML, CSS and JS. No build step, no dependencies. This very page uses it.",
      "pt-BR": "Um ajudante minúsculo de tradução para HTML, CSS e JS puros. Sem build, sem dependências. Esta página mesma usa ele.",
    },
    note: {
      "en": "docs included, and they're bilingual too.",
      "pt-BR": "com documentação, que também é bilíngue.",
    },
  },
];
