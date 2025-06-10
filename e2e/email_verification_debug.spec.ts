import { test, expect } from '@playwright/test';

// 環境変数からテスト用メールアドレスを取得
const TEST_EMAIL = process.env.E2E_TEST_EMAIL_1 || 'taosaka1851@gmail.com';

test.describe('メール認証デバッグテスト', () => {
  test('メール認証ページの表示確認', async ({ page }) => {
    // 無効なトークンでメール認証ページにアクセス
    await page.goto('http://localhost:3000/verify-email?token=test-invalid-token');
    
    // ページが正常に読み込まれることを確認
    await expect(page).toHaveTitle('メール認証 - ブログサービス');
    
    // エラーメッセージが表示されることを確認
    await page.waitForSelector('[data-testid="verification-error"], .text-red-500, .text-red-600', {
      timeout: 10000
    });
    
    // デバッグ情報をスクリーンショットで保存
    await page.screenshot({ 
      path: 'e2e/evidence/email-verification-debug.png',
      fullPage: true 
    });
    
    // コンソールログをキャプチャ
    page.on('console', msg => {
      console.log(`ブラウザコンソール [${msg.type()}]: ${msg.text()}`);
    });
    
    // ネットワークエラーをキャプチャ
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`ネットワークエラー: ${response.status()} - ${response.url()}`);
      }
    });
  });

  test('APIルートの直接テスト', async ({ page }) => {
    // APIルートに直接アクセス
    const response = await page.request.get('/api/verify-email?token=test-invalid-token');
    
    console.log('API応答ステータス:', response.status());
    console.log('API応答ヘッダー:', await response.headers());
    
    const responseText = await response.text();
    console.log('API応答ボディ:', responseText);
    
    // APIルートが404でないことを確認
    expect(response.status()).not.toBe(404);
  });

  test('メール認証リンクのリダイレクト確認', async ({ page }) => {
    // メール認証APIルートにブラウザから直接アクセス
    await page.goto('http://localhost:3000/api/verify-email?token=test-token');
    
    // リダイレクトが発生することを確認
    await page.waitForURL('**/verify-email**');
    
    // 現在のURLを確認
    const currentUrl = page.url();
    console.log('リダイレクト後のURL:', currentUrl);
    
    // トークンがクエリパラメータに含まれていることを確認
    expect(currentUrl).toContain('token=test-token');
  });

  test('登録からメール認証までのフロー', async ({ page }) => {
    // 登録ページにアクセス
    await page.goto('http://localhost:3000/register');
    
    // 許可されたメールアドレスで登録
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    
    // 成功メッセージまたはエラーメッセージを待機
    await page.waitForSelector('.text-green-600, .text-red-500, .text-red-600', {
      timeout: 10000
    });
    
    // 結果をスクリーンショットで保存
    await page.screenshot({ 
      path: 'e2e/evidence/registration-result.png',
      fullPage: true 
    });
    
    const pageContent = await page.textContent('body');
    console.log('登録結果:', pageContent);
  });
});
