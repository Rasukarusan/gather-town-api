import type { Game as Gather, Player } from '@gathertown/gather-game-client'
import { App as SlackApp } from '@slack/bolt'
import * as http from 'http'
import { initGather } from './gather'
import { deleteAllMessages, generatePresenceMessage } from './message'
import { initSlack } from './slack'
import { SlackTs } from './types'
const dayjs = require('dayjs')
require('dayjs/locale/ja')

const MAP_ID = 'office-main'
const port = process.env.PORT || 8080

const healthServerListener = () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(JSON.stringify({ result: true }))
  })
  server.listen(port)
}

let slackTs: SlackTs

const newMessage = async (game: Gather, slack: SlackApp) => {
  const today = dayjs().format('YYYY-MM-DD')
  await deleteAllMessages(slack, process.env.SLACK_CHANNEL_ID || '')
  const players = Object.keys(game.players).map((key) => game.players[key])
  const text = generatePresenceMessage(players)
  const newMessage = await slack.client.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID || '',
    mrkdwn: true,
    text,
    link_names: true,
    attachments: [
      {
        text: '',
        actions: [
          {
            text: 'Go to Gather',
            type: 'button',
            url: encodeURI(
              `https://app.gather.town/app/${process.env.GATHER_SPACE_ID}`
            ).replace('%5C', '/'),
          },
        ],
      },
    ],
  })
  slackTs = {
    date: today,
    ts: newMessage.ts || '',
  }
}
const postGatherJoinMessage = async (game: Gather, slack: SlackApp) => {
  const today = dayjs().format('YYYY-MM-DD')
  // 本日すでに投稿済みの場合
  try {
    if (slackTs?.date === today) {
      // slackメッセージを更新
      const players = Object.keys(game.players).map((key) => game.players[key])
      const text = generatePresenceMessage(players)
      await slack.client.chat.update({
        channel: process.env.SLACK_CHANNEL_ID || '',
        ts: slackTs.ts,
        text,
      })
      return
    }
    // slackメッセージを新規投稿
    await newMessage(game, slack)
  } catch (e) {
    console.error('エラー', e)
    await newMessage(game, slack)
  }
}

;(async () => {
  const game = await initGather()
  const slack = await initSlack()

  game.subscribeToConnection((connected) => {
    console.log({ connected })
    setInterval(async () => {
      await postGatherJoinMessage(game, slack)
    }, 300000) // 5分
    game.subscribeToEvent('playerJoins', async (data, context) => {
      console.log('player joined')
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
  healthServerListener()
})()
