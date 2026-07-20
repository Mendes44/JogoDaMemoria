# Jogo da Memória no Terminal

Jogo da memória feito em JavaScript para Node.js. O tabuleiro possui 16 cartas
(8 pares de emojis), aceita as escolhas pelo terminal e termina em vitória ao
encontrar todos os pares ou em derrota após 5 erros consecutivos.

## Como executar

É necessário ter o Node.js 18 ou mais recente instalado.

```bash
npm install
npm start
```

Digite o número de uma carta por vez. Depois que duas cartas forem mostradas,
pressione **ENTER** para iniciar a rodada seguinte.

## Como executar os testes

```bash
npm test
```

## Organização das camadas

```text
src/
├── config/emojis.js              # Configuração dos oito emojis
├── controllers/jogoController.js # Coordena o fluxo de cada rodada
├── services/jogoService.js       # Estado e regras do jogo
├── views/terminalView.js         # Entrada e saída no terminal
└── index.js                      # Conecta as camadas e inicia o jogo
```

Essa separação evita misturar regras, como validar pares e contar erros, com a
forma de apresentar o tabuleiro ou ler dados do usuário.

## Como os arquivos se conectam

1. O Node executa `src/index.js` por meio do comando `npm start`.
2. `index.js` importa os emojis, a camada de exibição e o controlador.
3. O controlador solicita ao serviço a criação do jogo e a aplicação das regras.
4. O controlador solicita à view a leitura das escolhas e a impressão do tabuleiro.
5. A view importa `readline-sync` do diretório `node_modules` para ler o teclado.

Os caminhos iniciados por `./` buscam algo a partir da pasta atual. Um caminho
iniciado por `../` volta uma pasta antes de continuar. Já `require("readline-sync")`
não possui `./` porque busca uma dependência instalada pelo npm.
