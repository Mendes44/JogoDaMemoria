// `../` volta da pasta controllers para src; depois entra em services.
// O objeto importado reúne todas as regras exportadas por jogoService.js.
const jogoService = require("../services/jogoService");

/*
 * Lê uma escolha até receber uma carta válida. A view e o service são
 * recebidos por parâmetro para manter cada camada independente e testável.
 */
function pedirCartaValida(jogo, ordem, primeiraCarta, view, service) {
  // `while (true)` repete até que um return encerre a função com uma carta válida.
  while (true) {
    // A entrada vem da view; assim, o controlador não usa readline diretamente.
    const numeroDaCarta = view.solicitarCarta(ordem);

    // A validação vem do service; assim, o controlador não reescreve as regras.
    const erro = service.validarEscolha(jogo, numeroDaCarta, primeiraCarta);

    // `!erro` será verdadeiro quando o service devolver null, ou seja, sem erro.
    if (!erro) {
      // Vira e devolve a carta. Este return também encerra o laço infinito.
      return service.virarCarta(jogo, numeroDaCarta);
    }

    // Se houve erro, mostra o motivo e o laço volta a solicitar outra escolha.
    view.exibirMensagem(`⚠️ ${erro}`);
  }
}

/*
 * Coordena uma partida. O controlador não conhece console nem regras internas:
 * ele apenas pede ações à camada de exibição e à camada de serviço.
 */
function iniciarJogo(emojis, view, service = jogoService) {
  // `service = jogoService` é o valor padrão usado no jogo real.
  // Nos testes, podemos enviar outro service controlado no terceiro argumento.
  const jogo = service.criarJogo(emojis);

  // A partida continua até um dos returns de vitória ou derrota ser executado.
  while (true) {
    // Toda rodada começa em uma tela limpa e com o estado atual do tabuleiro.
    view.limparTela();
    view.exibirTabuleiro(jogo.cartas);

    // `null` indica que ainda não existe uma primeira carta a ser comparada.
    const primeiraCarta = pedirCartaValida(jogo, 1, null, view, service);

    // Redesenha o tabuleiro para mostrar a primeira carta que acabou de ser virada.
    view.limparTela();
    view.exibirTabuleiro(jogo.cartas);

    // Envia primeiraCarta para impedir que o mesmo número seja escolhido novamente.
    const segundaCarta = pedirCartaValida(jogo, 2, primeiraCarta, view, service);

    // Depois da segunda escolha, limpa e recria o tabuleiro conforme o requisito.
    view.limparTela();
    view.exibirTabuleiro(jogo.cartas);

    // A comparação é feita pelo serviço; o controlador recebe true ou false.
    const formamPar = service.resolverRodada(jogo, primeiraCarta, segundaCarta);

    // O ternário escolhe uma mensagem de acordo com o resultado booleano.
    view.exibirMensagem(formamPar ? "✅ As cartas combinam!" : "❌ Não combinam!");

    // A vitória é verificada antes da derrota porque um acerto zera os erros.
    if (service.jogadorVenceu(jogo)) {
      view.exibirMensagem("🎉 Parabéns! Você encontrou todos os pares!");

      // O return encerra a função e, consequentemente, a partida.
      return "vitoria";
    }

    if (service.jogadorPerdeu(jogo)) {
      view.exibirMensagem("😞 Fim de jogo! Você errou 5 vezes consecutivas.");
      return "derrota";
    }

    // O jogador vê o resultado; depois as cartas erradas são desviradas.
    view.aguardarJogador();
    service.esconderCartas(primeiraCarta, segundaCarta);

    // Ao chegar aqui, o while inicia outra rodada e redesenha o estado atualizado.
  }
}

// Permite que index.js e os testes importem a função que começa uma partida.
module.exports = { iniciarJogo };
