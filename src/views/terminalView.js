const readlineSync = require("readline-sync");

const CARTAS_POR_LINHA = 4;

/** Limpa o terminal para que o tabuleiro seguinte substitua o anterior. */
function limparTela() {
  console.clear();
}

/*
 * Mostra uma carta como emoji quando ela está virada ou já foi encontrada.
 * Caso contrário, mostra o id com dois dígitos, como [ 01 ].
 */
function formatarCarta(carta) {
  const conteudo = carta.virada || carta.encontrada
    ? ` ${carta.emoji} `
    : String(carta.id).padStart(2, "0");

  return `[ ${conteudo} ]`;
}

/* Monta o tabuleiro 4x4 e o imprime de uma só vez. */
function exibirTabuleiro(cartas) {
  const linhas = [];

  for (let indice = 0; indice < cartas.length; indice += CARTAS_POR_LINHA) {
    const linha = cartas
      .slice(indice, indice + CARTAS_POR_LINHA)
      .map(formatarCarta)
      .join(" ");
    linhas.push(linha);
  }

  console.log(`Tabuleiro:\n${linhas.join("\n")}\n`);
}

/**
 * readline-sync devolve texto. Number converte a resposta para que o serviço
 * possa verificar se ela representa um número inteiro válido.
 */
function solicitarCarta(ordem) {
  const resposta = readlineSync.question(`Escolha a carta ${ordem} (1 a 16): `);
  return Number(resposta.trim());
}

function exibirMensagem(mensagem) {
  console.log(`\n${mensagem}`);
}

/** Dá tempo para o jogador observar as duas cartas antes de limpar a rodada. */
function aguardarJogador() {
  readlineSync.question("\nPressione ENTER para continuar...");
}

module.exports = {
  limparTela,
  exibirTabuleiro,
  solicitarCarta,
  exibirMensagem,
  aguardarJogador,
};
