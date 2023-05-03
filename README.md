# Gather Town API

gather town の WebSocket API で遊ぶためのリポジトリ

https://app.gather.town/

## Require

```sh
$ node -v
v16.10.0
```

## Setup

`config.js.example` をコピーして `GATHER_API_KEY`、`GATHER_SPACE_ID` をセットしてください。

```sh
$ cp src/config.js.example src/config.js
$ vim src/config.js
```

- API_KEY の取得

https://app.gather.town/apikeys

- SPACE_ID の取得

ブラウザで開いたときの URL から取得できます。例えば下記のような URL の場合、  
`https://app.gather.town/app/SefvUrOwU9Omhw32/my_test_space`

```diff
module.exports = {
+  GATHER_SPACE_ID: 'SefvUrOwU9Omhw32\\my_test_space'
}
```

となります。スペース名の前の`/`は`\\`になることに注意してください。

空白を含むスペース名の場合は下記のようになります。  
`https://app.gather.town/app/SefvUrOwU9Omhw32/my%20test%20space`

```diff
module.exports = {
+  GATHER_SPACE_ID: 'SefvUrOwU9Omhw32\\my test space'
}
```

## Run

```sh
# 初回のみ実行
$ yarn

# 起動
$ yarn start
```

## 参考

- [4 時間のモブプロで Gather に鬼ごっこ機能をつくった](https://tech-blog.lapras.com/techBlogs/202208-gather-tag-game)
- https://gathertown.notion.site/Gather-Websocket-API-bf2d5d4526db412590c3579c36141063
- https://support.gather.town/help/connect
