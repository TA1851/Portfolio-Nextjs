import { test, expect } from '@playwright/test';

const TEST_EMAIL_1 = process.env.E2E_TEST_EMAIL_1 || 'test1@example.com';
const TEST_PASSWORD_1 = process.env.E2E_TEST_PASSWORD_1 || 'password123';

test('ローカル環境でのUIフィードバック確認', async ({ page }) => {
  // ローカル環境でテスト
  await page.goto('http://localhost:3000');
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
  const testTitle = `ローカルUIテスト-${timestamp}`;
  
  await page.getByRole('textbox', { name: 'タイトル' }).fill(testTitle);
  await page.getByRole('textbox', { name: '記事本文' }).fill('ローカル環境でのUIフィードバックテストです。');
  
  console.log('🔄 下書き保存ボタンをクリックします...');
  
  // 下書き保存ボタンをクリック
  await page.getByRole('button', { name: '下書き保存' }).click();
  
  // 少し待機してからフィードバックを確認
  await page.waitForTimeout(3000);
  
  // 成功メッセージ（Snackbar）の表示を確認
  console.log('✅ 成功メッセージの表示を確認中...');
  
  // より柔軟なセレクターでSnackbarを探す
  const snackbarSelectors = [
    '[role="alert"]',
    '.MuiSnackbar-root',
    '.MuiAlert-root',
    '[data-testid="success-snackbar"]',
    'text=下書き保存しました',
    `text=${testTitle}`
  ];
  
  let messageFound = false;
  let messageText = '';
  
  for (const selector of snackbarSelectors) {
    try {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        messageText = await element.textContent() || '';
        if (messageText.includes('下書き保存') || messageText.includes(testTitle)) {
          messageFound = true;
          console.log(`✅ 成功メッセージ発見 (${selector}): "${messageText}"`);
          break;
        }
      }
    } catch (error) {
      // セレクターが見つからない場合は次へ
    }
  }
  
  if (!messageFound) {
    console.log('❌ 成功メッセージが表示されませんでした');
    
    // デバッグ: ページの全体的な状態を確認
    const pageText = await page.textContent('body');
    console.log('🔍 ページにUIフィードバック関連のテキストが含まれているか:');
    console.log(`  - "保存": ${pageText?.includes('保存')}`);
    console.log(`  - "成功": ${pageText?.includes('成功')}`);
    console.log(`  - "完了": ${pageText?.includes('完了')}`);
    console.log(`  - タイトル "${testTitle}": ${pageText?.includes(testTitle)}`);
    
    // すべてのSnackbar関連要素を検索
    const allElements = await page.locator('*').all();
    console.log(`🔍 総要素数: ${allElements.length}`);
    
    // MUIコンポーネントが読み込まれているか確認
    const muiElements = await page.locator('[class*="Mui"]').count();
    console.log(`🔍 MUI要素数: ${muiElements}`);
  }
  
  console.log('📝 フォーム状態の確認...');
  
  const titleValue = await page.getByRole('textbox', { name: 'タイトル' }).inputValue();
  const contentValue = await page.getByRole('textbox', { name: '記事本文' }).inputValue();
  
  console.log(`タイトル欄: "${titleValue}"`);
  console.log(`本文欄: "${contentValue}"`);
  
  // 現在のURL確認
  const currentUrl = page.url();
  console.log(`🌐 現在のURL: ${currentUrl}`);
});
