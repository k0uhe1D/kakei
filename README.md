# kakei

Firebase と React で構築した家計管理アプリです。月次予算の管理、実績の記録、レシート OCR、世帯共有を 1 つのアプリで扱えます。

## 主な機能

- 月次予算の登録と収支の見える化
- 実績の手動登録と家計簿ビュー
- レシート画像のアップロードと OCR 連携
- 匿名ログイン、Google ログイン、メールリンク認証
- 個人単位 / 世帯単位のデータ管理
- Firebase Hosting / Firestore / Storage / Cloud Functions を使った構成

## 技術スタック

- Frontend: React 19, Vite 6
- Backend: Firebase Authentication, Firestore, Cloud Storage, Cloud Functions for Firebase
- AI: Gemini 2.0 Flash
- CI/CD: GitHub Actions

## セットアップ

### 前提

- Node.js 22
- npm
- Firebase プロジェクト

### 1. 依存関係をインストール

```bash
npm ci
npm ci --prefix functions
```

### 2. フロントエンド用の環境変数を設定

ルートに `.env` を作成し、`.env.example` を元に設定してください。

```bash
cp .env.example .env
```

### 3. Functions 用の環境変数を設定

`functions/.env` を作成し、`functions/.env.example` を元に設定してください。

```bash
cp functions/.env.example functions/.env
```

必要な値:

- `ENCRYPTION_KEY`: 64 文字の hex 文字列。Gemini API キーの暗号化に使用します。

生成例:

```bash
openssl rand -hex 32
```

## 起動方法

フロントエンド:

```bash
npm run dev
```

ビルド:

```bash
npm run build
```

## デプロイ

GitHub Actions で以下を利用します。

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT`

公開リポジトリにする場合でも、上記は GitHub Secrets にのみ保持してください。

## セキュリティメモ

- `.env` と `functions/.env` はコミットしない前提です。
- Firebase の Web 設定値はクライアント配布前提ですが、Firestore Rules / Storage Rules / Authentication 制約は必須です。
- Gemini API キーは Cloud Functions 側で暗号化して保存する設計です。
- `public/seed.json` は公開用のサンプルデータです。実データは含めないでください。

## 現状の注意点

- このリポジトリには未コミットの変更があります。公開前に、意図して公開するファイルだけを選んでコミットしてください。
- ライセンスはまだ明示していません。public にするなら `MIT` などのライセンス追加を推奨します。
