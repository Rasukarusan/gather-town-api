import type { Game as Gather, Player } from '@gathertown/gather-game-client'
import { App as SlackApp } from '@slack/bolt'
import { SlackTs } from './types'
const dayjs = require('dayjs')

export const generatePresenceMessage = (players: Player[]) => {
  let message: string[] = []
  const newLine = () => message.push(` `)
  const writeLine = (value: string) => message.push(value)

  // Write the header.
  writeLine(`:office: There are *${players.length}* people in the office.`)
  const playerNames = players.map((player) => player.name).join(', ')
  newLine()
  if (playerNames) {
    writeLine(`:man-raising-hand: ${playerNames}`)
    newLine()
  }
  writeLine(`updated ${dayjs().format('HH:mm:ss')}`)
  newLine()
  return message.join('\n')
}

export const deleteAllMessages = async (app: SlackApp, channelId: string) => {
  const history = await app.client.conversations.history({
    channel: channelId,
  })
  // @ts-ignore
  history.messages.forEach((message) => {
    if (message?.app_id === process.env.SLACK_BOT_ID) {
      app.client.chat.delete({ channel: channelId, ts: message.ts! })
    }
  })
}

const newMessage = async (gather: Gather, slack: SlackApp) => {
  const today = dayjs().format('YYYY-MM-DD')
  await deleteAllMessages(slack, process.env.SLACK_CHANNEL_ID || '')
  const players = Object.keys(gather.players).map((key) => gather.players[key])
  const text = generatePresenceMessage(players)
  const newMessage = await slack.client.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID || '',
    mrkdwn: true,
    text,
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
  return {
    date: today,
    ts: newMessage.ts || '',
  }
}
export const updateJoinMessage = async (
  gather: Gather,
  slack: SlackApp,
  slackTs: SlackTs
): Promise<SlackTs> => {
  const today = dayjs().format('YYYY-MM-DD')
  try {
    // 本日すでに投稿済みの場合
    if (slackTs?.date === today) {
      // slackメッセージを更新
      const players = Object.keys(gather.players).map(
        (key) => gather.players[key]
      )
      const text = generatePresenceMessage(players)
      await slack.client.chat.update({
        channel: process.env.SLACK_CHANNEL_ID || '',
        ts: slackTs.ts,
        text,
      })
      return slackTs
    }
    // slackメッセージを新規投稿
    return await newMessage(gather, slack)
  } catch (e) {
    console.error('エラー', e)
    return await newMessage(gather, slack)
  }
}
