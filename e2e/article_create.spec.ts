import { test, expect } from '@playwright/test';

// 環境変数からテスト用メールアドレスとパスワードを取得
const TEST_EMAIL_1 = process.env.E2E_TEST_EMAIL_1 || 'test1@example.com';
const TEST_PASSWORD_1 = process.env.E2E_TEST_PASSWORD_1 || 'password123';

test('記事作成テスト（改良版）', async ({ page }) => {
  // ログイン処理
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_1);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD_1);
  await page.getByRole('button', { name: 'ログイン' }).click();
  
  // ログイン成功確認
  await expect(page.getByRole('link', { name: '記事を書く' })).toBeVisible();

  const timestamp = Date.now();

  // 1. 下書き記事の作成テスト
  await page.getByRole('link', { name: '記事を書く' }).click();
  await page.getByRole('textbox', { name: 'タイトル' }).fill(`下書きテスト-${timestamp}`);
  await page.getByRole('textbox', { name: '記事本文' }).fill('これは下書き記事のテストです。');
  await page.getByRole('button', { name: '下書き保存' }).click();
  
  // フォームクリアの確認
  await page.waitForTimeout(2000);
  const titleValue1 = await page.getByRole('textbox', { name: 'タイトル' }).inputValue();
  expect(titleValue1).toBe('');
  console.log(`✅ 下書き記事作成: 下書きテスト-${timestamp}`);

  // 2. 公開記事の作成テスト  
  await page.getByRole('link', { name: '記事を書く' }).click();
  await page.getByRole('textbox', { name: 'タイトル' }).fill(`公開テスト-${timestamp}`);
  await page.getByRole('textbox', { name: '記事本文' }).fill('これは公開記事のテストです。');
  await page.getByRole('button', { name: '公開する' }).click();
  
  // フォームクリアの確認
  await page.waitForTimeout(2000);
  const titleValue2 = await page.getByRole('textbox', { name: 'タイトル' }).inputValue();
  expect(titleValue2).toBe('');
  console.log(`✅ 公開記事作成: 公開テスト-${timestamp}`);

  // 3. 作成した記事の削除（クリーンアップ）
  await page.getByRole('link', { name: '記事を削除する' }).click();
  
  // 下書き記事の削除
  const draftArticle = page.getByRole('listitem').filter({ hasText: `下書きテスト-${timestamp}` });
  if (await draftArticle.isVisible()) {
    await draftArticle.getByLabel('delete').first().click();
    await page.getByRole('button', { name: '削除' }).click();
    await page.waitForTimeout(1000);
    console.log(`✅ 下書き記事削除: 下書きテスト-${timestamp}`);
  }
  
  // 公開記事の削除
  const publishedArticle = page.getByRole('listitem').filter({ hasText: `公開テスト-${timestamp}` });
  if (await publishedArticle.isVisible()) {
    await publishedArticle.getByLabel('delete').first().click();
    await page.getByRole('button', { name: '削除' }).click();
    await page.waitForTimeout(1000);
    console.log(`✅ 公開記事削除: 公開テスト-${timestamp}`);
  }
});