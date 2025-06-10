import { test, expect } from '@playwright/test';

// 環境変数からテスト用メールアドレスとパスワードを取得
const TEST_EMAIL_1 = process.env.E2E_TEST_EMAIL_2;
const TEST_PASSWORD_1 = process.env.E2E_TEST_PASSWORD_2;

test('記事削除テスト（安全版）', async ({ page }) => {
  // ログイン処理
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_1);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD_1);
  await page.getByRole('button', { name: 'ログイン' }).click();

  // ログイン成功確認
  await expect(page.getByRole('link', { name: '記事を削除する' })).toBeVisible();

  // まず削除用のテスト記事を作成
  const testTitle = `削除テスト用記事-${Date.now()}`;
  
  await page.getByRole('link', { name: '記事を書く' }).click();
  await page.getByRole('textbox', { name: 'タイトル' }).fill(testTitle);
  await page.getByRole('textbox', { name: '記事本文' }).fill('削除テスト用の記事です。');
  await page.getByRole('button', { name: '下書き保存' }).click();
  
  // 作成完了の待機
  await page.waitForTimeout(2000);

  // 削除ページに移動
  await page.getByRole('link', { name: '記事を削除する' }).click();
  
  // 作成した記事が存在することを確認
  const articleItem = page.getByRole('listitem').filter({ hasText: testTitle });
  await expect(articleItem).toBeVisible({ timeout: 10000 });
  
  // 記事を削除
  await articleItem.getByLabel('delete').first().click();
  await page.getByRole('button', { name: '削除' }).click();
  
  // 削除完了の待機
  await page.waitForTimeout(2000);
  
  // 記事が削除されたことを確認
  const deletedItem = page.getByText(testTitle);
  await expect(deletedItem).not.toBeVisible();
  
  console.log(`✅ 記事削除テスト完了: ${testTitle}`);
});