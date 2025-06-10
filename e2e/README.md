# E2E テスト

このディレクトリには、アプリケーションのエンドツーエンド（E2E）テストが含まれています。

## 📁 テストファイル構成

### 🔧 **コア機能テスト**
- `crud_consistency_test.spec.ts` - **記事CRUD操作の包括的整合性テスト**
- `article_create.spec.ts` - 記事作成機能テスト
- `article_update.spec.ts` - 記事更新機能テスト
- `article_delete.spec.ts` - 記事削除機能テスト

### 👤 **ユーザー管理テスト**
- `users.spec.ts` - ユーザー管理機能テスト
- `register.spec.ts` - ユーザー登録機能テスト

### 🐛 **その他の機能テスト**
- `bug-report.spec.ts` - バグレポート機能テスト

### 📋 **テスト証跡**
- `evidence/` - テスト実行時の証跡・スクリーンショット

## 🔧 環境変数の設定

E2Eテストでは許可されたメールアドレス（`taosaka1851@gmail.com`）を環境変数として設定しています。  
プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
# E2Eテスト用環境変数
E2E_TEST_EMAIL_1=taosaka1851@gmail.com
E2E_TEST_EMAIL_2=taosaka1851@gmail.com
E2E_TEST_PASSWORD_1=your-password-1
E2E_TEST_PASSWORD_2=your-password-2
```

## 🚀 テストの実行

### 全テスト実行（推奨）
```bash
npx playwright test
```

### 特定のテスト実行
```bash
# 記事CRUD整合性テスト（最重要）
npx playwright test e2e/crud_consistency_test.spec.ts

# 個別機能テスト
npx playwright test e2e/article_create.spec.ts
npx playwright test e2e/users.spec.ts
npx playwright test e2e/register.spec.ts
```

### ブラウザ表示付きテスト
```bash
npx playwright test --headed
```

### 特定ブラウザでのテスト
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### テストコード生成（開発時）
```bash
npx playwright codegen
```

### テストレポート表示
```bash
npx playwright show-report
```

## 🎯 重要なテスト

### `crud_consistency_test.spec.ts` 
**最も重要なテスト**です。このテストは：
- 記事の作成・確認・削除の完全なフローを検証
- 複数記事での整合性確認
- UIフィードバック機能の動作確認
- 全ブラウザでの一貫性検証

このテストが通ることで、アプリケーションの核となる記事管理機能の品質が保証されます。

## 📊 テスト品質保証

- **UIフィードバック検証**: 成功・エラーメッセージの表示確認
- **データ整合性**: 作成・更新・削除操作の確実な反映
- **ブラウザ互換性**: Chromium、Firefox、WebKit対応
- **環境変数**: 本番環境に影響しない安全なテスト設計