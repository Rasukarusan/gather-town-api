# Gather Town API

[Gather](https://app.gather.town/) の WebSocket API で遊ぶためのリポジトリ

|  |  |
| :---: | :---: |
|  <img src="https://user-images.githubusercontent.com/17779386/236443642-8eb7d1da-3454-421f-a96d-34d5f488777f.gif" width="300"/> |  <img src="https://user-images.githubusercontent.com/17779386/236444474-becdf142-1872-46c3-9ca0-fb3d7026761f.gif" width="400" />|
| 吹き飛ばし  | 障害物すり抜け |
|<img src="https://user-images.githubusercontent.com/17779386/236446040-a5c05664-4cfa-4b3c-998f-85ea6359b89f.gif" width="300" />| <img width="310" alt="image" src="https://user-images.githubusercontent.com/17779386/236445133-8453f7f0-0f8a-489c-8c73-5710a9dde41e.png">|||
|テレポート|slack通知|

## Require

```sh
$ node -v
v16.10.0
```

## Setup

`env.example` をコピーして `GATHER_API_KEY`、`GATHER_SPACE_ID` をセットしてください。

```sh
$ cp .env.example .env
$ vim .env
```

- API_KEY の取得

https://app.gather.town/apikeys

- SPACE_ID の取得

ブラウザで開いたときの URL から取得できます。例えば下記のような URL の場合、  
`https://app.gather.town/app/SefvUrOwU9Omhw32/my_test_space`

```sh
GATHER_SPACE_ID='SefvUrOwU9Omhw32\my_test_space'
```

空白を含むスペース名の場合は下記のようになります。  
`https://app.gather.town/app/SefvUrOwU9Omhw32/my%20test%20space`

```sh
GATHER_SPACE_ID='SefvUrOwU9Omhw32\my test space'
```

## Run

```sh
# 初回のみ実行
$ yarn

# 起動
$ yarn dev
```

## 参考

- [4 時間のモブプロで Gather に鬼ごっこ機能をつくった](https://tech-blog.lapras.com/techBlogs/202208-gather-tag-game)
- https://gathertown.notion.site/Gather-Websocket-API-bf2d5d4526db412590c3579c36141063
- https://support.gather.town/help/connect
- https://github.com/Assembless/gather-town-x-slack
