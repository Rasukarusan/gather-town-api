import type { Game as Gather, Player } from '@gathertown/gather-game-client'
import { App as SlackApp } from '@slack/bolt'
import * as http from 'http'
import { initGather } from './gather'
import {
  deleteAllMessages,
  generatePresenceMessage,
  postGatherJoinMessage,
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
    const interval = process.env.APP_ENV === 'development' ? 3000 : 300000
    setInterval(async () => {
      slackTs = await postGatherJoinMessage(gather, slack, slackTs)
    }, interval)
    gather.subscribeToEvent('playerJoins', async (data, context) => {
      console.log('player joined')
      console.log(context)
    })

    gather.subscribeToEvent('playerExits', async (data, context) => {
      console.log('player exit', context)
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
  })
})()
