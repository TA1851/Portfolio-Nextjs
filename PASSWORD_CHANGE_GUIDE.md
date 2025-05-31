****# パスワード変更機能テストガイド

## 🎉 完全動作確認済み ✅

### ✅ 動作確認済み項目
1. **ユーザー登録**: メールのみで登録可能
2. **メール認証**: トークンベースの認証システム
3. **パスワード変更**: 初期パスワード`temp_password_123`から新パスワードへの変更
4. **ログイン**: 変更後のパスワードでログイン可能
5. **フロントエンド修正**: 422エラーの修正完了

## 🔄 実装完了事項

### 1. パスワード変更ページの修正 ✅
- `/change-password` ページでの422エラー修正
- `email`と`username`フィールドの適切な設定
- メールアドレス未設定時のバリデーション追加

### 2. メール認証フローの確認 ✅
- 認証成功後にパスワード変更ページにリダイレクト
- ユーザーと認証トークンの情報を渡す
- 実際のメール送信（Gmail SMTP）確認済み

### 3. APIプロキシ設定 ✅
- Next.js設定でCORS問題を回避
- `/api/proxy/*` → `http://localhost:8080/api/v1/*`
- セキュアな通信経路の確立

## 🚀 完全テスト手順

### Step 1: ユーザー登録
```bash
curl -X POST http://localhost:8080/api/v1/user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "testuser",
    "email": "testuser@example.com",
    "password": "temp_password_will_be_replaced"
  }'
```

### Step 2: メール認証トークンの取得
```bash
# データベースから認証トークンを取得
sqlite3 /Users/tatu/Documents/GitHub/blog-api-main/blog.db \
  "SELECT email, token FROM email_verifications WHERE email = 'testuser@example.com' ORDER BY created_at DESC LIMIT 1;"
```

### Step 3: メール認証の実行
```bash
curl -X GET "http://localhost:8080/api/v1/verify-email?token=YOUR_TOKEN_HERE"
```

### Step 4: パスワード変更（APIテスト）
```bash
curl -X POST http://localhost:8080/api/v1/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "username": "testuser@example.com",
    "temp_password": "temp_password_123",
    "new_password": "mynewpassword123"
  }'
```

### Step 5: ログインテスト
```bash
curl -X POST http://localhost:8080/api/v1/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser@example.com&password=mynewpassword123"
```

### Step 6: フロントエンドテスト
1. ブラウザで以下のURLにアクセス：
```
http://localhost:3000/change-password?email=testuser@example.com&token=YOUR_TOKEN_HERE
```
2. パスワード変更フォームに入力：
   - 現在のパスワード: `temp_password_123`
   - 新しいパスワード: `mynewpassword123`
   - 確認用パスワード: `mynewpassword123`
3. 「パスワードを変更」ボタンをクリック

## 🔧 技術仕様

### API エンドポイント
- **ユーザー登録**: `POST /api/v1/user`
- **メール認証**: `GET /api/v1/verify-email?token={token}`
- **パスワード変更**: `POST /api/v1/change-password`

### パスワード変更APIのパラメータ
```json
{
  "email": "ユーザーのメールアドレス",
  "username": "ユーザーのメールアドレス（emailと同じ値）",
  "temp_password": "初期パスワード（temp_password_123）",
  "new_password": "新しいパスワード"
}
```

### レスポンス例
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "message": "パスワードが正常に変更されました。登録完了メールを送信しました。"
}
```

## 🔑 重要情報

### 初期パスワード
- **固定値**: `temp_password_123`
- メール認証完了後に使用
- パスワード変更時の`temp_password`フィールドに設定

### 422エラーの対処法
422エラー（バリデーションエラー）が発生する場合：
1. `email`フィールドが設定されているか確認
2. `username`フィールドがメールアドレス形式か確認
3. 両フィールドに同じメールアドレスを設定

### APIエンドポイントURL
- **開発環境**: `http://localhost:8080/api/v1`
- **フロントエンドプロキシ**: `/api/proxy` → `http://localhost:8080/api/v1`

## 🐛 トラブルシューティング

### 422エラー（修正済み）
**エラー**: `value is not a valid email address: An email address must have an @-sign`
**原因**: `username`フィールドが空または無効な形式
**解決**: フロントエンドで`email`と`username`の両方に正しいメールアドレスを設定

### メール送信確認
実際のメール送信はGmail SMTP経由で動作中：
- 送信者: `taosaka1851@gmail.com`
- SMTP設定: Gmail（port 587、STARTTLS）
- ログ確認: `/Users/tatu/Documents/GitHub/blog-api-main/log/app.log`

## 📝 テスト済みユーザー

1. `logtestuser@example.com` - パスワード変更済み
2. `emailtest2@example.com` - パスワード変更済み  
3. `taosaka1851@gmail.com` - パスワード変更済み

## 🚀 次のステップ

1. ✅ パスワード変更機能の完全テスト完了
2. ✅ フロントエンド・バックエンドの連携確認
3. ✅ エラーハンドリングの改善完了
4. ✅ メール送信機能の動作確認完了

**すべてのパスワード変更機能が正常に動作しています！** 🎉
  "new_password": "新しいパスワード"
}
```

### レスポンス
```json
{
  "access_token": "JWT_TOKEN",
  "token_type": "bearer",
  "message": "パスワードが正常に変更されました。登録完了メールを送信しました。"
}
```

## 🛡️ セキュリティ機能

1. **フロントエンドバリデーション**
   - すべてのフィールドが必須
   - 新しいパスワードと確認用パスワードの一致確認
   - 最小8文字のパスワード長制限

2. **プロキシ通信**
   - CORS問題の回避
   - 直接APIアクセスの防止

3. **認証トークン**
   - メール認証で取得したトークンの活用
   - セキュアな認証フロー

## 🐛 トラブルシューティング

### 開発環境で利用できるデバッグ機能
- コンソールログでのリクエスト/レスポンス詳細
- 画面下部のデバッグ情報表示
- API URL、パラメータ、エラー詳細の確認

### よくある問題と解決方法

1. **ネットワークエラー**
   - APIサーバー（ポート8080）が起動しているか確認
   - Next.jsサーバー（ポート3001）が起動しているか確認

2. **認証エラー**
   - メール認証が完了しているか確認
   - 正しいトークンとメールアドレスが渡されているか確認

3. **パスワード変更エラー**
   - 現在のパスワードが正しいか確認
   - 新しいパスワードが要件を満たしているか確認

## 📱 UI/UX 特徴

- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **リアルタイムバリデーション**: 入力エラーの即座な表示
- **ローディング状態**: 処理中の視覚的フィードバック
- **成功/エラーメッセージ**: わかりやすい状況説明
- **自動リダイレクト**: スムーズなユーザーフロー

## 🎯 次のステップ

1. **実際のメール送信設定**: SMTP設定でリアルなメール認証
2. **JWTトークン管理**: セッション管理とトークン保存
3. **パスワード強度チェック**: より詳細なバリデーション
4. **セキュリティ強化**: レート制限、ブルートフォース対策
