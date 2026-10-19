<h1 align="center">🌍 things18n</h1>

<p align="center">
  <em>traduza uma página com uma tag de script<br>sem build, sem dependências, sem Node</em>
</p>

<p align="center">
  <a href="https://meoriente.com.br/indiethings/things18n/"><b>documentação completa + demo ao vivo</b></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/tetzgabriel/indiethings">indiethings</a>
  &nbsp;·&nbsp;
  <a href="README.md">🇬🇧 english</a>
</p>

Faça uma página falar dois idiomas:

```html
<html lang="pt-BR">
<head>
  <script src="https://meoriente.com.br/indiethings/things18n/things18n.js" data-switcher></script>
  <script>
    things18n.add('en', { 'Olá, mundo': 'Hello, world' });
  </script>
</head>
<body>
  <h1 data-t>Olá, mundo</h1>
</body>
```

Pronto: aparece um seletor de idioma, o visitante recebe o idioma do navegador e a escolha fica lembrada.

## O que você ganha

- **O texto é a chave.** O `data-t` não precisa de nomes inventados. Prefere chaves? O `data-i18n` também faz isso.
- **Zero configuração.** O idioma padrão é o seu `<html lang>`; os outros são os que você usar em `add()`.
- **Plurais direito**, inclusive a pegadinha do português em que "0 é singular". Parâmetros, chaves aninhadas, fallbacks.
- **Texto longo?** Escreva um bloco por idioma: `<div data-lang="pt-BR">…</div>`.
- **Ache o que falta** adicionando `?i18n=debug` em qualquer página: contornos vermelhos, um contador, um relatório no console.
- **Funciona sem JavaScript** (mostra um idioma, não todos) e cuida de idiomas da direita para a esquerda.

## Arquivos

| arquivo | o quê |
|---|---|
| [`things18n.js`](things18n.js) | a biblioteca (só navegador) |
| [`things18n.css`](things18n.css) | opcional: mostra um idioma, não todos, sem JS |
| [`index.html`](index.html) | a documentação, bilíngue, com demonstração ao vivo |

## Instalar

Não tem o que instalar. Linke o script, daqui ou de uma cópia sua:

```html
<script src="https://meoriente.com.br/indiethings/things18n/things18n.js"></script>
```

O resto (marcação, seletores, mensagens, a API, detecção de idioma, como adicionar um idioma, pegadinhas) está na
**[documentação](https://meoriente.com.br/indiethings/things18n/)**, em português e inglês.

## Testes

Moram junto com o resto do caderno, em [`../tests/`](../tests/) (QUnit, roda no navegador).

---

<p align="center"><sub>parte do <a href="../README.pt-BR.md">indiethings</a> · fica esquisito ✌︎</sub></p>
