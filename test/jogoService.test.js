const test = require("node:test");
const assert = require("node:assert/strict");

const { EMOJIS } = require("../src/config/emojis");
const service = require("../src/services/jogoService");

// Um gerador previsível elimina a aleatoriedade e deixa o teste repetível.
const aleatorioFixo = () => 0.5;

test("cria 16 cartas, com exatamente duas de cada emoji", () => {
  const jogo = service.criarJogo(EMOJIS, aleatorioFixo);

  assert.equal(jogo.cartas.length, 16);
  assert.deepEqual(jogo.cartas.map((carta) => carta.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

  for (const emoji of EMOJIS) {
    assert.equal(jogo.cartas.filter((carta) => carta.emoji === emoji).length, 2);
  }
});

test("um par permanece virado e zera os erros consecutivos", () => {
  const jogo = service.criarJogo(EMOJIS, aleatorioFixo);
  const [primeiraCarta] = jogo.cartas;
  const segundaCarta = jogo.cartas.find(
    (carta) => carta.id !== primeiraCarta.id && carta.emoji === primeiraCarta.emoji,
  );
  jogo.errosConsecutivos = 3;

  service.virarCarta(jogo, primeiraCarta.id);
  service.virarCarta(jogo, segundaCarta.id);
  assert.equal(service.resolverRodada(jogo, primeiraCarta, segundaCarta), true);
  service.esconderCartas(primeiraCarta, segundaCarta);

  assert.equal(jogo.errosConsecutivos, 0);
  assert.equal(primeiraCarta.virada, true);
  assert.equal(segundaCarta.virada, true);
  assert.equal(primeiraCarta.encontrada, true);
});

test("cartas diferentes são escondidas e somam um erro", () => {
  const jogo = service.criarJogo(EMOJIS, aleatorioFixo);
  const primeiraCarta = jogo.cartas[0];
  const segundaCarta = jogo.cartas.find((carta) => carta.emoji !== primeiraCarta.emoji);

  service.virarCarta(jogo, primeiraCarta.id);
  service.virarCarta(jogo, segundaCarta.id);
  assert.equal(service.resolverRodada(jogo, primeiraCarta, segundaCarta), false);
  service.esconderCartas(primeiraCarta, segundaCarta);

  assert.equal(jogo.errosConsecutivos, 1);
  assert.equal(primeiraCarta.virada, false);
  assert.equal(segundaCarta.virada, false);
});

test("encerra em derrota depois de cinco erros consecutivos", () => {
  const jogo = service.criarJogo(EMOJIS, aleatorioFixo);
  jogo.errosConsecutivos = service.LIMITE_DE_ERROS_CONSECUTIVOS;

  assert.equal(service.jogadorPerdeu(jogo), true);
});

test("rejeita número inválido, carta encontrada e a mesma carta duas vezes", () => {
  const jogo = service.criarJogo(EMOJIS, aleatorioFixo);
  const primeiraCarta = jogo.cartas[0];

  assert.match(service.validarEscolha(jogo, 0), /entre 1 e 16/);
  assert.match(service.validarEscolha(jogo, 1.5), /número inteiro/);
  assert.match(service.validarEscolha(jogo, primeiraCarta.id, primeiraCarta), /diferente/);

  primeiraCarta.encontrada = true;
  assert.match(service.validarEscolha(jogo, primeiraCarta.id), /já foi encontrado/);
});
