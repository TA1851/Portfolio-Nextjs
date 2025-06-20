# Portfolio-Nextjs プロジェクト概要

## 概要
このプロジェクトはNext.jsを利用した個人ポートフォリオサイトで、記事の投稿・閲覧機能を備えています。フロントエンドにNext.js、バックエンドにAPIサーバーを使用し、E2Eテストによる品質保証が実装されています。

## 主要技術スタック
- **使用言語**：Typescript(5.7.3)
- **フロントエンド**: React(19.0.0)
- **フレームワーク**：Nextjs(15.3.1)
- **CSSフレームワーク**：TailwindCSS(3.4.1)
- **テスト**: Playwright
- **CI/CD**: GitHub Actions
- **デプロイ**: Vercel

## ディレクトリ構成と主要ファイル

### `/api` - APIクライアント
APIとの通信を担当するファイル群です。
- **apiClient.ts**: 基本的なAPI通信設定
- **auth.ts**: 認証関連のAPI呼び出し
- **articles.ts**: 記事関連のAPI呼び出し
- **users.ts**: ユーザー関連のAPI呼び出し
- **types.ts**: 共通の型定義

### `/components` - UIコンポーネント
再利用可能なUIコンポーネントを格納しています。
- **ヘッダー/フッター**: サイト共通のナビゲーション
- **記事コンポーネント**: 記事表示用UI
- **フォーム**: ログイン/記事投稿などのフォームコンポーネント
- **共通UI要素**: ボタン、カード、アラートなど

### `/pages` - ページコンポーネント
Next.jsのファイルベースルーティングに対応するページコンポーネント。
- **index.tsx**: トップページ
- **login.tsx**: ログインページ
- **articles/[id].tsx**: 記事詳細ページ
- **articles/create.tsx**: 記事作成ページ
- **articles/edit/[id].tsx**: 記事編集ページ
- **api/**: Next.js API Routes (サーバーサイドAPI)

### `/e2e` - E2Eテスト
Playwrightを使用したE2Eテストスクリプト。
- **crud_consistency_test.spec.ts**: 記事のCRUD操作の整合性をテスト

### `/.github/workflows` - CI/CD設定
GitHub Actions用のワークフロー定義ファイル。
- **e2e.yml**: E2Eテストの自動実行設定（1時間おきに実行）

### `/public` - 静的ファイル
画像、アイコンなどの静的リソース。

### `/styles` - スタイル定義
CSSモジュールやグローバルスタイル。

## 主要機能

### 認証機能
- ユーザー登録/ログイン
- セッション管理

### 記事管理機能
- 記事の作成/閲覧/更新/削除（CRUD）

### その他機能
- レスポンシブデザイン

## テスト自動化

### E2Eテスト
- **実行頻度**: 1時間おき（GitHub Actions）
- **実行トリガー**: 定期実行
- **テスト内容**: 記事のCRUD操作の整合性確認

### テストレポート
- GitHub Actionsでの実行結果は30日間保存
- テスト結果はアーティファクトとして確認可能

## デプロイメントフロー
- GitHub Actions経由で自動デプロイ
- テスト成功後に本番環境へデプロイ

## セキュリティ対策
- 環境変数による認証情報の保護
- GitHub Secretsの活用
- CSRF対策

## 今後の改善点
- パフォーマンス最適化
- アクセシビリティ向上
- 機能追加（検索機能、デモ）