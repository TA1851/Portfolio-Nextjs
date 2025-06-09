## E2E テスト

### 環境変数の設定

E2Eテストでは個人のメールアドレスを環境変数として設定しています。  
プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
# E2Eテスト用環境変数
E2E_TEST_EMAIL_1=your-test-email-1@example.com
E2E_TEST_EMAIL_2=your-test-email-2@example.com
E2E_TEST_PASSWORD_1=your-password-1
E2E_TEST_PASSWORD_2=your-password-2
```

### テストの実行

ブラウザの起動
```bash
npx playwright codegen
```

ブラウザが起動したらURLを入力する

テストコードを実行する
```bash
npx playwright test e2e/users.spec.ts
```

すべてのE2Eテストを実行する
```bash
npx playwright test
```