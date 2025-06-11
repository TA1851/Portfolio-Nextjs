# Portfolio-Nextjs プロジェクト概要

## 概要
このプロジェクトはNext.jsを利用した個人ポートフォリオサイトで、記事の投稿・閲覧機能を備えています。フロントエンドにNext.js、バックエンドにAPIサーバーを使用し、E2Eテストによる品質保証が実装されています。

## 主要技術スタック
- **フロントエンド**: Next.js 15, React, TypeScript
- **スタイリング**: Tailwind CSS
- **テスト**: Playwright (E2Eテスト)
- **CI/CD**: GitHub Actions
- **デプロイ**: Vercel (https://nextjs-app-yvfr.vercel.app)

## ディレクトリ構成と主要ファイル

### `/src/app` - Next.js App Router
App Routerを使用したページとAPIルートの実装。

#### ページ構成
- **page.tsx**: トップページ
- **login/page.tsx**: ログインページ
- **register/page.tsx**: ユーザー登録ページ
- **verify-email/page.tsx**: メール認証ページ
- **change-password/page.tsx**: パスワード変更ページ
- **user/**: ユーザーダッシュボード
- **articles/[id]/page.tsx**: 記事詳細ページ
- **article_crud/**: 記事のCRUD操作ページ
  - **create/page.tsx**: 記事作成
  - **update/page.tsx**: 記事編集
  - **delete/page.tsx**: 記事削除

#### API Routes (`/src/app/api`)
- **register/route.ts**: ユーザー登録API
- **verify-email/route.ts**: メール認証プロキシAPI
- **v1/verify-email/route.ts**: v1 API認証プロキシ
- **change-password/route.ts**: パスワード変更API

### `/e2e` - E2Eテスト
Playwrightを使用したE2Eテストスクリプト。

#### テストファイル
- **crud_consistency_test.spec.ts**: 記事のCRUD操作の整合性テスト（メイン）
- **article_create.spec.ts**: 記事作成テスト
- **article_update.spec.ts**: 記事更新テスト
- **article_delete.spec.ts**: 記事削除テスト
- **register.spec.ts**: ユーザー登録テスト
- **users.spec.ts**: ユーザー操作テスト
- **existing_user_registration_test.spec.ts**: 既存ユーザー登録エラーテスト

#### テスト環境設定
- **evidence/**: テスト実行時のスクリーンショットやエビデンス
- **CLEANUP_GUIDE.md**: テストデータクリーンアップガイド

### `/.github/workflows` - CI/CD設定
GitHub Actions用のワークフロー定義ファイル。

- **e2e.yml**: E2Eテストの自動実行設定
  - **実行頻度**: 1時間おき（`cron: '0 */1 * * *'`）
  - **実行トリガー**: 定期実行のみ
  - **テスト対象**: `crud_consistency_test.spec.ts`

### `/src/utils` - ユーティリティ
- **logger.ts**: ログ機能

### 設定ファイル
- **playwright.config.ts**: Playwright設定
- **tailwind.config.ts**: Tailwind CSS設定
- **next.config.ts**: Next.js設定
- **middleware.ts**: Next.jsミドルウェア

## 主要機能

### 認証機能
- **ユーザー登録**: メールアドレスによる登録
- **メール認証**: 登録時のメール認証システム
- **ログイン/ログアウト**: セッション管理
- **パスワード変更**: 初回ログイン時の強制パスワード変更

### 記事管理機能（CRUD）
- **記事作成**: タイトルと本文による記事投稿
- **記事閲覧**: 記事一覧と詳細表示
- **記事更新**: 既存記事の編集
- **記事削除**: 記事の削除機能

### UI/UX機能
- **レスポンシブデザイン**: モバイル対応
- **エラーハンドリング**: 適切なエラーメッセージ表示
- **ローディング状態**: 操作中の視覚的フィードバック

## テスト自動化

### E2Eテスト詳細
- **実行環境**: GitHub Actions (Ubuntu latest)
- **ブラウザ**: Chromium, Firefox, WebKit
- **実行頻度**: 1時間おき
- **メインテスト**: `crud_consistency_test.spec.ts`
  - 記事の作成→確認→削除の完全フロー
  - UIフィードバック対応
  - データ整合性チェック

### テストレポート
- **保存期間**: 30日間
- **アーティファクト**: GitHub Actions内で確認可能
- **デバッグ**: 詳細なログとスクリーンショット

## 環境変数とシークレット

### 必要な環境変数
```bash
NEXT_PUBLIC_API_URL_V1=<バックエンドAPI URL>
NEXT_PUBLIC_FRONTEND_URL=<フロントエンドURL>
```

### GitHub Secrets（テスト用）
```bash
E2E_TEST_EMAIL_1=<テスト用メールアドレス1>
E2E_TEST_PASSWORD_1=<テスト用パスワード1>
E2E_TEST_EMAIL_2=<テスト用メールアドレス2>
E2E_TEST_PASSWORD_2=<テスト用パスワード2>
NEXT_PUBLIC_API_URL_V1_E2E=<E2Eテスト用API URL>
```

## セキュリティ対策
- **認証トークン**: JWT使用
- **環境変数**: 機密情報の適切な管理
- **CORS設定**: APIアクセス制御
- **パスワード強度**: 最低8文字の要求
- **入力検証**: フロントエンド・バックエンド双方での検証

## 最近の修正点

### ログイン制限の修正
- **問題**: メールアドレスが`@gmail.com`のみに制限されていた
- **修正**: 任意のドメインのメールアドレスでログイン可能に変更
- **影響**: `testuser@example.com`などのテストユーザーでもログイン可能

### テスト自動化の改善
- **スケジュール**: 1時間おきの定期実行
- **対象**: CRUD整合性テストに特化
- **安定性**: 環境変数のフォールバック機能追加

## 開発・運用フロー

### デプロイメント
1. GitHub へのプッシュ
2. Vercel での自動デプロイ
3. E2Eテストによる品質確認

### 品質保証
1. 定期的なE2Eテスト実行（1時間おき）
2. テスト失敗時の自動通知
3. レポートによる詳細分析

## 今後の改善点
- **パフォーマンス最適化**: 画像最適化、コード分割
- **アクセシビリティ向上**: WAI-ARIA対応
- **機能追加**: 
  - コメント機能
  - タグ機能
  - 検索機能
  - 記事カテゴリ
- **セキュリティ強化**: 2FA、レート制限
- **モニタリング**: エラー追跡、パフォーマンス監視

## トラブルシューティング

### よくある問題
1. **ログインできない**
   - メールアドレスの形式を確認
   - パスワードが正しいか確認
   - メール認証が完了しているか確認

2. **E2Eテスト失敗**
   - GitHub Secretsの設定確認
   - テスト用ユーザーの認証状態確認
   - API接続状況確認

3. **デプロイエラー**
   - 環境変数の設定確認
   - ビルドエラーの確認
   - 依存関係の確認

### サポート情報
- **リポジトリ**: https://github.com/TA1851/Portfolio-Nextjs
- **デプロイURL**: https://nextjs-app-yvfr.vercel.app
- **E2Eテスト履歴**: GitHub Actions タブで確認可能
