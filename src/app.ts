import { Game } from '@gathertown/gather-game-client'
global.WebSocket = require('isomorphic-ws')
const { GATHER_API_KEY, GATHER_SPACE_ID } = require('./config')

const game = new Game(GATHER_SPACE_ID, () =>
  Promise.resolve({ apiKey: GATHER_API_KEY })
)
game.connect()
// game.debug(true)

game.subscribeToConnection((connected) => {
  console.log({ connected })
  game.subscribeToEvent('playerMoves', () => {
    console.log(game.players)
  })
})
