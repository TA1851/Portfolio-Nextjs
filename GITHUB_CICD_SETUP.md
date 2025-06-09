# GitHub Actions CI/CD セットアップガイド

## GitHub Secretsの設定

E2EテストをGitHub Actionsで実行するために、以下のSecretsをGitHubリポジトリに設定する必要があります。

### 設定手順

1. GitHubリポジトリページで **Settings** タブをクリック
2. 左サイドバーから **Secrets and variables** → **Actions** を選択
3. **New repository secret** をクリック
4. 以下の環境変数をそれぞれ追加：

### 必要なSecrets

| Secret名 | 説明 | 例 |
|---------|-----|-----|
| `E2E_TEST_EMAIL_1` | E2Eテスト用メールアドレス1 | `test1@example.com` |
| `E2E_TEST_EMAIL_2` | E2Eテスト用メールアドレス2 | `test2@example.com` |
| `E2E_TEST_PASSWORD_1` | テストユーザー1のパスワード | `password123` |
| `E2E_TEST_PASSWORD_2` | テストユーザー2のパスワード | `password456` |
| `NEXT_PUBLIC_API_URL_V1_E2E` | E2Eテスト用API URL | `https://nextjs-app-yvfr.vercel.app/` |

### セキュリティ上の注意点

- **実際の個人メールアドレスは使用しない**: テスト専用のメールアドレスを作成することを推奨
- **パスワードは簡単なものでも可**: テスト環境用のため、複雑である必要はない
- **Secretsは暗号化される**: GitHub Secretsは暗号化されて保存される
- **ログには表示されない**: GitHub ActionsのログでSecret値は `***` で隠される

### ローカル開発との違い

| 環境 | 設定ファイル | 設定方法 |
|------|------------|---------|
| ローカル開発 | `.env.local` | ファイルに直接記述 |
| GitHub Actions | GitHub Secrets | Web UIで設定 |

### CI/CDワークフローの動作

1. **トリガー**:
   - `main` ブランチへのプッシュ
   - プルリクエスト作成時
   - 毎日午後3時（日本時間）の定期実行

2. **実行内容**:
   - Node.js環境のセットアップ
   - 依存関係のインストール
   - Playwrightブラウザのインストール
   - E2Eテストの実行
   - テスト結果レポートのアップロード

### トラブルシューティング

#### テストが失敗する場合

1. **GitHub Secretsが正しく設定されているか確認**
   - リポジトリの Settings → Secrets and variables → Actions
   - 必要なSecret名がすべて存在するか確認

2. **テスト用アカウントの状態確認**
   - テスト用メールアドレスが有効か
   - パスワードが正しいか
   - アカウントがロックされていないか

3. **API URLの確認**
   - `NEXT_PUBLIC_API_URL_V1_E2E` が正しいURLか
   - APIサーバーが稼働しているか

### 推奨事項

#### テスト専用アカウントの作成

```bash
# テスト専用のGmailアカウント例
e2e-test-user-1@gmail.com
e2e-test-user-2@gmail.com
```

#### 環境の分離

- **開発環境**: ローカルの `.env.local`
- **CI/CD環境**: GitHub Secrets
- **本番環境**: Vercel/Netlifyの環境変数

これにより、各環境で適切な設定を使い分けることができます。
