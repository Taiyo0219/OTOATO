# OTOATO

位置情報音楽共有Webアプリ OTOATO の Phase 1 / Phase 2 実装です。

## 実装済み

- React + Vite のクライアント構成
- Node.js + Express のサーバー構成
- MongoDB Atlas / Mongoose 接続の準備
- スマートフォン向けの基本UI
- ホーム、投稿、アーカイブ、マイページ
- 下部固定ナビゲーション
- モック楽曲、モック投稿データ

## まだ実装していないこと

- Leaflet / OpenStreetMap の実地図表示
- 位置情報取得
- 投稿保存API
- Apple Music API連携
- 認証

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

サーバー側で MongoDB に接続する場合は `server/.env` を作成してください。

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
APPLE_MUSIC_DEVELOPER_TOKEN=
CLIENT_ORIGIN=http://localhost:5173
```

`MONGODB_URI` が未設定の場合でも開発サーバーは起動し、接続はスキップされます。
