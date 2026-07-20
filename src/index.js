// `require` importa o objeto exportado pelo arquivo `config/emojis.js`.
// As chaves `{ EMOJIS }` retiram somente a propriedade EMOJIS desse objeto.
const { EMOJIS } = require("./config/emojis");

// Importa todas as funções exportadas pela camada de exibição.
// `terminalView` passa a ser um objeto com funções como limparTela e solicitarCarta.
const terminalView = require("./views/terminalView");

// Importa somente a função iniciarJogo da camada controladora.
// O caminho começa com `./` porque parte da pasta em que este arquivo está.
const { iniciarJogo } = require("./controllers/jogoController");

// Este é o ponto de entrada da aplicação.
// O primeiro argumento fornece os emojis e o segundo fornece a exibição no terminal.
// A partir daqui, o controlador assume o fluxo da partida.
iniciarJogo(EMOJIS, terminalView);
