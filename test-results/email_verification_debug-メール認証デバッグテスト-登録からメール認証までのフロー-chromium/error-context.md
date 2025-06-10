# Test info

- Name: メール認証デバッグテスト >> 登録からメール認証までのフロー
- Location: /Users/tatu/Documents/GitHub/Portfolio-Nextjs/e2e/email_verification_debug.spec.ts:67:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('.text-green-600, .text-red-500, .text-red-600') to be visible

    at /Users/tatu/Documents/GitHub/Portfolio-Nextjs/e2e/email_verification_debug.spec.ts:76:16
```

# Page snapshot

```yaml
- heading "新規登録" [level=2]
- text: サーバーに接続できませんでした。ネットワーク接続を確認してください。 Email
- textbox "Email": taosaka1851@gmail.com
- button "新規登録"
- paragraph:
  - link "登録済みの方はこちら":
    - /url: /login
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // 環境変数からテスト用メールアドレスを取得
   4 | const TEST_EMAIL = process.env.E2E_TEST_EMAIL_1 || 'taosaka1851@gmail.com';
   5 |
   6 | test.describe('メール認証デバッグテスト', () => {
   7 |   test('メール認証ページの表示確認', async ({ page }) => {
   8 |     // 無効なトークンでメール認証ページにアクセス
   9 |     await page.goto('http://localhost:3000/verify-email?token=test-invalid-token');
  10 |     
  11 |     // ページが正常に読み込まれることを確認
  12 |     await expect(page).toHaveTitle('メール認証 - ブログサービス');
  13 |     
  14 |     // エラーメッセージが表示されることを確認
  15 |     await page.waitForSelector('[data-testid="verification-error"], .text-red-500, .text-red-600', {
  16 |       timeout: 10000
  17 |     });
  18 |     
  19 |     // デバッグ情報をスクリーンショットで保存
  20 |     await page.screenshot({ 
  21 |       path: 'e2e/evidence/email-verification-debug.png',
  22 |       fullPage: true 
  23 |     });
  24 |     
  25 |     // コンソールログをキャプチャ
  26 |     page.on('console', msg => {
  27 |       console.log(`ブラウザコンソール [${msg.type()}]: ${msg.text()}`);
  28 |     });
  29 |     
  30 |     // ネットワークエラーをキャプチャ
  31 |     page.on('response', response => {
  32 |       if (!response.ok()) {
  33 |         console.log(`ネットワークエラー: ${response.status()} - ${response.url()}`);
  34 |       }
  35 |     });
  36 |   });
  37 |
  38 |   test('APIルートの直接テスト', async ({ page }) => {
  39 |     // APIルートに直接アクセス
  40 |     const response = await page.request.get('/api/verify-email?token=test-invalid-token');
  41 |     
  42 |     console.log('API応答ステータス:', response.status());
  43 |     console.log('API応答ヘッダー:', await response.headers());
  44 |     
  45 |     const responseText = await response.text();
  46 |     console.log('API応答ボディ:', responseText);
  47 |     
  48 |     // APIルートが404でないことを確認
  49 |     expect(response.status()).not.toBe(404);
  50 |   });
  51 |
  52 |   test('メール認証リンクのリダイレクト確認', async ({ page }) => {
  53 |     // メール認証APIルートにブラウザから直接アクセス
  54 |     await page.goto('http://localhost:3000/api/verify-email?token=test-token');
  55 |     
  56 |     // リダイレクトが発生することを確認
  57 |     await page.waitForURL('**/verify-email**');
  58 |     
  59 |     // 現在のURLを確認
  60 |     const currentUrl = page.url();
  61 |     console.log('リダイレクト後のURL:', currentUrl);
  62 |     
  63 |     // トークンがクエリパラメータに含まれていることを確認
  64 |     expect(currentUrl).toContain('token=test-token');
  65 |   });
  66 |
  67 |   test('登録からメール認証までのフロー', async ({ page }) => {
  68 |     // 登録ページにアクセス
  69 |     await page.goto('http://localhost:3000/register');
  70 |     
  71 |     // 許可されたメールアドレスで登録
  72 |     await page.fill('input[name="email"]', TEST_EMAIL);
  73 |     await page.click('button[type="submit"]');
  74 |     
  75 |     // 成功メッセージまたはエラーメッセージを待機
> 76 |     await page.waitForSelector('.text-green-600, .text-red-500, .text-red-600', {
     |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  77 |       timeout: 10000
  78 |     });
  79 |     
  80 |     // 結果をスクリーンショットで保存
  81 |     await page.screenshot({ 
  82 |       path: 'e2e/evidence/registration-result.png',
  83 |       fullPage: true 
  84 |     });
  85 |     
  86 |     const pageContent = await page.textContent('body');
  87 |     console.log('登録結果:', pageContent);
  88 |   });
  89 | });
  90 |
```