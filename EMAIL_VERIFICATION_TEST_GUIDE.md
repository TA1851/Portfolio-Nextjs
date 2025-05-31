# メール認証システム テストガイド

## 現在の状況 (2025年5月31日)

### ✅ 完了した実装
1. **パスワードレス登録システム**
   - `email` のみでユーザー登録可能
   - `password` は `"temp_password_will_be_replaced"` として一時的に設定
   - 登録時に `password: null, is_active: null` でレスポンス（正常）

2. **エラー解決**
   - 500エラーの原因（パスワードハッシュ化エラー）を特定し修正
   - 一時的なパスワードを含めることでAPI登録が成功するように修正

3. **動作確認済み**
   - API直接テスト: `testverify3@example.com` の登録が成功
   - レスポンス: `{"email": "testverify3@example.com", "password": null, "is_active": null}`

### 📋 次のテストステップ

#### 1. フロントエンド登録テスト
```bash
# Next.js開発サーバーでテスト
npm run dev  # ポート3003で起動
# http://localhost:3003/register にアクセス
# 新しいメールアドレスで登録をテスト
```

#### 2. メール認証フローのテスト（手動）
現在、実際のメール送信は設定されていないため、以下の方法でテスト可能：

**Step 1: ユーザー登録**
```bash
curl -X POST "http://localhost:8080/api/v1/user" \
  -H "Content-Type: application/json" \
  -d '{"name": "testuser", "email": "testuser@example.com", "password": "temp_password_will_be_replaced"}'
```

**Step 2: 認証トークンの手動生成（本来はメールに含まれる）**
- 開発環境では、APIサーバーのログやデータベースから実際のトークンを取得する必要がある
- または、API開発者に開発用トークン生成エンドポイントの追加を依頼

**Step 3: メール認証テスト**
```bash
# 有効なトークンが必要
curl -X GET "http://localhost:8080/api/v1/verify-email?token=VALID_TOKEN_HERE"
```

#### 3. パスワード変更のテスト
メール認証完了後、初期パスワードでログインを試行：

```bash
# メール認証後のユーザーでパスワード変更をテスト
curl -X POST "http://localhost:8080/api/v1/change-password" \
  -H "Content-Type: application/json" \
  -d '{
    "temp_password": "初期パスワード（メールに記載される）",
    "new_password": "新しいパスワード",
    "email": "testuser@example.com"
  }'
```

### 🔧 開発環境での改善提案

#### 1. 開発用メール送信シミュレーション
以下のようなエンドポイントを API に追加することを推奨：

```python
# 開発環境限定
@app.get("/dev/simulate-email/{email}")
async def simulate_email_verification(email: str):
    """開発環境でのメール認証シミュレーション"""
    if not settings.DEBUG:
        raise HTTPException(status_code=404, detail="Not found")
    
    # 実際の認証トークンとパスワードを返す
    user = get_user_by_email(email)
    return {
        "verification_link": f"/verify-email?token={user.verification_token}",
        "initial_password": user.initial_password
    }
```

#### 2. ログ出力の改善
API サーバーで認証メール送信時にトークンとパスワードをログ出力

### 📝 現在判明している事実

1. **ユーザー登録API**: 正常動作
2. **メール認証API**: トークン必須、無効トークンで適切にエラー
3. **パスワード変更API**: 422エラーは正しい初期パスワードが必要
4. **プロキシ設定**: Next.js → API サーバー間の通信は正常

### 🎯 現在の課題

1. **実際のメール送信未設定**: SMTP設定が必要
2. **開発環境でのトークン取得方法**: デバッグ用エンドポイントまたはログ出力が必要
3. **エンドツーエンドテスト**: 実際のメール→認証→パスワード設定の完全フローテスト

### 💡 推奨される次のアクション

1. フロントエンド登録をブラウザでテスト
2. API開発者と連携してメール送信ログまたは開発用エンドポイントを追加
3. 完全なメール認証フローのテスト実行
4. 本番環境でのSMTP設定準備
