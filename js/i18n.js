// Hub strings. English is also written in index.html (so the page works with JS off),
// but JS-built bits (the list of things) need it here too.
// Long prose lives in index.html as <div data-lang="en"> / <div data-lang="pt-BR"> blocks.

things18n.add('en', {
  meta: {
    title: 'indiethings — a notebook of small free stuff',
    description: 'A hub of small, independent things for the web. Games, tools, toys. No ads, no tracking, no accounts. Just stuff people made.'
  },
  lang: { label: 'Language' },
  cover: { scroll: '(flip the page — just scroll ↓)' },
  arrow: { why: 'ok, so why?', rules: 'the ground rules', things: 'the good stuff', yours: 'your turn!', last: 'almost done' },
  things: {
    count: { '=0': 'nothing here yet. you could be first.', one: '{count} thing so far. the list grows when people add stuff.', other: '{count} things so far. the list grows when people add stuff.' },
    empty: 'your thing could go here. (see next page ↓)'
  },
  kind: { game: 'game', tool: 'tool' }
}, { label: 'English' });

things18n.add('pt-BR', {
  meta: {
    title: 'indiethings — um caderno de coisas pequenas e grátis',
    description: 'Um lugar para coisas pequenas e independentes da web. Jogos, ferramentas, brinquedos. Sem anúncios, sem rastreamento, sem contas. Só coisas que gente fez.'
  },
  lang: { label: 'Idioma' },
  cover: { scroll: '(vire a página — é só rolar ↓)' },
  arrow: { why: 'ok, mas por quê?', rules: 'as regras do jogo', things: 'as coisas boas', yours: 'sua vez!', last: 'quase lá' },
  things: {
    count: { '=0': 'nada por aqui ainda. você pode ser o primeiro.', one: '{count} coisa por enquanto. a lista cresce quando gente adiciona coisas.', other: '{count} coisas por enquanto. a lista cresce quando gente adiciona coisas.' },
    empty: 'a sua coisa pode ficar aqui. (veja a próxima página ↓)'
  },
  kind: { game: 'jogo', tool: 'ferramenta' }
}, { label: 'Português' });
