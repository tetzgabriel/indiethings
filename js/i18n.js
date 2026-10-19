// Hub strings that JavaScript builds (the list of things). Everything else is plain markup in index.html:
// English is written right there, and Portuguese lives in <div data-lang="pt-BR"> blocks and in the
// pt-BR entries below. A language only needs a dictionary entry where the HTML doesn't already say it.

things18n.add('en', {
  things: {
    count: { '=0': 'nothing here yet. you could be first.', one: '{count} thing so far. the list grows when people add stuff.', other: '{count} things so far. the list grows when people add stuff.' }
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
