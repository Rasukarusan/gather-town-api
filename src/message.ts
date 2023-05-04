import type { Player } from '@gathertown/gather-game-client'
const { App } = require('@slack/bolt')
const dayjs = require('dayjs')

export const generatePresenceMessage = (players: Player[]) => {
  let message: string[] = []
  const newLine = () => message.push(` `)
  const writeLine = (value: string) => message.push(value)

  // Write the header.
  writeLine(`:office: There are *${players.length}* people in the office.`)
  const playerNames = players.map((player) => player.name).join(', ')
  newLine()
  writeLine(`:man-raising-hand: ${playerNames}`)
  newLine()
  writeLine(`updated ${dayjs().format('hh:mm:ss')}`)
  newLine()
  return message.join('\n')
}

export const deleteAllMessages = async (app: typeof App, channelId: string) => {
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
