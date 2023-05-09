import {
  Game as Gather,
  Player,
  SpriteDirectionEnum_ENUM,
} from '@gathertown/gather-game-client'
import { App as SlackApp } from '@slack/bolt'
import * as http from 'http'
import { initGather } from './gather'
import { updateJoinMessage, postJoinMessage } from './message'
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
    gather.subscribeToEvent('playerJoins', async (data, context) => {
      console.log('player joined')
      slackTs = await postJoinMessage(gather, slack)
    })

    gather.subscribeToEvent('playerExits', async (data, context) => {
      console.log('player exit')
      const today = dayjs().format('YYYY-MM-DD')
      // 本日未投稿の場合
      if (slackTs?.date !== today) {
        slackTs = await postJoinMessage(gather, slack)
      } else {
        slackTs = await updateJoinMessage(gather, slack, slackTs)
      }
    })
    gather.subscribeToEvent('playerMoves', async (data, context) => {
      const { player, playerId } = context
      // gather.setTextStatus(`x: ${player?.x}, y:${player?.y}`, playerId)
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

    // 紙吹雪でプレイヤーを吹き飛ばす
    gather.subscribeToEvent('playerShootsConfetti', (data, context) => {
      const shooter = context.player
      if (!shooter) return
      const { direction } = shooter
      switch (direction) {
        case SpriteDirectionEnum_ENUM.Up:
        case SpriteDirectionEnum_ENUM.UpAlt: {
          const players = Object.keys(gather.players).forEach((key) => {
            const player = gather.players[key]
            if (player.x === shooter.x && player.y === shooter.y! + -1) {
              gather.teleport(MAP_ID, player.x!, player.y - 3, key)
            } else if (
              player.y === shooter.y! - 2 &&
              shooter.x! - 1 <= player.x &&
              player.x <= shooter.x! + 1
            ) {
              gather.teleport(MAP_ID, player.x!, player.y - 3, key)
            }
          })
          break
        }
        case SpriteDirectionEnum_ENUM.Down:
        case SpriteDirectionEnum_ENUM.DownAlt: {
          const players = Object.keys(gather.players).forEach((key) => {
            const player = gather.players[key]
            if (player.x === shooter.x && player.y === shooter.y! + 1) {
              gather.teleport(MAP_ID, player.x!, player.y + 3, key)
            } else if (
              player.y === shooter.y! + 2 &&
              shooter.x! - 1 <= player.x &&
              player.x <= shooter.x! + 1
            ) {
              gather.teleport(MAP_ID, player.x!, player.y + 3, key)
            }
          })
          break
        }
        case SpriteDirectionEnum_ENUM.Left:
        case SpriteDirectionEnum_ENUM.LeftAlt: {
          const players = Object.keys(gather.players).forEach((key) => {
            const player = gather.players[key]
            if (player.x === shooter.x! - 1 && player.y === shooter.y) {
              gather.teleport(MAP_ID, player.x! - 3, player.y, key)
            } else if (
              player.x === shooter.x! - 2 &&
              shooter.y! - 1 <= player.y &&
              player.y <= shooter.y! + 1
            ) {
              gather.teleport(MAP_ID, player.x! - 3, player.y, key)
            }
          })
          break
        }
        case SpriteDirectionEnum_ENUM.Right:
        case SpriteDirectionEnum_ENUM.RightAlt: {
          const players = Object.keys(gather.players).forEach((key) => {
            const player = gather.players[key]
            if (player.x === shooter.x! + 1 && player.y === shooter.y) {
              gather.teleport(MAP_ID, player.x! + 3, player.y, key)
            } else if (
              player.x === shooter.x! + 2 &&
              shooter.y! - 1 <= player.y &&
              player.y <= shooter.y! + 1
            ) {
              gather.teleport(MAP_ID, player.x! + 3, player.y, key)
            }
          })
          break
        }
        default:
          break
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
  // スラッシュコマンド"/players"を受信
  // @ts-ignore
  slack.command('/players', async ({ ack, say }) => {
    await ack()
    slackTs = await postJoinMessage(gather, slack)
  })
})()
