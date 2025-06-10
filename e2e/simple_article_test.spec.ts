import { test, expect } from '@playwright/test';

const TEST_EMAIL_1 = process.env.E2E_TEST_EMAIL_1 || 'test1@example.com';
const TEST_PASSWORD_1 = process.env.E2E_TEST_PASSWORD_1 || 'password123';

test('最小限の記事作成テスト', async ({ page }) => {
  console.log('🔑 ログイン開始...');
  
  // ログイン
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_1);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD_1);
  await page.getByRole('button', { name: 'ログイン' }).click();
  
  // ログイン成功確認
  await expect(page.getByRole('link', { name: '記事を書く' })).toBeVisible();
  console.log('✅ ログイン成功');

  // 記事作成フォームへ移動
  await page.getByRole('link', { name: '記事を書く' }).click();
  console.log('📝 記事作成フォームに移動');

  // フォーム要素の確認
  const titleInput = page.getByRole('textbox', { name: 'タイトル' });
  const contentInput = page.getByRole('textbox', { name: '記事本文' });
  const draftButton = page.getByRole('button', { name: '下書き保存' });
  
  console.log('📋 フォーム要素の可視性チェック:');
  console.log('  - タイトル入力:', await titleInput.isVisible());
  console.log('  - 本文入力:', await contentInput.isVisible());
  console.log('  - 下書き保存ボタン:', await draftButton.isVisible());

  // 記事作成（最小限のテスト）
  const testTitle = `テスト記事-${Date.now()}`;
  await titleInput.fill(testTitle);
  await contentInput.fill('これはテスト記事です。');
  
  console.log(`📄 記事内容を入力: ${testTitle}`);
  
  // 下書き保存
  await draftButton.click();
  console.log('💾 下書き保存ボタンをクリック');
  
  // 保存処理の完了を待機（5秒）
  await page.waitForTimeout(5000);
  
  // 削除ページで作成した記事の確認
  await page.getByRole('link', { name: '記事を削除する' }).click();
  console.log('🗑️ 記事削除ページに移動');
  
  // 作成した記事が存在するかチェック
  const createdArticle = page.getByText(testTitle);
  const articleExists = await createdArticle.isVisible();
  
  console.log(`🔍 作成した記事の存在確認: ${articleExists}`);
  
  if (articleExists) {
    console.log('✅ 記事作成成功 - 記事が見つかりました');
    
    // 作成した記事を削除（クリーンアップ）
    const articleItem = page.getByRole('listitem').filter({ hasText: testTitle });
    await articleItem.getByLabel('delete').first().click();
    await page.getByRole('button', { name: '削除' }).click();
    await page.waitForTimeout(2000);
    
    console.log('🧹 テスト記事を削除しました');
  } else {
    console.log('❌ 記事作成失敗 - 記事が見つかりませんでした');
  }
  
  // 最終的な整合性確認
  expect(articleExists).toBe(true);
});
