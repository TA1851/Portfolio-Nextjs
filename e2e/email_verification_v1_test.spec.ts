import { test, expect } from '@playwright/test';

test.describe('メール認証v1 APIテスト', () => {
  test('v1 APIルートの動作確認', async ({ page }) => {
    // 実際のメール認証URLパターンでテスト
    await page.goto('http://localhost:3000/api/v1/verify-email?token=test-token-v1');
    
    // リダイレクトが発生することを確認
    await page.waitForURL('**/verify-email**');
    
    // 現在のURLを確認
    const currentUrl = page.url();
    console.log('v1 API リダイレクト後のURL:', currentUrl);
    
    // トークンがクエリパラメータに含まれていることを確認
    expect(currentUrl).toContain('token=test-token-v1');
    
    // ページが正常に表示されることを確認
    await expect(page).toHaveTitle('メール認証 - ブログサービス');
    
    // デバッグ情報をスクリーンショットで保存
    await page.screenshot({ 
      path: 'e2e/evidence/v1-api-verification.png',
      fullPage: true 
    });
  });

  test('メール認証フロー全体のテスト（ローカル）', async ({ page }) => {
    // 実際のトークンでメール認証をテスト
    const testToken = '890ef10e-b0f4-4ad6-a828-c57dae00935e';
    
    await page.goto(`http://localhost:3000/api/v1/verify-email?token=${testToken}`);
    
    // リダイレクト後のページ確認
    await page.waitForURL('**/verify-email**');
    
    // 認証結果の表示を待機
    await page.waitForSelector('.text-green-600, .text-red-500, .text-red-600', {
      timeout: 15000
    });
    
    // ページ内容を確認
    const pageContent = await page.textContent('body');
    console.log('認証結果:', pageContent);
    
    // 結果をスクリーンショットで保存
    await page.screenshot({ 
      path: 'e2e/evidence/email-verification-result.png',
      fullPage: true 
    });
  });

  test('無効なトークンでのエラーハンドリング', async ({ page }) => {
    // 無効なトークンでテスト
    await page.goto('http://localhost:3000/api/v1/verify-email?token=invalid-test-token');
    
    // リダイレクト後のページ確認
    await page.waitForURL('**/verify-email**');
    
    // エラーメッセージの表示を待機
    await page.waitForSelector('.text-red-500, .text-red-600', {
      timeout: 15000
    });
    
    // エラーメッセージが表示されていることを確認
    const errorVisible = await page.locator('.text-red-500, .text-red-600').isVisible();
    expect(errorVisible).toBe(true);
    
    console.log('無効なトークンのエラーハンドリング確認完了');
  });
});
