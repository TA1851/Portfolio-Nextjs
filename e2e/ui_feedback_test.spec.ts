import { test, expect } from '@playwright/test';

const TEST_EMAIL_1 = process.env.E2E_TEST_EMAIL_1 || 'test1@example.com';
const TEST_PASSWORD_1 = process.env.E2E_TEST_PASSWORD_1 || 'password123';

test('改善された記事作成UIフィードバックの確認', async ({ page }) => {
  // ログイン
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_1);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD_1);
  await page.getByRole('button', { name: 'ログイン' }).click();
  
  await page.waitForLoadState('networkidle');
  
  // 記事作成ページへ移動
  await page.getByRole('link', { name: '記事を書く' }).click();
  await page.waitForLoadState('networkidle');
  
  // フォーム入力
  const timestamp = Date.now();
  const testTitle = `UIフィードバックテスト-${timestamp}`;
  
  await page.getByRole('textbox', { name: 'タイトル' }).fill(testTitle);
  await page.getByRole('textbox', { name: '記事本文' }).fill('UIフィードバック機能のテストです。');
  
  console.log('🔄 下書き保存ボタンをクリックします...');
  
  // 下書き保存ボタンをクリック
  await page.getByRole('button', { name: '下書き保存' }).click();
  
  // 成功メッセージ（Snackbar）の表示を確認
  console.log('✅ 成功メッセージの表示を確認中...');
  
  try {
    // 成功メッセージのSnackbarを待機（最大10秒）
    const successAlert = page.locator('[role="alert"]').filter({ hasText: '下書き保存しました' });
    await successAlert.waitFor({ state: 'visible', timeout: 10000 });
    
    console.log('✅ 成功メッセージが表示されました');
    
    // メッセージの内容を確認
    const messageText = await successAlert.textContent();
    console.log(`📝 メッセージ内容: "${messageText}"`);
    
    // タイトルが含まれているか確認
    expect(messageText).toContain(testTitle);
    expect(messageText).toContain('下書き保存しました');
    
  } catch (error) {
    console.log('❌ 成功メッセージが表示されませんでした');
    
    // デバッグ: ページ上のすべてのalertロールを確認
    const allAlerts = await page.locator('[role="alert"]').all();
    console.log(`🔍 ページ上のalert要素数: ${allAlerts.length}`);
    
    for (let i = 0; i < allAlerts.length; i++) {
      const alertText = await allAlerts[i].textContent();
      console.log(`  Alert ${i + 1}: "${alertText}"`);
    }
    
    // デバッグ: ページ上のSnackbar要素を確認
    const snackbars = await page.locator('[class*="MuiSnackbar"]').all();
    console.log(`🔍 Snackbar要素数: ${snackbars.length}`);
    
    throw new Error('成功メッセージが表示されませんでした');
  }
  
  // フォームがクリアされているか確認
  console.log('📝 フォームクリア状態の確認...');
  
  // 短時間待機してからフォームの状態を確認
  await page.waitForTimeout(2000);
  
  const titleValue = await page.getByRole('textbox', { name: 'タイトル' }).inputValue();
  const contentValue = await page.getByRole('textbox', { name: '記事本文' }).inputValue();
  
  console.log(`タイトル欄: "${titleValue}"`);
  console.log(`本文欄: "${contentValue}"`);
  
  // フォームがクリアされているかチェック
  expect(titleValue).toBe('');
  expect(contentValue).toBe('');
  
  console.log('✅ フォームが正常にクリアされました');
  
  // 最終的にユーザーページにリダイレクトされることを確認
  await page.waitForTimeout(2000); // リダイレクト待機
  
  const currentUrl = page.url();
  console.log(`🌐 現在のURL: ${currentUrl}`);
  
  expect(currentUrl).toContain('/user');
  console.log('✅ ユーザーページにリダイレクトされました');
});
