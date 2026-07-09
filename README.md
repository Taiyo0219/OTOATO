# OTOATO

> その場所、その時間に聴いていた一曲を残す。

OTOATOは、場所と時間に一曲を残し、自分や友人の記憶を音楽で振り返る位置情報音楽共有Webアプリです。

写真や長文ではなく、**音楽 × 場所 × 時間** によって記憶を残します。友人がその日にどこで、どんな音楽を残したかを、地図と時系列からたどる「音の足あと」により、その人の一日を写真ではなく音楽で追体験できます。

## 公開URL

https://otoato-client.vercel.app

スマートフォンでの利用を重視して設計しています。位置情報を試す場合は、HTTPS環境の本番URLでの確認を推奨します。

## OTOATOとは

OTOATOは、ユーザーがその場で選んだ一曲を、位置情報・日時・コメントと一緒に投稿できるサービスです。

自動的に再生履歴を共有するのではなく、ユーザー自身が「この場所にこの曲を残したい」と思った一曲だけを選びます。そのため、単なる音楽ログではなく、場所に紐付いた個人的な記憶として音楽を残せる体験を目指しました。

## 制作背景

SNSでは、写真や文章によって出来事を共有することが一般的です。一方で、写真を撮っていなかった日でも、その時に聴いていた曲をきっかけに、場所や感情、景色を思い出すことがあります。

OTOATOでは、写真を撮らなくても、長い文章を書かなくても、その場で選んだ一曲から記憶を残せる体験を考えました。

写真を中心にしないことで、既存の写真SNSとの差別化だけでなく、位置情報と写真を同時に公開することへの心理的・プライバシー面の負担も軽くできると考えています。

## OTOATOでできること

### 1. その場所に一曲を残す

YouTubeから曲を検索し、現在地または地図上で選んだ場所に投稿できます。コメントと公開範囲を設定し、自分の意思で一曲だけを残します。

### 2. 場所や日付から音楽の記憶を振り返る

地図上で周辺の投稿を確認したり、日付を指定して過去の投稿をアーカイブとして振り返ることができます。

### 3. 音楽を通して人とつながる

ユーザー検索、フォロー、相互フォローに対応しています。相互フォローしたユーザー同士は「友達」として扱い、友達限定の投稿を共有できます。

### 4. 「音の足あと」で一日を追体験する

ユーザーと日付を選ぶと、その日に閲覧可能な投稿が地図と時系列で表示されます。地図上の番号と曲カードの番号が対応しており、友人がどこでどんな音楽を残したかを順番にたどれます。

## 音の足あと

「音の足あと」は、OTOATOの中心的な体験です。

特定のユーザーと日付を選ぶと、その日に残された閲覧可能な投稿を時系列順に取得し、地図と曲カードで表示します。

```text
ユーザー + 日付
↓
閲覧権限を判定
↓
投稿を時系列で取得
↓
地図の番号 + 曲カードの番号で対応
```

これはGPSの移動履歴を自動追跡する機能ではありません。ユーザーが自分で投稿した地点を、投稿時刻順に並べて表示することで、その人の一日を音楽から振り返るための機能です。

## 主な機能

音楽・投稿:

- YouTube Data API v3による楽曲・動画検索
- YouTube公式iframeでの再生
- 曲、位置、日時、コメントを紐付けた投稿
- 投稿時の公開範囲設定

地図・振り返り:

- Leaflet + OpenStreetMapによる地図表示
- Geolocation APIによる現在地取得
- 地図タップによる投稿地点の手動選択
- 周辺投稿、日付アーカイブ、投稿詳細
- 「音の足あと」による日付別の時系列表示

アカウント・つながり:

- ユーザー登録、ログイン、ログアウト
- JWTによるログイン状態維持
- プロフィール編集
- ユーザー検索
- フォロー / フォロー解除
- 相互フォローによる友達判定

公開範囲:

- `public`: 誰でも閲覧可能
- `friends`: 相互フォローのユーザーのみ閲覧可能
- `private`: 投稿者本人のみ閲覧可能

## 技術的な工夫

### 公開範囲をサーバー側で一元管理

`public / friends / private` の閲覧制御は、フロントエンドでボタンを隠すだけではなく、バックエンドの共通visibilityロジックで処理しています。

同じ認可ルールを、地図、周辺投稿、アーカイブ、投稿詳細、他ユーザー投稿、音の足あとに適用することで、画面によって非公開投稿が漏れるリスクを減らしています。

### Followを別コレクションで管理

フォロー関係はUser内の配列ではなく、`followerId` と `followingId` を持つFollowコレクションとして設計しました。

`followerId + followingId` の複合unique indexで重複フォローを防ぎ、相互フォロー判定を行っています。将来的に通知、ブロック、ミュートなどを追加する場合も拡張しやすい構成です。

### 位置情報を常時追跡しない設計

位置情報は `navigator.geolocation.getCurrentPosition()` で必要なときだけ取得します。`watchPosition` による常時追跡は行っていません。

現在地取得が拒否された場合でも、地図上で投稿地点を手動選択できます。位置情報を扱うアプリとして、利便性とプライバシーのバランスを意識しました。

### 日本時間の日付検索

日付検索や「音の足あと」では、日本時間の1日をUTC範囲へ変換してMongoDBを検索しています。

Renderなどサーバー環境のタイムゾーンに依存せず、日本のユーザーが選んだ日付と表示結果がずれないようにしています。

### フロントエンドとバックエンドの分離

フロントエンドはVercel、バックエンドはRender、データベースはMongoDB Atlasに分離しています。

YouTube APIキーやMongoDB URIなどの秘密情報はフロントエンドに置かず、YouTube検索もNode.jsバックエンド経由で実行します。

## システム構成

```text
Browser
  ↓
Vercel
React + Vite
  ↓ REST API
Render
Node.js + Express
  ├─ MongoDB Atlas
  └─ YouTube Data API v3
```

Backend:

https://otoato-api.onrender.com

Health Check:

https://otoato-api.onrender.com/api/health

## 技術スタック

| Category | Technology |
| --- | --- |
| Frontend | React, Vite, JavaScript |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| Map | Leaflet, OpenStreetMap |
| External API | YouTube Data API v3, Geolocation API |
| Security | Helmet, express-rate-limit |
| Deployment | Vercel, Render |

## 開発で苦労した点

### ローカルPCとスマートフォンでAPI接続先が変わる問題

当初、フロントエンドのAPI接続先が `localhost:5000` に固定されていたため、スマートフォンからアクセスするとスマートフォン自身のlocalhostを参照してしまう問題がありました。

開発環境ではVite Proxyで `/api` をExpressへ転送し、本番環境では `VITE_API_BASE_URL` でRenderのURLへ切り替える構成にしました。これにより、PCと同一LAN内のスマートフォン、本番Vercel環境の両方で同じAPIクライアントを利用できます。

### 位置情報とHTTPS

スマートフォンブラウザでは、HTTPのLAN URLではGeolocation APIが利用できない場合があります。

本番環境をVercelでHTTPS化し、位置情報取得を確認できる構成にしました。また、位置情報が拒否されても投稿体験が止まらないよう、地図から場所を選ぶフォールバックを用意しました。

### 非公開投稿の認可

友達限定投稿や自分だけの投稿は、画面表示だけで制御するとAPI直接アクセスで漏れる可能性があります。

そのため、投稿取得API側で共通のvisibility条件を組み立て、どの画面から取得しても同じ認可ルールが適用されるようにしました。

## 今後の展望

- 投稿削除・編集によるコンテンツ管理性の向上
- 「音の足あと」で投稿のある日を見つけやすくするカレンダー表示
- フォロー成立時のUX改善
- 認証情報の保存方式を含むセキュリティ設計の改善
- 音楽の振り返り体験を高める表示・検索機能の追加

## ローカルでの起動方法

ルートディレクトリで依存関係をインストールします。

```bash
npm install
```

フロントエンドとバックエンドをまとめて起動します。

```bash
npm run dev
```

起動後のURL:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

Windows PowerShellで `npm` が実行ポリシーにより止まる場合は、`npm.cmd` を使用します。

```powershell
npm.cmd install
npm.cmd run dev
```

個別に起動する場合:

```bash
npm run dev:client
npm run dev:server
```

## 環境変数

`.env.example` をコピーし、必要な値を設定してください。秘密情報をGitへcommitしないでください。

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

ローカル開発では `VITE_API_BASE_URL` は未設定のまま使用します。本番ではRenderのURLを `/api` なしで指定します。

```env
VITE_API_BASE_URL=https://otoato-api.onrender.com
```

## デプロイ

Frontend:

- Vercel
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_BASE_URL`

Backend:

- Render
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Database:

- MongoDB Atlas
- RenderからAtlasへ接続できるよう、Network Access設定が必要です
- 本番運用では接続元を必要な範囲に制限することを推奨します

## API概要

代表的なAPI:

- `/api/auth/*`: ユーザー登録、ログイン、現在ユーザー取得
- `/api/posts/*`: 投稿作成、周辺投稿、アーカイブ、投稿詳細
- `/api/users/*`: プロフィール、ユーザー検索、フォロー、音の足あと
- `/api/music/search`: YouTube Data API v3を利用した楽曲検索
