# OTOATO

位置情報音楽共有Webアプリ OTOATO の Phase 1 - Phase 8.5 実装です。

## 実装済み

- React + Vite のクライアント構成
- Node.js + Express のサーバー構成
- MongoDB Atlas / Mongoose 接続の準備
- スマートフォン向けの基本UI
- ホーム、投稿、アーカイブ、マイページ
- 下部固定ナビゲーション
- Leaflet + OpenStreetMap の実地図表示
- getCurrentPosition による現在地取得
- 現在地取得中、成功、失敗のUI表示
- モック楽曲検索、YouTube動画選択、公式プレイヤー表示
- 現在地と選択曲を組み合わせた投稿確認UI
- MongoDBへの投稿保存API
- 現在地周辺の投稿取得
- 地図上への投稿表示
- 日付によるアーカイブ検索
- 地図から投稿地点を手動選択
- 開発環境専用のテスト地点ボタン
- YouTube Data API v3 経由の動画検索
- YouTube API失敗時のモック楽曲フォールバック
- YouTube公式iframeプレイヤーでの再生
- 投稿詳細画面

## まだ実装していないこと

- 認証
- 友達機能
- 通知
- 写真投稿
- Spotify連携
- YouTube以外の音楽プロバイダー本実装

## 起動方法

```bash
npm install
npm run dev
```

PowerShell で `npm` が実行ポリシーにより止まる場合は、以下を使用してください。

```powershell
npm.cmd install
npm.cmd run dev
```

クライアントは `http://localhost:5173`、サーバーは `http://localhost:5000` で起動します。

## 環境変数

YouTube Data APIを使う場合は `server/.env` だけ編集します。
`server/.env` が無い場合は、まず `server/.env.example` をコピーして作成してください。

```env
PORT=5000
MONGODB_URI=
YOUTUBE_API_KEY=
CLIENT_ORIGIN=http://localhost:5173
```

YouTube APIキーの設定手順:

1. `server/.env` を作成
2. `YOUTUBE_API_KEY=` の右側にAPIキーを貼る
3. `npm.cmd run dev`
4. `http://localhost:5000/api/health` を開く
5. `musicProvider` が `youtube` なら成功

`MONGODB_URI` が未設定の場合でも開発サーバーは起動し、接続はスキップされます。
投稿保存、周辺投稿、アーカイブ検索は MongoDB 接続後に利用できます。

`YOUTUBE_API_KEY` が未設定、無効、クォータ制限、通信失敗の場合は、自動的にモック楽曲検索へ切り替わります。
APIキーは必ず `server/.env` に置き、フロントエンドには置かないでください。

## YouTube検索

音楽検索は YouTube Data API v3 の `search.list` をサーバー経由で使用します。
検索は入力中に自動実行せず、検索ボタンまたは Enter キーで実行します。
同じ検索文字はサーバー内のMapで約30分キャッシュします。

YouTube動画は公式iframeプレイヤーで表示します。
動画から音声ファイルを抽出、変換、保存する処理は実装していません。

## API

- `GET /api/health`
- `GET /api/music/search?q=検索文字`
- `POST /api/posts`
- `GET /api/posts/nearby?lat=35.0&lng=139.0&radius=1000`
- `GET /api/posts/archive?date=2026-07-07`
- `GET /api/posts/:id`

## 位置情報

位置情報は `navigator.geolocation.getCurrentPosition()` で必要なときだけ取得します。
`watchPosition` による常時追跡は使用していません。

ブラウザで位置情報が拒否された場合でも、投稿画面で「地図から場所を選ぶ」を使って投稿地点を手動選択できます。
開発中は `import.meta.env.DEV === true` の場合のみ「開発用テスト地点を使用」ボタンが表示されます。
