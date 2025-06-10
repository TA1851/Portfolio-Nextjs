import { test, expect } from '@playwright/test';

const TEST_EMAIL_1 = process.env.E2E_TEST_EMAIL_1 || 'test1@example.com';
const TEST_PASSWORD_1 = process.env.E2E_TEST_PASSWORD_1 || 'password123';

test('記事作成UIの詳細確認', async ({ page }) => {
  // ログイン
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_1);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD_1);
  await page.getByRole('button', { name: 'ログイン' }).click();
  
  // ページ遷移の確認
  await page.waitForLoadState('networkidle');
  
  // 記事作成ページへの移動を試行
  await page.getByRole('link', { name: '記事を書く' }).click();
  await page.waitForLoadState('networkidle');
  
  // フォーム要素の存在確認
  const titleInput = page.getByRole('textbox', { name: 'タイトル' });
  const contentInput = page.getByRole('textbox', { name: '記事本文' });
  
  console.log('Title input visible:', await titleInput.isVisible());
  console.log('Content input visible:', await contentInput.isVisible());
  
  if (await titleInput.isVisible() && await contentInput.isVisible()) {
    // フォーム入力
    await titleInput.fill('テスト記事');
    await contentInput.fill('これはテスト記事です。');
    
    // 利用可能なボタンを全て取得
    const buttons = await page.locator('button').all();
    console.log('Available buttons:');
    for (const button of buttons) {
      const text = await button.textContent();
      console.log('  -', text);
    }
    
    // 下書き保存ボタンの確認
    const draftButton = page.getByRole('button', { name: '下書き保存' });
    console.log('Draft button visible:', await draftButton.isVisible());
    
    if (await draftButton.isVisible()) {
      await draftButton.click();
      await page.waitForTimeout(3000);
      
      // 保存後のメッセージや状態変化を確認
      const allText = await page.textContent('body');
      console.log('Page contains keywords:');
      console.log('  - "保存":', allText.includes('保存'));
      console.log('  - "成功":', allText.includes('成功'));
      console.log('  - "完了":', allText.includes('完了'));
      console.log('  - "記事":', allText.includes('記事'));
      
      // スクリーンショットを撮影
      await page.screenshot({ path: 'test-results/after-save-debug.png' });
    }
  }
});
