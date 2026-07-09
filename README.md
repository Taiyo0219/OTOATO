# OTOATO

OTOATOは「その場所、その時間に聴いていた一曲を残す」ための、位置情報音楽共有Webアプリです。
写真や長文ではなく、場所、日付、時間、音楽を組み合わせて記憶を残す体験を目指しています。

## 主な機能

- YouTube Data API v3による楽曲・動画検索
- YouTube公式iframeでの再生
- Leaflet + OpenStreetMapによる地図表示
- Geolocation APIによる現在地取得
- 現在地取得失敗時の地図タップによる手動地点選択
- 曲、位置、日時、公開範囲、コメントをMongoDB Atlasへ保存
- 周辺投稿、アーカイブ、投稿詳細の表示
- ユーザー登録、ログイン、ログアウト
- JWTによるログイン状態維持
- ログインユーザーの投稿保存と自分の投稿一覧
- Vercel + Render + MongoDB Atlasでの本番公開

## まだ実装していないこと

- フォロー、友達申請、DM
- 通知
- ソーシャルログイン
- 投稿編集、投稿削除
- 写真投稿
- Spotify連携
- YouTube以外の音楽プロバイダー本実装

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

ルートから起動できます。

```bash
npm install
npm run dev
```

PowerShellで `npm` が実行ポリシーにより止まる場合は、以下を使用してください。

```powershell
npm.cmd install
npm.cmd run dev
```

フロントエンド:

http://localhost:5173

バックエンド:

http://localhost:5000

スマートフォンから同じWi-Fi内で確認する場合は、ViteのNetwork URL、例 `http://PCのLAN内IP:5173` へアクセスします。
開発環境ではフロントエンドの `/api` をVite Proxyで `http://localhost:5000` へ転送します。

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

## YouTube API設定

1. `server/.env` を作成
2. `YOUTUBE_API_KEY=` の右側にAPIキーを貼る
3. `npm.cmd run dev`
4. `http://localhost:5000/api/health` を開く
5. `musicProvider` が `youtube` なら成功

YouTube APIキーが未設定、無効、クォータ制限、通信失敗の場合は、自動的にモック楽曲検索へ切り替わります。

## Phase 9 認証

認証方式は `Authorization: Bearer <JWT>` を採用しています。

理由:

- VercelとRenderが別オリジンでもCookie属性に依存せず実装できる
- 既存のCORS設定を大きく変えずに済む
- スマートフォンブラウザでも扱いやすい
- ポートフォリオとしてAPI認証の流れを説明しやすい

フロントエンドはJWTをlocalStorageに保存し、ページ更新後に `/api/auth/me` で現在ユーザーを復元します。
httpOnly Cookie方式はより堅牢にできますが、SameSite、Secure、credentials、CORSの設計が増えるため、Phase 9では見送りました。

投稿の扱い:

- 未ログインでも閲覧、検索、地図、アーカイブは利用可能
- 投稿保存はログイン必須
- 新しい投稿には `userId` が保存される
- 既存の匿名投稿はそのまま表示される
- `private` 投稿は本人の投稿一覧と本人の詳細表示で確認可能
- `friends` は友達機能が未実装のため、フロントエンドでは選択不可

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

## Vercel設定

Project Name:

otoato-client

Framework:

Vite

Root Directory:

client

Build Command:

```bash
npm run build
```

Output Directory:

dist

Environment Variables:

```env
VITE_API_BASE_URL=https://otoato-api.onrender.com
```

`VITE_API_BASE_URL` の末尾に `/api` は付けません。
`client/vercel.json` でSPA rewriteを設定しているため、`/post`、`/archive`、`/posts/:id`、`/mypage`、`/auth` を直接開いても `index.html` が返ります。

## Render設定

Service:

Web Service

Root Directory:

server

Build Command:

```bash
npm install
```

Start Command:

```bash
npm start
```

Health Check Path:

```text
/api/health
```

Environment Variables:

```env
MONGODB_URI=
YOUTUBE_API_KEY=
CLIENT_ORIGIN=https://otoato-client.vercel.app
JWT_SECRET=
JWT_EXPIRES_IN=30d
```

`JWT_SECRET` はPhase 9で追加が必要です。
十分に長いランダムな文字列をRenderのEnvironment Variablesへ設定してください。
実値はREADMEやGitHubへ書かないでください。

## MongoDB Atlas

RenderからMongoDB Atlasへ接続するには、AtlasのNetwork Access設定が必要です。
現在は接続確認のため `0.0.0.0/0` を利用しています。
これは全IPv4からの接続を許可する設定です。
本番運用では、より安全なアクセス制限方法を検討してください。

既存の接続設定をコードから変更する処理はありません。

## 自動デプロイ

`main` ブランチへpushすると、GitHub連携によりVercelとRenderが自動デプロイされる構成です。
基本的なコード変更では、VercelやRenderのプロジェクトを作り直す必要はありません。

## 位置情報

位置情報は `navigator.geolocation.getCurrentPosition()` で必要なときだけ取得します。
`watchPosition` による常時追跡は使用していません。

HTTPSの本番環境ではスマートフォンブラウザから現在地取得できます。
拒否された場合でも、投稿画面で「地図から場所を選ぶ」を使って投稿地点を手動選択できます。
