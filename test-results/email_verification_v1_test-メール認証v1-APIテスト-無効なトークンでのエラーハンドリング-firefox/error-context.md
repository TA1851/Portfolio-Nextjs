# Test info

- Name: メール認証v1 APIテスト >> 無効なトークンでのエラーハンドリング
- Location: /Users/tatu/Documents/GitHub/Portfolio-Nextjs/e2e/email_verification_v1_test.spec.ts:53:7

# Error details

```
Error: locator.isVisible: Error: strict mode violation: locator('.text-red-500, .text-red-600') resolved to 3 elements:
    1) <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8 text-red-500">…</svg> aka getByRole('img').first()
    2) <h1 class="text-3xl font-bold text-red-600 mb-4">認証に失敗しました</h1> aka getByRole('heading', { name: '認証に失敗しました' })
    3) <p class="text-sm text-red-500 mb-6">無効なトークンです。</p> aka getByText('無効なトークンです。', { exact: true })

Call log:
    - checking visibility of locator('.text-red-500, .text-red-600')

    at /Users/tatu/Documents/GitHub/Portfolio-Nextjs/e2e/email_verification_v1_test.spec.ts:66:77
```

# Page snapshot

```yaml
- img
- heading "認証に失敗しました" [level=1]
- paragraph: ネットワークエラーが発生しました。インターネット接続を確認してください。
- paragraph: 無効なトークンです。
- heading "考えられる原因と解決方法:" [level=3]
- list:
  - listitem:
    - text: 🔗
    - strong: "リンクの問題:"
    - text: メール内のリンクが完全にコピーされていない可能性があります
  - listitem:
    - text: ⏰
    - strong: "有効期限:"
    - text: 認証リンクの有効期限（通常24時間）が切れている可能性があります
  - listitem:
    - text: ✉️
    - strong: "メールアドレス:"
    - text: 登録時のメールアドレスが間違っている可能性があります
  - listitem:
    - text: 🔄
    - strong: "再送信:"
    - text: 下記のボタンから認証メールを再送信してください
  - listitem:
    - text: 🚫
    - strong: "既に認証済み:"
    - text: アカウントが既に認証済みの場合があります
- paragraph:
  - text: 💡
  - strong: "開発者向け情報:"
  - text: エラーコード 無効なトークンです。 を確認して、 具体的な問題を特定してください。
- link "新規登録をやり直す":
  - /url: /register
- link "ホームに戻る":
  - /url: /
- heading "デバッグ情報 (開発環境のみ):" [level=3]
- text: "Current URL: http://localhost:3000/verify-email?token=invalid-test-token Origin: http://localhost:3000 Pathname: /verify-email All URL Parameters: {\"token\":\"invalid-test-token\"} Token: invalid-test-token Email: なし Code: なし API URL: https://blog-api-main.onrender.com/api/v1 Frontend URL: https://nextjs-app-yvfr.vercel.app Timestamp: 2025-06-10T07:05:05.868Z API URL: https://blog-api-main.onrender.com/api/v1 Token: invalid-test-token Response status: 400 Response data: {\"detail\":\"無効なトークンです。\",\"error\":\"INVALID_TOKEN\"} Network error: 無効なトークンです。"
- alert
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 2 Issue
- button "Collapse issues badge":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('メール認証v1 APIテスト', () => {
   4 |   test('v1 APIルートの動作確認', async ({ page }) => {
   5 |     // 実際のメール認証URLパターンでテスト
   6 |     await page.goto('http://localhost:3000/api/v1/verify-email?token=test-token-v1');
   7 |     
   8 |     // リダイレクトが発生することを確認
   9 |     await page.waitForURL('**/verify-email**');
  10 |     
  11 |     // 現在のURLを確認
  12 |     const currentUrl = page.url();
  13 |     console.log('v1 API リダイレクト後のURL:', currentUrl);
  14 |     
  15 |     // トークンがクエリパラメータに含まれていることを確認
  16 |     expect(currentUrl).toContain('token=test-token-v1');
  17 |     
  18 |     // ページが正常に表示されることを確認
  19 |     await expect(page).toHaveTitle('メール認証 - ブログサービス');
  20 |     
  21 |     // デバッグ情報をスクリーンショットで保存
  22 |     await page.screenshot({ 
  23 |       path: 'e2e/evidence/v1-api-verification.png',
  24 |       fullPage: true 
  25 |     });
  26 |   });
  27 |
  28 |   test('メール認証フロー全体のテスト（ローカル）', async ({ page }) => {
  29 |     // 実際のトークンでメール認証をテスト
  30 |     const testToken = '890ef10e-b0f4-4ad6-a828-c57dae00935e';
  31 |     
  32 |     await page.goto(`http://localhost:3000/api/v1/verify-email?token=${testToken}`);
  33 |     
  34 |     // リダイレクト後のページ確認
  35 |     await page.waitForURL('**/verify-email**');
  36 |     
  37 |     // 認証結果の表示を待機
  38 |     await page.waitForSelector('.text-green-600, .text-red-500, .text-red-600', {
  39 |       timeout: 15000
  40 |     });
  41 |     
  42 |     // ページ内容を確認
  43 |     const pageContent = await page.textContent('body');
  44 |     console.log('認証結果:', pageContent);
  45 |     
  46 |     // 結果をスクリーンショットで保存
  47 |     await page.screenshot({ 
  48 |       path: 'e2e/evidence/email-verification-result.png',
  49 |       fullPage: true 
  50 |     });
  51 |   });
  52 |
  53 |   test('無効なトークンでのエラーハンドリング', async ({ page }) => {
  54 |     // 無効なトークンでテスト
  55 |     await page.goto('http://localhost:3000/api/v1/verify-email?token=invalid-test-token');
  56 |     
  57 |     // リダイレクト後のページ確認
  58 |     await page.waitForURL('**/verify-email**');
  59 |     
  60 |     // エラーメッセージの表示を待機
  61 |     await page.waitForSelector('.text-red-500, .text-red-600', {
  62 |       timeout: 15000
  63 |     });
  64 |     
  65 |     // エラーメッセージが表示されていることを確認
> 66 |     const errorVisible = await page.locator('.text-red-500, .text-red-600').isVisible();
     |                                                                             ^ Error: locator.isVisible: Error: strict mode violation: locator('.text-red-500, .text-red-600') resolved to 3 elements:
  67 |     expect(errorVisible).toBe(true);
  68 |     
  69 |     console.log('無効なトークンのエラーハンドリング確認完了');
  70 |   });
  71 | });
  72 |
```