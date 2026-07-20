// Constantes dão nomes claros aos números que representam regras do jogo.
// Esta constante é usada internamente para validar o tamanho e as escolhas.
const QUANTIDADE_DE_CARTAS = 16;

// Esta também será exportada, pois os testes precisam consultar o mesmo limite.
const LIMITE_DE_ERROS_CONSECUTIVOS = 5;

/*
 * Embaralha uma cópia do array usando o algoritmo Fisher-Yates.
 * A função aleatória é recebida por parâmetro para facilitar os testes.
 */
function embaralhar(itens, gerarAleatorio = Math.random) {
  // `[...itens]` copia o array. Assim, a lista recebida não é modificada.
  const itensEmbaralhados = [...itens];

  // Começa no último item e caminha até o segundo item do array.
  for (let indice = itensEmbaralhados.length - 1; indice > 0; indice -= 1) {
    // Math.random gera um decimal de 0 até quase 1.
    // Math.floor remove as casas decimais para obter um índice inteiro válido.
    const indiceSorteado = Math.floor(gerarAleatorio() * (indice + 1));

    // A desestruturação abaixo troca os dois itens de posição sem variável auxiliar.
    [itensEmbaralhados[indice], itensEmbaralhados[indiceSorteado]] = [
      itensEmbaralhados[indiceSorteado],
      itensEmbaralhados[indice],
    ];
  }

  // Entrega o novo array embaralhado para quem chamou a função.
  return itensEmbaralhados;
}

/*
 * Cria duas cartas para cada emoji e define o estado inicial delas.
 * O id começa em 1 porque é o número que o jogador enxerga e digita.
 */
function criarBaralho(emojis, gerarAleatorio = Math.random) {
  // `[...emojis, ...emojis]` junta duas cópias da lista e forma os oito pares.
  // Em seguida, a função acima mistura a posição desses 16 símbolos.
  const paresEmbaralhados = embaralhar([...emojis, ...emojis], gerarAleatorio);

  // `map` percorre os emojis e transforma cada um em um objeto que representa uma carta.
  return paresEmbaralhados.map((emoji, indice) => ({
    // O array começa no índice 0, mas os números mostrados ao jogador começam em 1.
    id: indice + 1,

    // Esta forma curta equivale a escrever `emoji: emoji`.
    emoji,

    // `virada` controla a exibição temporária durante a escolha da rodada.
    virada: false,

    // `encontrada` registra definitivamente que a carta pertence a um par acertado.
    encontrada: false,
  }));
}

/* Cria todo o estado mutável de uma nova partida. */
function criarJogo(emojis, gerarAleatorio = Math.random) {
  // Multiplicamos por 2 porque cada emoji dará origem a duas cartas.
  if (emojis.length * 2 !== QUANTIDADE_DE_CARTAS) {
    // Interrompe a criação se a configuração não tiver exatamente oito emojis.
    throw new Error("O jogo precisa receber exatamente 8 emojis.");
  }

  // Este objeto concentra o estado completo da partida.
  return {
    // Busca as cartas recém-criadas na função criarBaralho.
    cartas: criarBaralho(emojis, gerarAleatorio),

    // Uma nova partida sempre começa sem erros acumulados.
    errosConsecutivos: 0,
  };
}

/** Procura a carta pelo número apresentado no tabuleiro. */
function buscarCarta(jogo, numeroDaCarta) {
  // `find` percorre jogo.cartas e devolve a primeira carta cujo id seja igual ao número.
  // `===` compara valor e tipo, evitando conversões automáticas do JavaScript.
  return jogo.cartas.find((carta) => carta.id === numeroDaCarta);
}

/*
 * Verifica a escolha antes de alterar o jogo.
 * Retorna uma mensagem em vez de lançar erro, pois erros de digitação são
 * esperados durante uma partida e o jogador deve poder tentar novamente.
 */
function validarEscolha(jogo, numeroDaCarta, primeiraCarta = null) {
  // Number.isInteger confirma que o valor é inteiro; as outras condições limitam 1 a 16.
  if (!Number.isInteger(numeroDaCarta) || numeroDaCarta < 1 || numeroDaCarta > QUANTIDADE_DE_CARTAS) {
    return "Digite um número inteiro entre 1 e 16.";
  }

  // Como o número já foi validado, agora podemos buscar a carta correspondente.
  const carta = buscarCarta(jogo, numeroDaCarta);

  // Não deixa o jogador selecionar novamente um par que já está resolvido.
  if (carta.encontrada) {
    return "Esse par já foi encontrado. Escolha uma carta virada para baixo.";
  }

  // `primeiraCarta &&` verifica se ela existe antes de tentar acessar o seu id.
  if (primeiraCarta && carta.id === primeiraCarta.id) {
    return "Escolha uma carta diferente da primeira.";
  }

  // `null` informa ao controlador que nenhum erro foi encontrado.
  return null;
}

/* Vira uma carta válida e a devolve para o controlador. */
function virarCarta(jogo, numeroDaCarta) {
  // Reaproveita a busca centralizada para obter o próprio objeto da carta.
  const carta = buscarCarta(jogo, numeroDaCarta);

  // Objetos são mutáveis: esta alteração também aparece dentro de jogo.cartas.
  carta.virada = true;

  // Devolve a carta para o controlador comparar com a outra escolha.
  return carta;
}

/*
 * Resolve a rodada depois que duas cartas foram viradas.
 * Um acerto zera a sequência de erros; um erro incrementa essa sequência.
 */
function resolverRodada(jogo, primeiraCarta, segundaCarta) {
  // Duas cartas formam um par quando guardam exatamente o mesmo emoji.
  const formamPar = primeiraCarta.emoji === segundaCarta.emoji;

  if (formamPar) {
    // Um acerto torna as duas cartas permanentemente encontradas.
    primeiraCarta.encontrada = true;
    segundaCarta.encontrada = true;

    // A regra diz que qualquer acerto interrompe e zera a sequência de erros.
    jogo.errosConsecutivos = 0;
  } else {
    // `+= 1` soma um ao valor que já estava guardado.
    jogo.errosConsecutivos += 1;
  }

  // O booleano permite ao controlador escolher a mensagem de acerto ou erro.
  return formamPar;
}

/* Esconde somente as cartas erradas; pares encontrados continuam visíveis. */
function esconderCartas(primeiraCarta, segundaCarta) {
  // O `if` protege os pares acertados: somente cartas não encontradas são desviradas.
  if (!primeiraCarta.encontrada) primeiraCarta.virada = false;
  if (!segundaCarta.encontrada) segundaCarta.virada = false;
}

/* A vitória acontece quando todas as cartas pertencem a pares encontrados. */
function jogadorVenceu(jogo) {
  // `every` retorna true somente se TODAS as cartas tiverem encontrada igual a true.
  return jogo.cartas.every((carta) => carta.encontrada);
}

/* A derrota acontece ao alcançar cinco erros sem um acerto entre eles. */
function jogadorPerdeu(jogo) {
  // `>=` também protege contra um valor que por engano ultrapasse exatamente cinco.
  return jogo.errosConsecutivos >= LIMITE_DE_ERROS_CONSECUTIVOS;
}

// Disponibiliza somente as partes do serviço que outras camadas realmente utilizam.
// `embaralhar` e `buscarCarta` continuam privadas dentro deste arquivo.
module.exports = {
  LIMITE_DE_ERROS_CONSECUTIVOS,
  criarJogo,
  validarEscolha,
  virarCarta,
  resolverRodada,
  esconderCartas,
  jogadorVenceu,
  jogadorPerdeu,
};
