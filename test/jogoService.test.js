// Importa o executor de testes que já vem com o Node.js.
const test = require("node:test");

// Importa as comparações rigorosas usadas para confirmar resultados esperados.
const assert = require("node:assert/strict");

// Busca a mesma configuração de emojis usada pela aplicação real.
const { EMOJIS } = require("../src/config/emojis");

// Busca todas as funções públicas da camada de serviço que será testada.
const service = require("../src/services/jogoService");

// Um gerador previsível elimina a aleatoriedade e deixa o teste repetível.
// A seta `=>` é uma forma curta de escrever uma função que retorna 0.5.
const aleatorioFixo = () => 0.5;

// Cada chamada de test recebe o nome do cenário e uma função com a verificação.
test("cria 16 cartas, com exatamente duas de cada emoji", () => {
  // Passa o gerador fixo no lugar de Math.random para conhecer o resultado.
  const jogo = service.criarJogo(EMOJIS, aleatorioFixo);

  // equal confirma que o baralho possui exatamente 16 elementos.
  assert.equal(jogo.cartas.length, 16);

  // deepEqual compara arrays completos; map extrai somente os ids das cartas.
  assert.deepEqual(jogo.cartas.map((carta) => carta.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

  // Repete a verificação para cada um dos oito emojis configurados.
  for (const emoji of EMOJIS) {
    // filter mantém as cartas do emoji atual; length deve ser sempre igual a 2.
    assert.equal(jogo.cartas.filter((carta) => carta.emoji === emoji).length, 2);
  }
});

test("um par permanece virado e zera os erros consecutivos", () => {
  const jogo = service.criarJogo(EMOJIS, aleatorioFixo);

  // A desestruturação pega a primeira carta do array.
  const [primeiraCarta] = jogo.cartas;

  // Procura outra carta, com id diferente, mas que tenha o mesmo emoji.
  const segundaCarta = jogo.cartas.find(
    (carta) => carta.id !== primeiraCarta.id && carta.emoji === primeiraCarta.emoji,
  );

  // Simula três erros anteriores para confirmar que um acerto realmente os zera.
  jogo.errosConsecutivos = 3;

  // Reproduz na ordem as ações que aconteceriam durante uma rodada real.
  service.virarCarta(jogo, primeiraCarta.id);
  service.virarCarta(jogo, segundaCarta.id);

  // O resultado da comparação deve ser true porque os emojis são iguais.
  assert.equal(service.resolverRodada(jogo, primeiraCarta, segundaCarta), true);
  service.esconderCartas(primeiraCarta, segundaCarta);

  // Estas afirmações confirmam o novo estado depois do acerto.
  assert.equal(jogo.errosConsecutivos, 0);
  assert.equal(primeiraCarta.virada, true);
  assert.equal(segundaCarta.virada, true);
  assert.equal(primeiraCarta.encontrada, true);
});

test("cartas diferentes são escondidas e somam um erro", () => {
  const jogo = service.criarJogo(EMOJIS, aleatorioFixo);
  const primeiraCarta = jogo.cartas[0];

  // Desta vez, find procura propositalmente um emoji diferente.
  const segundaCarta = jogo.cartas.find((carta) => carta.emoji !== primeiraCarta.emoji);

  service.virarCarta(jogo, primeiraCarta.id);
  service.virarCarta(jogo, segundaCarta.id);

  // Cartas diferentes devem fazer resolverRodada devolver false.
  assert.equal(service.resolverRodada(jogo, primeiraCarta, segundaCarta), false);
  service.esconderCartas(primeiraCarta, segundaCarta);

  // Depois do erro, o contador sobe e as duas cartas voltam para baixo.
  assert.equal(jogo.errosConsecutivos, 1);
  assert.equal(primeiraCarta.virada, false);
  assert.equal(segundaCarta.virada, false);
});

test("encerra em derrota depois de cinco erros consecutivos", () => {
  const jogo = service.criarJogo(EMOJIS, aleatorioFixo);

  // Usa a própria constante exportada pelo serviço para simular o limite atingido.
  jogo.errosConsecutivos = service.LIMITE_DE_ERROS_CONSECUTIVOS;

  // A função deve reconhecer que a condição de derrota foi alcançada.
  assert.equal(service.jogadorPerdeu(jogo), true);
});

test("rejeita número inválido, carta encontrada e a mesma carta duas vezes", () => {
  const jogo = service.criarJogo(EMOJIS, aleatorioFixo);
  const primeiraCarta = jogo.cartas[0];

  // match verifica se a mensagem devolvida contém o trecho esperado.
  assert.match(service.validarEscolha(jogo, 0), /entre 1 e 16/);
  assert.match(service.validarEscolha(jogo, 1.5), /número inteiro/);
  assert.match(service.validarEscolha(jogo, primeiraCarta.id, primeiraCarta), /diferente/);

  // Altera o estado para também testar a tentativa de selecionar um par concluído.
  primeiraCarta.encontrada = true;
  assert.match(service.validarEscolha(jogo, primeiraCarta.id), /já foi encontrado/);
});
