<h1 align="center">✏️ indiethings</h1>

<p align="center">
  <em>um caderno de coisas pequenas, grátis e esquisitas<br>feitas por gente, pra gente</em>
</p>

<p align="center">
  <a href="https://meoriente.com.br/indiethings/"><b>abrir o caderno</b></a>
  &nbsp;·&nbsp;
  <a href="https://meoriente.com.br/indiethings/things18n/">documentação do things18n</a>
  &nbsp;·&nbsp;
  <a href="https://meoriente.com.br/me_associe/">jogar MeAsocie</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/tetzgabriel/indieshelf">baixar o indieshelf</a>
  &nbsp;·&nbsp;
  <a href="README.md">🇬🇧 english</a>
</p>

```
 ┌───────────────────────────────────────────────────────────┐
 │ ◦  │                                                      │
 │ ◦  │   sem anúncio.                                       │
 │ ◦  │   sem rastreador.                                    │
 │ ◦  │   sem "cadastre-se para continuar".                  │
 │ ◦  │                                                      │
 │ ◦  │   ~~~~~~~~~~~~~                                      │
 │ ◦  │   só coisas.                                         │
 │ ◦  │                                                      │
 └───────────────────────────────────────────────────────────┘
```

Lembra quando a web era **esquisita**? Quando alguém passava um fim de semana fazendo um joguinho, ou uma
calculadora boba, e aí simplesmente… *colocava no ar*? De graça. Pra qualquer um.

Este projeto é um **"não."** pequeno e teimoso ao funil. É um lugar para coisas pequenas e independentes,
escrito como um caderno (papel pautado, caneta azul, setas de caneta vermelha mostrando o caminho), e segue sete regras:

- [x] **Grátis.** Grátis de verdade. Como livro de biblioteca: você entra, usa, e vai embora.
- [x] **Sem anúncio, sem rastreador, sem coisa esquisita.** Se uma coisa lembra de algo, fica no *seu* navegador.
- [x] **Sem conta.** Você não é um "usuário". Você é uma pessoa que queria jogar paciência.
- [x] **HTML, CSS e JS puros.** ~~webpack, npm install, 900MB de node_modules~~ Veja o código-fonte e ele faz sentido.
- [x] **Uma coisa só, bem feita** (ou pelo menos feita com charme). Pequeno é qualidade.
- [x] **Funciona quase offline, carrega rápido, respeita sua bateria.**
- [x] **Seja esquisito. Seja gentil.**

## O que tem aqui

| | o quê | onde |
|---|---|---|
| 📓 | **O caderno**: o hub, em português e inglês, com layout "escrito à mão" e setas desenhadas | [`index.html`](index.html) |
| 🌍 | **things18n**: um pacote de tradução para HTML/CSS/JS puros. Uma tag de script, sem build, sem dependências | [`things18n/`](things18n/) |
| 🃏 | **MeAsocie**: paciência de palavras em português e inglês, com modo médico. Mora no [próprio repositório](https://github.com/tetzgabriel/me_associe); o caderno só linka | [`/me_associe/`](https://meoriente.com.br/me_associe/) |
| 🗂️ | **indieshelf**: uma prateleira de arrastar e soltar na barra de menus do Mac. Chacoalhe enquanto arrasta arquivos para abrir. É um app de Mac, então mora no [próprio repositório](https://github.com/tetzgabriel/indieshelf) | [baixar](https://github.com/tetzgabriel/indieshelf/releases/latest) |

## things18n

O caderno fala português e inglês graças ao **things18n**, um pacote minúsculo de tradução: uma tag de script,
sem build, sem dependências. Ele tem o próprio README: **[things18n/README.pt-BR.md](things18n/README.pt-BR.md)**
(e a [documentação ao vivo](https://meoriente.com.br/indiethings/things18n/)).

## Testes: no navegador, sem Node

Os testes são HTML puro com o [QUnit](https://qunitjs.com/) carregado de um CDN. Eles dirigem as páginas de verdade
(o caderno, a documentação, o jogo) nos dois idiomas, e procuram buracos nas traduções e nos bancos de palavras.

Sirva a pasta que contém **os dois** repositórios (`indiethings` e `me_associe`) com qualquer servidor estático, para que
os caminhos fiquem iguais aos do site, e abra:

```
/indiethings/tests/
```

Ou pule a preparação: roda ao vivo em **https://meoriente.com.br/indiethings/tests/**.
Marque **remote** na barra para testar também o carregamento da biblioteca pelo GitHub Pages e pelo jsDelivr.

## Como está organizado

```
indiethings/
├── index.html           o caderno (português + inglês)
├── css/notebook.css     papel, tinta, linha de margem, setas
├── js/
│   ├── things.js        o registro: uma entrada por coisa
│   ├── book.js          desenha a lista e redesenha quando o idioma muda
│   └── i18n.js          os poucos textos que o JavaScript monta
├── things18n/           o pacote de tradução
│   ├── things18n.js     a biblioteca (só navegador)
│   ├── things18n.css    opcional: um idioma, não todos, sem JS
│   ├── README.pt-BR.md  o próprio README (+ README.md)
│   └── index.html       a documentação, bilíngue, com demonstração ao vivo
└── tests/               QUnit, roda no navegador
```

Publicado com o GitHub Pages direto da `main`, sem etapa de build.

## Coloque a sua coisa

1. Crie uma pasta, `things/sua-coisa/index.html`, e coloque o que quiser nela. Linke o
   `css/notebook.css` para o visual de papel, ou não. (Ou mantenha no próprio repositório e aponte o `href` para ele.)
2. Adicione uma entrada em [`js/things.js`](js/things.js): nome, tipo, uma descrição de uma linha, talvez uma nota ácida.
3. Mande. Se seguir as regras, entra no caderno, com o seu nome, de caneta.

---

<p align="center"><sub>fica esquisito ✌︎ — a turma do indiethings</sub></p>
