const QUANTIDADE_DE_CARTAS = 16;
const LIMITE_DE_ERROS_CONSECUTIVOS = 5;

/*
 * Embaralha uma cópia do array usando o algoritmo Fisher-Yates.
 * A função aleatória é recebida por parâmetro para facilitar os testes.
 */
function embaralhar(itens, gerarAleatorio = Math.random) {
  const itensEmbaralhados = [...itens];

  for (let indice = itensEmbaralhados.length - 1; indice > 0; indice -= 1) {
    const indiceSorteado = Math.floor(gerarAleatorio() * (indice + 1));
    [itensEmbaralhados[indice], itensEmbaralhados[indiceSorteado]] = [
      itensEmbaralhados[indiceSorteado],
      itensEmbaralhados[indice],
    ];
  }

  return itensEmbaralhados;
}

/*
 * Cria duas cartas para cada emoji e define o estado inicial delas.
 * O id começa em 1 porque é o número que o jogador enxerga e digita.
 */
function criarBaralho(emojis, gerarAleatorio = Math.random) {
  const paresEmbaralhados = embaralhar([...emojis, ...emojis], gerarAleatorio);

  return paresEmbaralhados.map((emoji, indice) => ({
    id: indice + 1,
    emoji,
    virada: false,
    encontrada: false,
  }));
}

/* Cria todo o estado mutável de uma nova partida. */
function criarJogo(emojis, gerarAleatorio = Math.random) {
  if (emojis.length * 2 !== QUANTIDADE_DE_CARTAS) {
    throw new Error("O jogo precisa receber exatamente 8 emojis.");
  }

  return {
    cartas: criarBaralho(emojis, gerarAleatorio),
    errosConsecutivos: 0,
  };
}

/** Procura a carta pelo número apresentado no tabuleiro. */
function buscarCarta(jogo, numeroDaCarta) {
  return jogo.cartas.find((carta) => carta.id === numeroDaCarta);
}

/*
 * Verifica a escolha antes de alterar o jogo.
 * Retorna uma mensagem em vez de lançar erro, pois erros de digitação são
 * esperados durante uma partida e o jogador deve poder tentar novamente.
 */
function validarEscolha(jogo, numeroDaCarta, primeiraCarta = null) {
  if (!Number.isInteger(numeroDaCarta) || numeroDaCarta < 1 || numeroDaCarta > QUANTIDADE_DE_CARTAS) {
    return "Digite um número inteiro entre 1 e 16.";
  }

  const carta = buscarCarta(jogo, numeroDaCarta);

  if (carta.encontrada) {
    return "Esse par já foi encontrado. Escolha uma carta virada para baixo.";
  }

  if (primeiraCarta && carta.id === primeiraCarta.id) {
    return "Escolha uma carta diferente da primeira.";
  }

  return null;
}

/* Vira uma carta válida e a devolve para o controlador. */
function virarCarta(jogo, numeroDaCarta) {
  const carta = buscarCarta(jogo, numeroDaCarta);
  carta.virada = true;
  return carta;
}

/*
 * Resolve a rodada depois que duas cartas foram viradas.
 * Um acerto zera a sequência de erros; um erro incrementa essa sequência.
 */
function resolverRodada(jogo, primeiraCarta, segundaCarta) {
  const formamPar = primeiraCarta.emoji === segundaCarta.emoji;

  if (formamPar) {
    primeiraCarta.encontrada = true;
    segundaCarta.encontrada = true;
    jogo.errosConsecutivos = 0;
  } else {
    jogo.errosConsecutivos += 1;
  }

  return formamPar;
}

/* Esconde somente as cartas erradas; pares encontrados continuam visíveis. */
function esconderCartas(primeiraCarta, segundaCarta) {
  if (!primeiraCarta.encontrada) primeiraCarta.virada = false;
  if (!segundaCarta.encontrada) segundaCarta.virada = false;
}

/* A vitória acontece quando todas as cartas pertencem a pares encontrados. */
function jogadorVenceu(jogo) {
  return jogo.cartas.every((carta) => carta.encontrada);
}

/* A derrota acontece ao alcançar cinco erros sem um acerto entre eles. */
function jogadorPerdeu(jogo) {
  return jogo.errosConsecutivos >= LIMITE_DE_ERROS_CONSECUTIVOS;
}

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
