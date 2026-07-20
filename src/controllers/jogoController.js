const jogoService = require("../services/jogoService");

/*
 * Lê uma escolha até receber uma carta válida. A view e o service são
 * recebidos por parâmetro para manter cada camada independente e testável.
 */
function pedirCartaValida(jogo, ordem, primeiraCarta, view, service) {
  while (true) {
    const numeroDaCarta = view.solicitarCarta(ordem);
    const erro = service.validarEscolha(jogo, numeroDaCarta, primeiraCarta);

    if (!erro) {
      return service.virarCarta(jogo, numeroDaCarta);
    }

    view.exibirMensagem(`⚠️ ${erro}`);
  }
}

/*
 * Coordena uma partida. O controlador não conhece console nem regras internas:
 * ele apenas pede ações à camada de exibição e à camada de serviço.
 */
function iniciarJogo(emojis, view, service = jogoService) {
  const jogo = service.criarJogo(emojis);

  while (true) {
    // Toda rodada começa em uma tela limpa e com o estado atual do tabuleiro.
    view.limparTela();
    view.exibirTabuleiro(jogo.cartas);

    const primeiraCarta = pedirCartaValida(jogo, 1, null, view, service);
    view.limparTela();
    view.exibirTabuleiro(jogo.cartas);

    const segundaCarta = pedirCartaValida(jogo, 2, primeiraCarta, view, service);
    view.limparTela();
    view.exibirTabuleiro(jogo.cartas);

    const formamPar = service.resolverRodada(jogo, primeiraCarta, segundaCarta);
    view.exibirMensagem(formamPar ? "✅ As cartas combinam!" : "❌ Não combinam!");

    if (service.jogadorVenceu(jogo)) {
      view.exibirMensagem("🎉 Parabéns! Você encontrou todos os pares!");
      return "vitoria";
    }

    if (service.jogadorPerdeu(jogo)) {
      view.exibirMensagem("😞 Fim de jogo! Você errou 5 vezes consecutivas.");
      return "derrota";
    }

    // O jogador vê o resultado; depois as cartas erradas são desviradas.
    view.aguardarJogador();
    service.esconderCartas(primeiraCarta, segundaCarta);
  }
}

module.exports = { iniciarJogo };
