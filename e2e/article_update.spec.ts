import { test, expect } from '@playwright/test';

// 環境変数からテスト用メールアドレスとパスワードを取得
const TEST_EMAIL = process.env.E2E_TEST_EMAIL_1;
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD_1;

test('記事更新テスト（改良版）', async ({ page }) => {
  const timestamp = Date.now();
  const testTitle = `E2E-Update-Test-${timestamp}`;
  
  // ログイン
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL!);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD!);
  await page.getByRole('button', { name: 'ログイン' }).click();
  
  await page.waitForLoadState('networkidle');
  
  console.log('🔄 記事作成フェーズ開始');
  
  // まず記事を作成
  await page.getByRole('link', { name: '記事を書く' }).click();
  await page.getByRole('textbox', { name: 'タイトル' }).fill(testTitle);
  await page.getByRole('textbox', { name: '記事本文' }).fill('元のテスト記事内容');
  await page.getByRole('button', { name: '下書き保存' }).click();
  
  // 成功メッセージを待機
  const createAlert = page.locator('[role="alert"]').filter({ hasText: '下書き保存しました' });
  await createAlert.waitFor({ state: 'visible', timeout: 10000 });
  
  const createMessageText = await createAlert.textContent();
  expect(createMessageText).toContain(testTitle);
  console.log('✅ 記事作成成功');
  
  // 少し待機してからUIが更新されるのを待つ
  await page.waitForTimeout(2000);
  
  console.log('🔄 記事更新フェーズ開始');
  
  // 記事編集画面に移動
  await page.getByRole('link', { name: '記事を編集する' }).click();
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('button', { name: 'select article' }).click();
  
  // 作成した記事を選択
  await page.getByRole('menuitem', { name: testTitle }).click();
  
  // 記事内容を編集
  await page.getByRole('textbox', { name: '本文' }).fill('編集されたテスト記事内容');
  
  // 下書き保存を実行
  await page.getByRole('button', { name: '下書き保存' }).click();
  
  // 確認ダイアログで確認ボタンをクリック
  await page.getByRole('button', { name: '確認' }).click();
  
  // 成功メッセージを確認
  const updateAlert = page.locator('[role="alert"]').filter({ hasText: '下書き保存しました' });
  await updateAlert.waitFor({ state: 'visible', timeout: 10000 });
  
  const updateMessageText = await updateAlert.textContent();
  expect(updateMessageText).toContain(testTitle);
  console.log('✅ 記事更新成功');
  
  console.log('✅ 記事更新テスト完了');
});