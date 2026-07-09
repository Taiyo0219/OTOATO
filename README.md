# OTOATO

OTOATOは「その場所、その時間に聴いていた一曲を残す」ための、位置情報音楽共有Webアプリです。
写真や長文ではなく、音楽、場所、時間、コメントで記憶を残します。

Phase 10では、フォロー、相互フォロー、友達限定公開、他ユーザーのプロフィール、特定日の投稿を地図と時系列でたどる「音の足あと」を追加しました。

## 主な機能

- YouTube Data API v3による楽曲・動画検索
- YouTube公式iframeでの再生
- Leaflet + OpenStreetMapによる地図表示
- Geolocation APIによる現在地取得
- 地図タップによる投稿地点の手動選択
- MongoDB Atlasへの投稿保存
- 周辺投稿、アーカイブ、投稿詳細
- ユーザー登録、ログイン、ログアウト
- JWTによるログイン状態維持
- プロフィール編集
- ユーザー検索
- フォロー / フォロー解除
- 相互フォローを「友達」として判定
- `public` / `friends` / `private` の公開範囲認可
- 他ユーザーのプロフィール閲覧
- 友達や他ユーザーの一日を音楽で追体験する「音の足あと」

## まだ実装していないこと

- DM、チャット、通知
- ソーシャルログイン
- メール認証、パスワードリセット
- 投稿編集、投稿削除
- ブロック、通報、管理画面
- 写真投稿
- Spotify連携

## 技術スタック

Frontend:

- React
- Vite
- JavaScript
- Leaflet
- OpenStreetMap

Backend:

- Node.js
- Express
- JWT
- bcryptjs
- Helmet
- express-rate-limit

Database:

- MongoDB Atlas
- Mongoose

External API:

- YouTube Data API v3
- Geolocation API

Deployment:

- Vercel
- Render

## 本番構成

```text
スマートフォン / PC
↓
Vercel
React + Vite
↓
Render
Node.js + Express
↓
MongoDB Atlas
```

RenderのバックエンドからYouTube Data API v3へ問い合わせます。
秘密情報はフロントエンドへ置きません。

## 公開URL

Frontend:

https://otoato-client.vercel.app

Backend:

https://otoato-api.onrender.com

Health Check:

https://otoato-api.onrender.com/api/health

## Local Development

```powershell
npm.cmd install
npm.cmd run dev
```

フロントエンド:

http://localhost:5173

バックエンド:

http://localhost:5000

開発環境ではフロントエンドの `/api` をVite Proxyで `http://localhost:5000` へ転送します。
同じWi-FiのスマートフォンからはViteのNetwork URL、例 `http://PCのLAN内IP:5173` へアクセスできます。

## 環境変数

実値はREADME、コード、GitHubへ書かないでください。

server/.env:

```env
PORT=5000
MONGODB_URI=
YOUTUBE_API_KEY=
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=
JWT_EXPIRES_IN=30d
```

client/.env:

```env
VITE_API_BASE_URL=
```

ローカル開発では `VITE_API_BASE_URL` は未設定のままにします。
本番ではRenderのURLを `/api` なしで指定します。

```env
VITE_API_BASE_URL=https://otoato-api.onrender.com
```

`YOUTUBE_API_KEY`、`MONGODB_URI`、`JWT_SECRET`、Database UserのパスワードはVercelへ設定しないでください。

## 認証方式

認証方式は `Authorization: Bearer <JWT>` です。
フロントエンドはJWTをlocalStorageに保存し、起動時に `/api/auth/me` でログイン状態を復元します。

## データモデル

User:

- `displayName`
- `email`
- `passwordHash`
- `bio`
- `favoriteGenres`

Follow:

- `followerId`
- `followingId`
- `createdAt`

Followは別コレクションです。
`followerId + followingId` にunique indexを張り、重複フォローを防ぎます。

Post:

- `userId`
- `track`
- `location`
- `visibility`
- `comment`
- `createdAt`

既存の匿名投稿は壊さず、原則public相当として扱います。

## 公開範囲

`public`:

誰でも閲覧できます。

`friends`:

投稿者と相互フォローのユーザーだけ閲覧できます。

`private`:

投稿者本人だけ閲覧できます。

公開範囲の判定はフロントエンド表示だけではなく、サーバー側の共通visibility条件で行います。
地図、周辺投稿、アーカイブ、投稿詳細、他ユーザー投稿、一日追体験で同じ認可ルールを使います。

## 友達判定

Phase 10では、相互フォローを友達とします。

```text
A follows B
B follows A
↓
A and B are friends
```

友達になると、相手の`friends`投稿を閲覧できます。

## 音の足あと

一日追体験機能は、ユーザーと日付を指定して、その日に閲覧可能な投稿を時系列で表示します。

```text
User + Date
↓
visibility認可
↓
投稿抽出
↓
時系列ソート
↓
地図 + 曲カード
```

地図上の番号と時系列リストの番号が対応します。
番号は投稿順を示すもので、実際の移動経路を記録・推定するものではありません。

日付検索は日本時間（Asia/Tokyo）の1日をUTC範囲へ変換し、`createdAt >= start` かつ `createdAt < nextDayStart` の半開区間で検索します。

## API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/music/search?q=検索文字`
- `POST /api/posts`
- `GET /api/posts/nearby?lat=35.0&lng=139.0&radius=1000`
- `GET /api/posts/archive?date=2026-07-07`
- `GET /api/posts/mine`
- `GET /api/posts/:id`
- `GET /api/users/me/profile`
- `PATCH /api/users/me/profile`
- `GET /api/users/search?q=表示名`
- `GET /api/users/:userId`
- `POST /api/users/:userId/follow`
- `DELETE /api/users/:userId/follow`
- `GET /api/users/:userId/followers`
- `GET /api/users/:userId/following`
- `GET /api/users/:userId/posts?date=YYYY-MM-DD`
- `GET /api/users/:userId/day-trace?date=YYYY-MM-DD`

## Vercel設定

- Framework: Vite
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_BASE_URL=https://otoato-api.onrender.com`

`VITE_API_BASE_URL` の末尾に `/api` は付けません。
`client/vercel.json` でSPA rewriteを設定しているため、直接URLを開いても `index.html` が返ります。

## Render設定

- Service: Web Service
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Environment Variables:

```env
MONGODB_URI=
YOUTUBE_API_KEY=
CLIENT_ORIGIN=https://otoato-client.vercel.app
JWT_SECRET=
JWT_EXPIRES_IN=30d
```

Phase 10で新しい環境変数は追加していません。

## MongoDB Atlas

RenderからMongoDB Atlasへ接続するには、AtlasのNetwork Access設定が必要です。
現在は接続確認のため `0.0.0.0/0` を利用しています。
これは全IPv4からの接続を許可する設定です。
本番運用では、より安全なアクセス制限方法を検討してください。

Phase 10で本番DBの既存データを一括変更する処理はありません。

## 自動デプロイ

`main` ブランチへpushすると、GitHub連携によりVercelとRenderが自動デプロイされる構成です。
基本的なコード変更では、VercelやRenderのプロジェクトを作り直す必要はありません。

## 位置情報

位置情報は `navigator.geolocation.getCurrentPosition()` で必要なときだけ取得します。
`watchPosition` による常時追跡は使用していません。

HTTPSの本番環境ではスマートフォンブラウザから現在地取得できます。
拒否された場合でも、投稿画面で「地図から場所を選ぶ」を使って投稿地点を手動選択できます。
