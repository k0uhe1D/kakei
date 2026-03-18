# Contributing

## 基本方針

- 変更は小さく分けてください
- UI 変更ではスクリーンショットか説明を添えてください
- セキュリティ関連の懸念は公開 Issue ではなく `SECURITY.md` に従って報告してください

## セットアップ

```bash
npm ci
npm ci --prefix functions
cp .env.example .env
cp functions/.env.example functions/.env
```

## 開発時の確認

```bash
npm run build
```

必要に応じて Firebase 側の設定や Secrets をローカル環境に用意してください。

## PR の出し方

1. 目的を明確にする
2. 変更内容を小さく保つ
3. 動作確認結果を書く
4. 秘匿情報が含まれていないことを確認する
