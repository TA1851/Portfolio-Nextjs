import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL_1;
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD_1;
// テスト対象URLを環境変数で設定可能にし、デフォルトで本番環境を使用
const BASE_URL = process.env.E2E_BASE_URL || 'https://nextjs-app-yvfr.vercel.app';

// 環境変数のチェック
if (!TEST_EMAIL || !TEST_PASSWORD) {
  throw new Error('E2E test credentials are not set. Please set E2E_TEST_EMAIL_1 and E2E_TEST_PASSWORD_1 environment variables.');
}

test.describe.serial('記事CRUD整合性テスト（UIフィードバック対応版）', () => {
  
  // ログイン共通処理
  async function loginUser(page: Page) {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('link', { name: 'ログイン' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForLoadState('networkidle');
  }

  // ユーザーページへのナビゲーション処理
  async function navigateToUserPage(page: Page) {
    try {
      await page.waitForURL(/.*\/user.*/, { timeout: 15000 });
      console.log('✅ ユーザーページにリダイレクト成功');
    } catch {
      const currentUrl = page.url();
      console.log(`❌ リダイレクト失敗 - 現在のURL: ${currentUrl}`);
      
      if (!currentUrl.includes('/user')) {
        console.log('🔄 手動でユーザーページに移動を試行');
        await page.goto(`${BASE_URL}/user`);
        await page.waitForLoadState('networkidle');
      }
    }
  }
  
  test('記事作成・確認・削除の完全フロー', async ({ page }) => {
    const timestamp = Date.now();
    const testTitle = `整合性テスト-${timestamp}`;
    
    // ログイン
    await loginUser(page);
    
    console.log('🔄 1. 記事作成フェーズ開始');
    
    // 記事作成
    await page.getByRole('link', { name: '記事を書く' }).click();
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('textbox', { name: 'タイトル' }).fill(testTitle);
    await page.getByRole('textbox', { name: '記事本文' }).fill('整合性テスト用の記事です。');
    
    await page.getByRole('button', { name: '下書き保存' }).click();
    
    // 成功メッセージの確認
    const successAlert = page.locator('[role="alert"]').filter({ hasText: '下書き保存しました' });
    await successAlert.waitFor({ state: 'visible', timeout: 10000 });
    
    const messageText = await successAlert.textContent();
    expect(messageText).toContain(testTitle);
    expect(messageText).toContain('下書き保存しました');
    
    console.log('✅ 記事作成成功メッセージ確認');
    
    // ユーザーページに移動
    await navigateToUserPage(page);
    
    console.log('🔄 2. 記事存在確認フェーズ開始');
    
    // 記事削除ページで作成した記事が存在するか確認
    await page.getByRole('link', { name: '記事を削除する' }).click();
    await page.waitForLoadState('networkidle');
    
    // 作成した記事が表示されているか確認
    const createdArticle = page.getByRole('listitem').filter({ hasText: testTitle });
    await expect(createdArticle).toBeVisible({ timeout: 10000 });
    
    console.log('✅ 作成した記事の存在確認完了');
    
    console.log('🔄 3. 記事削除フェーズ開始');
    
    // 記事削除
    await createdArticle.getByLabel('delete').first().click();
    await page.getByRole('button', { name: '削除' }).click();
    
    // 削除成功の確認（Snackbar表示）
    const deleteSuccessAlert = page.locator('[role="alert"]').filter({ hasText: '正常に削除されました' });
    await deleteSuccessAlert.waitFor({ state: 'visible', timeout: 10000 });
    
    console.log('✅ 記事削除成功メッセージ確認');
    
    // 削除後に記事が一覧から消えていることを確認
    await expect(createdArticle).not.toBeVisible({ timeout: 10000 });
    
    console.log('✅ 記事削除後の一覧更新確認');
    
    console.log('🎉 記事CRUD整合性テスト完了');
  });
  
  test('複数記事作成での整合性確認', async ({ page }) => {
    const timestamp = Date.now();
    const testTitles = [
      `複数テスト-A-${timestamp}`,
      `複数テスト-B-${timestamp}`,
      `複数テスト-C-${timestamp}`
    ];
    
    // ログイン
    await loginUser(page);
    
    console.log('🔄 複数記事作成開始');
    
    // 3つの記事を順次作成
    for (let i = 0; i < testTitles.length; i++) {
      const title = testTitles[i];
      
      console.log(`📝 記事${i + 1}作成中: ${title}`);
      
      await page.getByRole('link', { name: '記事を書く' }).click();
      await page.waitForLoadState('networkidle');
      
      await page.getByRole('textbox', { name: 'タイトル' }).fill(title);
      await page.getByRole('textbox', { name: '記事本文' }).fill(`${i + 1}番目のテスト記事です。`);
      
      await page.getByRole('button', { name: '下書き保存' }).click();
      
      // 成功メッセージの確認
      const successAlert = page.locator('[role="alert"]').filter({ hasText: '下書き保存しました' });
      await successAlert.waitFor({ state: 'visible', timeout: 10000 });
      
      // ユーザーページに移動
      await navigateToUserPage(page);
      
      console.log(`✅ 記事${i + 1}作成完了`);
    }
    
    console.log('🔄 作成した記事の存在確認');
    
    // 記事削除ページで全ての記事が存在するか確認
    await page.getByRole('link', { name: '記事を削除する' }).click();
    await page.waitForLoadState('networkidle');
    
    // 作成した全ての記事が表示されているか確認
    for (const title of testTitles) {
      const article = page.getByRole('listitem').filter({ hasText: title });
      await expect(article).toBeVisible({ timeout: 10000 });
      console.log(`✅ 記事確認: ${title}`);
    }
    
    console.log('🔄 作成した記事の一括削除');
    
    // 作成した記事を全て削除
    for (const title of testTitles) {
      const article = page.getByRole('listitem').filter({ hasText: title });
      
      if (await article.isVisible()) {
        await article.getByLabel('delete').first().click();
        await page.getByRole('button', { name: '削除' }).click();
        
        // 削除成功メッセージの確認
        const deleteSuccessAlert = page.locator('[role="alert"]').filter({ hasText: '正常に削除されました' });
        await deleteSuccessAlert.waitFor({ state: 'visible', timeout: 10000 });
        
        console.log(`✅ 記事削除: ${title}`);
        
        // UI更新の待機
        await page.waitForTimeout(2000);
      }
    }
    
    console.log('🎉 複数記事整合性テスト完了');
  });
});
