const test = require("node:test");
const assert = require("node:assert/strict");

const { EMOJIS } = require("../src/config/emojis");
const serviceOriginal = require("../src/services/jogoService");
const { iniciarJogo } = require("../src/controllers/jogoController");

test("coordena uma partida completa até a vitória e redesenha o tabuleiro", () => {
  // O mesmo valor aleatório gera sempre o mesmo baralho neste teste.
  const gerarAleatorio = () => 0.5;
  const baralhoConhecido = serviceOriginal.criarJogo(EMOJIS, gerarAleatorio);

  // Reúne os ids de cada par para simular um jogador que acerta todas as rodadas.
  const escolhas = EMOJIS.flatMap((emoji) =>
    baralhoConhecido.cartas
      .filter((carta) => carta.emoji === emoji)
      .map((carta) => carta.id),
  );

  const chamadas = {
    limpezas: 0,
    tabuleiros: 0,
    pausas: 0,
    mensagens: [],
  };

  // Esta view falsa substitui o terminal e registra tudo que seria apresentado.
  const viewFalsa = {
    limparTela() {
      chamadas.limpezas += 1;
    },
    exibirTabuleiro() {
      chamadas.tabuleiros += 1;
    },
    solicitarCarta() {
      return escolhas.shift();
    },
    exibirMensagem(mensagem) {
      chamadas.mensagens.push(mensagem);
    },
    aguardarJogador() {
      chamadas.pausas += 1;
    },
  };

  // Somente a criação é adaptada para retirar a aleatoriedade; as demais regras
  // continuam sendo as mesmas usadas pelo jogo real.
  const servicePrevisivel = {
    ...serviceOriginal,
    criarJogo(emojis) {
      return serviceOriginal.criarJogo(emojis, gerarAleatorio);
    },
  };

  const resultado = iniciarJogo(EMOJIS, viewFalsa, servicePrevisivel);

  assert.equal(resultado, "vitoria");
  assert.equal(chamadas.tabuleiros, 24);
  assert.equal(chamadas.limpezas, 24);
  assert.equal(chamadas.pausas, 7);
  assert.equal(chamadas.mensagens.filter((mensagem) => mensagem.includes("combinam")).length, 8);
  assert.ok(chamadas.mensagens.some((mensagem) => mensagem.includes("Parabéns")));
});
