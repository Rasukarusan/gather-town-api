import {
  Game as Gather,
  Player,
  SpriteDirectionEnum_ENUM,
} from '@gathertown/gather-game-client'
import { App as SlackApp } from '@slack/bolt'
import * as http from 'http'
import { initGather } from './gather'
import {
  deleteAllMessages,
  generatePresenceMessage,
  updateJoinMessage,
} from './message'
import { initSlack } from './slack'
import { SlackTs } from './types'
const dayjs = require('dayjs')

const MAP_ID = 'office-main'
const port = process.env.PORT || 8080

const healthServerListener = () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(JSON.stringify({ result: true }))
  })
  server.listen(port)
}

let slackTs: SlackTs = { date: '', ts: '' }
;(async () => {
  healthServerListener()
  const gather = await initGather()
  const slack = await initSlack()

  gather.subscribeToConnection((connected) => {
    console.log({ connected })
    const interval = process.env.APP_ENV === 'development' ? 10000 : 300000
    setInterval(async () => {
      slackTs = await updateJoinMessage(gather, slack, slackTs)
    }, interval)
    gather.subscribeToEvent('playerJoins', async (data, context) => {
      console.log('player joined')
      slackTs = await updateJoinMessage(gather, slack, slackTs)
    })

    gather.subscribeToEvent('playerExits', async (data, context) => {
      console.log('player exit')
      slackTs = await updateJoinMessage(gather, slack, slackTs)
    })
    gather.subscribeToEvent('playerMoves', async (data, context) => {
      const { player, playerId } = context
      // テレポート入り口
      if (player?.x === 31 && player?.y === 34) {
        gather.teleport(MAP_ID, 31, 40, playerId)
      }
      // テレポート出口
      if (player?.x === 31 && player?.y === 37) {
        gather.teleport(MAP_ID, 31, 30, playerId)
      }
      // ワープ入り口
      if (player?.x === 31 && player?.y === 42) {
        gather.teleport(MAP_ID, 50, 40, playerId)
      }
    })

    // ゴーストのとき障害物を通り抜ける
    gather.subscribeToEvent('playerGhosts', async (data, context) => {
      const { player, playerId } = context
      if (!player || !playerId) return
      const { direction } = player
      switch (direction) {
        case SpriteDirectionEnum_ENUM.Up:
        case SpriteDirectionEnum_ENUM.UpAlt:
          gather.teleport(MAP_ID, player.x!, player.y! - 1, playerId, direction)
          break
        case SpriteDirectionEnum_ENUM.Down:
        case SpriteDirectionEnum_ENUM.DownAlt:
          gather.teleport(MAP_ID, player.x!, player.y! + 1, playerId, direction)
          break
        case SpriteDirectionEnum_ENUM.Left:
        case SpriteDirectionEnum_ENUM.LeftAlt:
          gather.teleport(MAP_ID, player.x! - 1, player.y!, playerId, direction)
          break
        case SpriteDirectionEnum_ENUM.Right:
        case SpriteDirectionEnum_ENUM.RightAlt:
          gather.teleport(MAP_ID, player.x! + 1, player.y!, playerId, direction)
          break
        default:
          break
      }
    })
  })
})()
