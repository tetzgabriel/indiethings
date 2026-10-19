// Strings for the docs page itself. English is written in index.html, so the en entries here are only the
// ones this page's script builds (the live demo). The prose is data-lang blocks, the pattern the docs recommend.

things18n.add('en', {
  demo: {
    cards: { '=0': 'You have no cards.', one: 'You have {count} card.', other: 'You have {count} cards.' },
    current: 'current language: {lang}',
    list: 'languages available: {langs}',
    date: 'today, formatted for this language: {date}',
    number: 'a number, formatted for this language: {n}'
  }
}, { label: 'English' });

things18n.add('pt-BR', {
  'This sentence has no key: its own text is the key.': 'Esta frase não tem chave: o próprio texto é a chave.',
  meta: {
    title: 'things18n — traduções para HTML, CSS e JS puros',
    description: 'Um ajudante minúsculo de tradução, sem build e sem dependências. Coloque atributos, coloque um dicionário, pronto.'
  },
  lang: { label: 'Idioma' },
  nav: { back: '← voltar ao caderno' },
  demo: {
    hello: 'Olá, {name}!',
    placeholder: 'escreva alguma coisa…',
    add: 'adicionar uma carta',
    reset: 'zerar',
    cards: { '=0': 'Você não tem cartas.', one: 'Você tem {count} carta.', other: 'Você tem {count} cartas.' },
    current: 'idioma atual: {lang}',
    list: 'idiomas disponíveis: {langs}',
    date: 'hoje, formatado para este idioma: {date}',
    number: 'um número, formatado para este idioma: {n}'
  }
}, { label: 'Português' });
