## E2E テスト

ブラウザの起動
```bash
npx playwright codegen
```

ブラウザが起動したらURLを入力する

テストコードを実行する
```bash
npx playwright test e2e/users.spec.ts
```