import type { Game as Gather, Player } from '@gathertown/gather-game-client'
import { App as SlackApp } from '@slack/bolt'

const generateJoinMessage = (players: Player[]) => {
  let message: string[] = []
  const newLine = () => message.push(` `)
  const writeLine = (value: string) => message.push(value)
  writeLine(`:office: There are *${players.length}* people in the office.`)
  const playerNames = players.map((player) => player.name).join(', ')
  newLine()
  if (playerNames) {
    writeLine(`:man-raising-hand: ${playerNames}`)
    newLine()
  }
  newLine()
  return message.join('\n')
}

const deleteAllMessages = async (app: SlackApp, channelId: string) => {
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

export const postJoinMessage = async (gather: Gather, slack: SlackApp) => {
  await deleteAllMessages(slack, process.env.SLACK_CHANNEL_ID || '')
  const players = Object.keys(gather.players).map((key) => gather.players[key])
  const text = generateJoinMessage(players)
  await slack.client.chat.postMessage({
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
}
