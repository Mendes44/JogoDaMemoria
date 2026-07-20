// Importa a biblioteca instalada pelo npm e declarada no package.json.
// Diferente do readline padrão, ela pausa o programa até o usuário responder.
const readlineSync = require("readline-sync");

// Determina quantas cartas são colocadas em cada linha do tabuleiro.
const CARTAS_POR_LINHA = 4;

/** Limpa o terminal para que o tabuleiro seguinte substitua o anterior. */
function limparTela() {
  // console.clear pede ao terminal para apagar o conteúdo exibido anteriormente.
  console.clear();
}

/*
 * Mostra uma carta como emoji quando ela está virada ou já foi encontrada.
 * Caso contrário, mostra o id com dois dígitos, como [ 01 ].
 */
function formatarCarta(carta) {
  // O operador `||` significa "ou". Basta uma condição ser verdadeira para revelar.
  // O operador ternário `condição ? valor1 : valor2` escolhe um dos dois formatos.
  const conteudo = carta.virada || carta.encontrada
    ? ` ${carta.emoji} `
    // String converte o id; padStart completa ids menores que 10 com zero à esquerda.
    : String(carta.id).padStart(2, "0");

  // A crase cria uma template string e `${conteudo}` insere o valor calculado.
  return `[ ${conteudo} ]`;
}

/* Monta o tabuleiro 4x4 e o imprime de uma só vez. */
function exibirTabuleiro(cartas) {
  // Este array receberá quatro textos, um para cada linha do tabuleiro.
  const linhas = [];

  // O índice avança de quatro em quatro porque cada rodada do laço cria uma linha.
  for (let indice = 0; indice < cartas.length; indice += CARTAS_POR_LINHA) {
    const linha = cartas
      // slice extrai as próximas quatro cartas sem modificar o array original.
      .slice(indice, indice + CARTAS_POR_LINHA)
      // map envia cada carta para formatarCarta e recebe os textos formatados.
      .map(formatarCarta)
      // join une as quatro cartas colocando um espaço entre elas.
      .join(" ");

    // Guarda a linha pronta no final do array de linhas.
    linhas.push(linha);
  }

  // O segundo join une as linhas usando `\n`, que representa uma quebra de linha.
  console.log(`Tabuleiro:\n${linhas.join("\n")}\n`);
}

/**
 * readline-sync devolve texto. Number converte a resposta para que o serviço
 * possa verificar se ela representa um número inteiro válido.
 */
function solicitarCarta(ordem) {
  // `ordem` vale 1 ou 2 e informa qual escolha da rodada está sendo solicitada.
  const resposta = readlineSync.question(`Escolha a carta ${ordem} (1 a 16): `);

  // trim remove espaços extras e Number converte o texto digitado em número.
  return Number(resposta.trim());
}

/** Exibe qualquer mensagem que o controlador enviar para esta camada. */
function exibirMensagem(mensagem) {
  // O primeiro `\n` deixa uma linha em branco antes do aviso.
  console.log(`\n${mensagem}`);
}

/** Dá tempo para o jogador observar as duas cartas antes de limpar a rodada. */
function aguardarJogador() {
  // A resposta não precisa ser guardada; o objetivo é apenas aguardar ENTER.
  readlineSync.question("\nPressione ENTER para continuar...");
}

// Expõe as funções que formam a interface pública desta camada.
// O controlador recebe este objeto pelo parâmetro `view`.
module.exports = {
  limparTela,
  exibirTabuleiro,
  solicitarCarta,
  exibirMensagem,
  aguardarJogador,
};
