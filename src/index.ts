import * as http from 'http'
import { initGather } from './gather'
import { initSlack } from './slack'
const MAP_ID = 'office-main'
const port = process.env.PORT || 8080

const healthServerListener = () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(JSON.stringify({ result: true }))
  })
  server.listen(port)
}

;(async () => {
  const game = await initGather()
  const slack = await initSlack()

  // @ts-ignore
  slack.message('hello', async ({ message, say }) => {
    // イベントがトリガーされたチャンネルに say() でメッセージを送信します
    await say(`Hey there <@${message.user}>!`)
  })

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
  healthServerListener()
})()
