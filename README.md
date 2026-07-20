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
