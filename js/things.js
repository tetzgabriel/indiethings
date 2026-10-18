// The registry. Every "thing" in the hub is one entry in this list.
//
// To add yours:
//   1. make a folder in /things/your-thing/ with an index.html in it
//   2. add an entry below
//   3. that's it. no build step. no framework. go touch grass.
//
// (it's a .js file instead of .json so the site works when you just
//  double-click index.html. no server needed. we like that.)

window.THINGS = [
  {
    slug: "me_associe",
    name: "MeAsocie",
    kind: "game",
    desc: "Paciência de palavras em português. Ligue palavras às suas categorias, sem pontuação e sem limite de jogadas. Tem até um modo médico.",
    note: "instala no celular e funciona offline. (it's in portuguese, sorry gringos)",
  },
];
