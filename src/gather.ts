import { Game } from '@gathertown/gather-game-client'
global.WebSocket = require('isomorphic-ws')
require('dotenv').config()
const GATHER_API_KEY = process.env.GATHER_API_KEY || ''
const GATHER_SPACE_ID = process.env.GATHER_SPACE_ID || ''

export const initGather = async () => {
  const game = new Game(GATHER_SPACE_ID, () =>
    Promise.resolve({ apiKey: GATHER_API_KEY })
  )
  game.connect()
  return game
}
// game.debug(true)
