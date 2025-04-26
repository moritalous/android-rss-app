# Android RSS Reader アプリ実装メモ

## プロジェクト概要

このプロジェクトは、React + TypeScriptを使用したAndroid向けRSSリーダーアプリです。Viteでプロジェクトを構築し、BubblewrapによるTWA（Trusted Web Activity）でAndroidアプリ化します。

## 主要機能

- 複数のRSSフィードURLを設定画面で管理
- フィードの一覧表示（日付順でソート可能）
- 「すべて」と「未読のみ」のフィルター機能
- スクロールによる自動既読管理
- CORSプロキシの有効/無効切り替え機能

## 実装したコンポーネント

1. **App.tsx**: メインアプリケーションコンポーネント
2. **Header.tsx**: ソート、フィルター、設定ボタンを含むヘッダー
3. **FeedList.tsx**: フィードアイテムのリスト表示
4. **FeedItem.tsx**: 個別のフィードアイテム（Intersection Observerで既読管理）
5. **SettingsModal.tsx**: RSSフィードURL管理とプロキシ設定モーダル

## サービス

- **rssService.ts**: RSSフィードの取得、解析、保存などの機能
- **corsProxyService.ts**: CORSプロキシの管理と切り替え機能

## 技術的な特徴

- XMLパーサー（fast-xml-parser）を使用したRSSフィードの直接解析
- DOMPurifyによるHTMLコンテンツのサニタイズ
- Intersection Observerを使用したスクロール検知
- ローカルストレージによるフィード設定と既読状態の永続化
- CORSプロキシ切り替え機能（外部サイトのRSSフィード取得用）

## PWA対応

- マニフェストファイル設定
- Service Worker実装によるオフライン対応
- レスポンシブデザイン

## TWA（Trusted Web Activity）対応

Bubblewrapを使用してAndroidアプリ化する準備が整っています。

## 今後の課題

1. アイコンの作成と設定
2. Bubblewrapによる実際のAndroidアプリビルド
3. パフォーマンス最適化
4. ユニットテストの追加
5. 複数のRSSフォーマット（RSS 1.0、RSS 2.0、Atom）への対応強化
6. 画像のキャッシュ機能の改善

## 参考リソース

- [Bubblewrap ドキュメント](https://github.com/GoogleChromeLabs/bubblewrap)
- [PWA ドキュメント](https://web.dev/progressive-web-apps/)
- [Intersection Observer API](https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API)
- [Fast XML Parser](https://github.com/NaturalIntelligence/fast-xml-parser)
- [DOMPurify](https://github.com/cure53/DOMPurify)
