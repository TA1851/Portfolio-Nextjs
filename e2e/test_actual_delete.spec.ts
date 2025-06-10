import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL_1;
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD_1;

test('実際の削除テスト（filter vs locator比較）', async ({ page }) => {
  // ログイン
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL!);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD!);
  await page.getByRole('button', { name: 'ログイン' }).click();
  
  await page.waitForLoadState('networkidle');
  
  // 記事削除ページに移動
  await page.getByRole('link', { name: '記事を削除する' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('🔍 filter vs locator の比較テスト');
  
  const targetPattern = 'KanjiMode';
  
  // 方法1: getByRole('listitem').filter()
  const articlesFilter = page.getByRole('listitem').filter({ hasText: targetPattern });
  const countFilter = await articlesFilter.count();
  console.log(`方法1 - filter({ hasText: "${targetPattern}" }): ${countFilter} 件`);
  
  // 方法2: locator()
  const articlesLocator = page.locator('li:has-text("' + targetPattern + '")');
  const countLocator = await articlesLocator.count();
  console.log(`方法2 - locator('li:has-text("${targetPattern}")'): ${countLocator} 件`);
  
  // 方法3: getByText()でli要素を取得
  const articlesGetByText = page.locator('li').filter({ has: page.getByText(targetPattern) });
  const countGetByText = await articlesGetByText.count();
  console.log(`方法3 - li.filter({ has: getByText("${targetPattern}") }): ${countGetByText} 件`);
  
  // 最も多く見つかった方法を使用
  let articles = articlesFilter;
  let count = countFilter;
  
  if (countLocator > count) {
    articles = articlesLocator;
    count = countLocator;
    console.log('✅ 方法2を採用');
  } else if (countGetByText > count) {
    articles = articlesGetByText;
    count = countGetByText;
    console.log('✅ 方法3を採用');
  } else {
    console.log('✅ 方法1を採用');
  }
  
  if (count > 0) {
    console.log(`\n🎯 "${targetPattern}" を含む記事 ${count} 件が見つかりました`);
    console.log('📝 最初の記事で削除テスト実行中...');
    
    try {
      // 最初の記事を削除
      const firstArticle = articles.first();
      const articleTitle = await firstArticle.textContent();
      console.log(`削除対象: "${articleTitle?.substring(0, 100)}..."`);
      
      // 削除ボタンをクリック
      await firstArticle.locator('[aria-label="delete"]').first().click();
      console.log('✅ 削除ボタンをクリックしました');
      
      // 確認ダイアログで削除実行
      await page.getByRole('button', { name: '削除' }).click();
      console.log('✅ 確認ダイアログで削除を実行しました');
      
      // 削除完了を待機
      await page.waitForTimeout(2000);
      
      // 削除後の状態確認
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      const afterArticles = page.locator('li:has-text("' + targetPattern + '")');
      const afterCount = await afterArticles.count();
      console.log(`\n削除後の記事数: ${afterCount} 件`);
      
      if (afterCount < count) {
        console.log('🎉 削除成功！記事数が減少しました');
      } else {
        console.log('⚠️ 記事数に変化がありません');
      }
      
    } catch (error) {
      console.error(`❌ 削除処理でエラー: ${error}`);
    }
    
  } else {
    console.log(`ℹ️ "${targetPattern}" を含む記事は見つかりませんでした`);
  }
});
