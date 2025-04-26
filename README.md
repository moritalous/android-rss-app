# RSS Reader for Android

これはRSSリーダーアプリです。Android向けのアプリです。

- Bubblewrapを使って、TWA（Trusted Web Activity）で構築しています。
- 設定画面にRSSフィードのURLを入力します。複数入力可能です。
- 入力されたRSSフィードを取得し、メイン画面に一覧表示します。日付順（新→旧）、日付順（旧→新）でソートができます。
- フィルター機能として、「すべて」「未読のみ」を提供します。
- スクロールして画面外に出たものは既読とします。

## 技術スタック

- React + TypeScript
- Vite
- PWA対応
- Bubblewrap（TWA）

## 開発方法

### 前提条件

- Node.js
- npm
- Android Studio（TWAビルド用）
- Bubblewrap CLI

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### ビルド

```bash
# プロダクションビルド
npm run build
```

### TWAへの変換（Bubblewrapを使用）

```bash
# Bubblewrapのインストール（初回のみ）
npm install -g @bubblewrap/cli

# プロジェクトの初期化
bubblewrap init --manifest=https://your-deployed-url.com/manifest.json

# Androidアプリのビルド
bubblewrap build
```

## 機能

- 複数のRSSフィードを登録・管理
- フィードの一覧表示
- 日付順でのソート（新→旧、旧→新）
- 既読/未読フィルター
- スクロールによる自動既読化
- オフライン対応（PWA）

## ライセンス

MIT
