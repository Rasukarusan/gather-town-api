import { Game } from '@gathertown/gather-game-client'
global.WebSocket = require('isomorphic-ws')
const { GATHER_API_KEY, GATHER_SPACE_ID } = require('./config')
const MAP_ID = 'office-main'

const game = new Game(GATHER_SPACE_ID, () =>
  Promise.resolve({ apiKey: GATHER_API_KEY })
)
game.connect()
// game.debug(true)

game.subscribeToConnection((connected) => {
  console.log({ connected })
  game.subscribeToEvent('playerJoins', async (data, context) => {
    console.log('player joined')
    console.log(context)
  })
  game.subscribeToEvent('playerMoves', async (data, context) => {
    const { player, playerId } = context
    console.log('x', player?.x)
    console.log('y', player?.y)
    // テレポート入り口
    if (player?.x === 31 && player?.y === 34) {
      game.teleport(MAP_ID, 31, 40, playerId)
    }
    // テレポート出口
    if (player?.x === 31 && player?.y === 37) {
      game.teleport(MAP_ID, 31, 30, playerId)
    }
    // ワープ入り口
    if (player?.x === 31 && player?.y === 42) {
      game.teleport(MAP_ID, 50, 40, playerId)
    }
  })
})
