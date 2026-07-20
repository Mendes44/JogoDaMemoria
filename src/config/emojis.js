// `const` cria uma referência que não poderá receber outro array depois.
// Os colchetes `[]` criam o array com os oito símbolos usados no jogo.
// Cada emoji aparece uma vez aqui; jogoService.js duplicará a lista para criar os pares.
const EMOJIS = ["🐱", "🐶", "🍎", "🍌", "⚽", "🏀", "🌟", "✨"];

// `module.exports` define o que outro arquivo recebe ao usar `require`.
// Exportamos um objeto para que seja possível importar com `const { EMOJIS } = require(...)`.
module.exports = { EMOJIS };
