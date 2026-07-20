const { EMOJIS } = require("./config/emojis");
const terminalView = require("./views/terminalView");
const { iniciarJogo } = require("./controllers/jogoController");

// Este é o ponto de entrada: apenas conecta as camadas e inicia a aplicação.
iniciarJogo(EMOJIS, terminalView);
