import { test, expect } from '@playwright/test';

// 環境変数からテスト用メールアドレスを取得
const TEST_EMAIL = process.env.E2E_TEST_EMAIL_1 || 'taosaka1851@gmail.com';

test.describe('既存ユーザー登録時のエラーハンドリング', () => {
  test('既に登録済みのメールアドレスでの新規登録エラー', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    
    // 既に登録済みのメールアドレスで登録を試行
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    
    // エラーメッセージの表示を待機
    await page.waitForSelector('.bg-red-50', { timeout: 10000 });
    
    // エラーメッセージの内容を確認
    const errorMessage = await page.textContent('.bg-red-50');
    console.log('エラーメッセージ:', errorMessage);
    
    // 適切なエラーメッセージが表示されていることを確認
    expect(errorMessage).toContain('既に登録');
    expect(errorMessage).toContain(TEST_EMAIL);
    
    // ログインページへのリンクが表示されていることを確認
    const loginLink = page.locator('a[href="/login"]:has-text("ログインページへ")');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveText('ログインページへ');
    
    // 別のメールアドレスで登録ボタンが表示されていることを確認
    const retryButton = page.locator('button:has-text("別のメールアドレスで登録")');
    await expect(retryButton).toBeVisible();
    
    // スクリーンショットを保存
    await page.screenshot({ 
      path: 'e2e/evidence/existing-user-registration-error.png',
      fullPage: true 
    });
    
    console.log('✅ 既存ユーザー登録エラーハンドリング確認完了');
  });

  test('別のメールアドレスで登録ボタンの動作確認', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    
    // 既に登録済みのメールアドレスで登録を試行
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    
    // エラーメッセージの表示を待機
    await page.waitForSelector('.bg-red-50', { timeout: 10000 });
    
    // 「別のメールアドレスで登録」ボタンをクリック
    await page.click('button:has-text("別のメールアドレスで登録")');
    
    // エラーメッセージが消えることを確認
    await expect(page.locator('.bg-red-50')).not.toBeVisible();
    
    // メールアドレス入力欄がクリアされることを確認
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveValue('');
    
    console.log('✅ 別のメールアドレスで登録ボタンの動作確認完了');
  });

  test('ログインページへのリダイレクト確認', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    
    // 既に登録済みのメールアドレスで登録を試行
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    
    // エラーメッセージの表示を待機
    await page.waitForSelector('.bg-red-50', { timeout: 10000 });
    
    // ログインページへのリンクをクリック
    await page.click('a[href="/login"]:has-text("ログインページへ")');
    
    // ログインページに移動することを確認
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
    
    console.log('✅ ログインページへのリダイレクト確認完了');
  });
});
