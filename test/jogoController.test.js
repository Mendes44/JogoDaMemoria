// Ferramentas nativas do Node para organizar testes e comparar resultados.
const test = require("node:test");
const assert = require("node:assert/strict");

// Importações dos mesmos três módulos usados para montar a aplicação real.
const { EMOJIS } = require("../src/config/emojis");
const serviceOriginal = require("../src/services/jogoService");
const { iniciarJogo } = require("../src/controllers/jogoController");

test("coordena uma partida completa até a vitória e redesenha o tabuleiro", () => {
  // O mesmo valor aleatório gera sempre o mesmo baralho neste teste.
  const gerarAleatorio = () => 0.5;

  // Cria antecipadamente um baralho cuja posição de cada par é conhecida.
  const baralhoConhecido = serviceOriginal.criarJogo(EMOJIS, gerarAleatorio);

  // Reúne os ids de cada par para simular um jogador que acerta todas as rodadas.
  const escolhas = EMOJIS.flatMap((emoji) =>
    baralhoConhecido.cartas
      // Para o emoji atual, seleciona suas duas cartas.
      .filter((carta) => carta.emoji === emoji)
      // Troca os objetos das cartas apenas pelos números que o jogador digitaria.
      .map((carta) => carta.id),
  );

  // Este objeto funciona como um contador das ações pedidas pelo controlador.
  const chamadas = {
    limpezas: 0,
    tabuleiros: 0,
    pausas: 0,
    mensagens: [],
  };

  // Esta view falsa substitui o terminal e registra tudo que seria apresentado.
  const viewFalsa = {
    limparTela() {
      // Em vez de limpar um terminal real, somente registra a chamada.
      chamadas.limpezas += 1;
    },
    exibirTabuleiro() {
      // Não precisamos imprimir as cartas para validar o fluxo do controlador.
      chamadas.tabuleiros += 1;
    },
    solicitarCarta() {
      // shift remove e devolve a primeira escolha preparada no array.
      return escolhas.shift();
    },
    exibirMensagem(mensagem) {
      // Guarda todas as mensagens para que possam ser verificadas no final.
      chamadas.mensagens.push(mensagem);
    },
    aguardarJogador() {
      // Simula o ENTER sem bloquear a execução automática do teste.
      chamadas.pausas += 1;
    },
  };

  // Somente a criação é adaptada para retirar a aleatoriedade; as demais regras
  // continuam sendo as mesmas usadas pelo jogo real.
  const servicePrevisivel = {
    // `...serviceOriginal` copia todas as funções reais para o novo objeto.
    ...serviceOriginal,

    // Sobrescreve somente criarJogo para sempre utilizar o gerador controlado.
    criarJogo(emojis) {
      return serviceOriginal.criarJogo(emojis, gerarAleatorio);
    },
  };

  // Inicia a partida com as substituições controladas e guarda o resultado final.
  const resultado = iniciarJogo(EMOJIS, viewFalsa, servicePrevisivel);

  // Confirma a vitória e também quantas vezes cada ação de interface ocorreu.
  assert.equal(resultado, "vitoria");
  assert.equal(chamadas.tabuleiros, 24);
  assert.equal(chamadas.limpezas, 24);
  assert.equal(chamadas.pausas, 7);

  // filter conta as oito mensagens de pares encontrados.
  assert.equal(chamadas.mensagens.filter((mensagem) => mensagem.includes("combinam")).length, 8);

  // some retorna true se pelo menos uma mensagem contiver a palavra Parabéns.
  assert.ok(chamadas.mensagens.some((mensagem) => mensagem.includes("Parabéns")));
});
