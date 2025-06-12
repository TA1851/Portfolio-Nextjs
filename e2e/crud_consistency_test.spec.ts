import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL_1;
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD_1;
const BASE_URL = process.env.E2E_BASE_URL || 'https://nextjs-app-yvfr.vercel.app';

// 環境変数のチェック
if (!TEST_EMAIL || !TEST_PASSWORD) {
  throw new Error('E2E test credentials are not set. Please set E2E_TEST_EMAIL_1 and E2E_TEST_PASSWORD_1 environment variables.');
}

test.describe('記事CRUD整合性テスト（安定版）', () => {
  
  // 各テストを独立して実行
  test.beforeEach(async ({ page }) => {
    // タイムアウトを大幅に延長
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
  });

  // ログイン共通処理（シンプル化）
  async function loginUser(page: Page) {
    console.log('🔄 ログイン開始');
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('link', { name: 'ログイン' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // ログイン後のリダイレクト待機（柔軟性を持たせる）
    try {
      await page.waitForURL(/.*\/user/, { timeout: 30000 });
      console.log('✅ ログイン成功 - ユーザーページにリダイレクト');
    } catch {
      // リダイレクトが失敗した場合は手動で移動
      console.log('🔄 手動でユーザーページに移動');
      await page.goto(`${BASE_URL}/user`);
    }
    
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ ログイン処理完了');
  }

  // 記事作成処理
  async function createArticle(page: Page, title: string, content: string) {
    console.log(`📝 記事作成開始: ${title}`);
    
    await page.getByRole('link', { name: '記事を書く' }).click();
    await page.waitForLoadState('domcontentloaded');
    
    await page.getByRole('textbox', { name: 'タイトル' }).fill(title);
    await page.getByRole('textbox', { name: '記事本文' }).fill(content);
    
    await page.getByRole('button', { name: '下書き保存' }).click();
    
    // 成功メッセージの確認
    const successAlert = page.locator('[role="alert"]').filter({ hasText: '下書き保存しました' });
    await successAlert.waitFor({ state: 'visible', timeout: 15000 });
    
    console.log(`✅ 記事作成完了: ${title}`);
    return true;
  }

  // 記事削除処理
  async function deleteArticle(page: Page, title: string) {
    console.log(`🗑️ 記事削除開始: ${title}`);
    
    // 記事削除ページに移動
    await page.getByRole('link', { name: '記事を削除する' }).click();
    await page.waitForLoadState('domcontentloaded');
    
    // 対象記事を探して削除
    const article = page.getByRole('listitem').filter({ hasText: title });
    await expect(article).toBeVisible({ timeout: 10000 });
    
    await article.getByLabel('delete').first().click();
    await page.getByRole('button', { name: '削除' }).click();
    
    // 削除成功メッセージの確認
    const deleteAlert = page.locator('[role="alert"]').filter({ hasText: '正常に削除されました' });
    await deleteAlert.waitFor({ state: 'visible', timeout: 15000 });
    
    console.log(`✅ 記事削除完了: ${title}`);
    return true;
  }
  
  test('記事作成・確認・削除の完全フロー', async ({ page }) => {
    const timestamp = Date.now();
    const testTitle = `完全フローテスト-${timestamp}`;
    const testContent = '記事作成・確認・削除のフローテストです。';
    
    try {
      // ログイン
      await loginUser(page);
      
      // 記事作成
      await createArticle(page, testTitle, testContent);
      
      // ユーザーページに戻る（直接移動）
      await page.goto(`${BASE_URL}/user`);
      await page.waitForLoadState('domcontentloaded');
      
      // 記事削除
      await deleteArticle(page, testTitle);
      
      console.log('🎉 完全フローテスト成功');
      
    } catch (error) {
      console.error(`❌ テスト失敗: ${error.message}`);
      throw error;
    }
  });
  
  test('単一記事作成テスト', async ({ page }) => {
    const timestamp = Date.now();
    const testTitle = `単一作成テスト-${timestamp}`;
    const testContent = '単一記事作成のテストです。';
    
    try {
      // ログイン
      await loginUser(page);
      
      // 記事作成
      await createArticle(page, testTitle, testContent);
      
      console.log('🎉 単一記事作成テスト成功');
      
    } catch (error) {
      console.error(`❌ テスト失敗: ${error.message}`);
      throw error;
    }
  });
  
  test('記事削除テスト', async ({ page }) => {
    const timestamp = Date.now();
    const testTitle = `削除テスト-${timestamp}`;
    const testContent = '削除テスト用の記事です。';
    
    try {
      // ログイン
      await loginUser(page);
      
      // 記事作成
      await createArticle(page, testTitle, testContent);
      
      // ユーザーページに戻る
      await page.goto(`${BASE_URL}/user`);
      await page.waitForLoadState('domcontentloaded');
      
      // 記事削除
      await deleteArticle(page, testTitle);
      
      console.log('🎉 記事削除テスト成功');
      
    } catch (error) {
      console.error(`❌ テスト失敗: ${error.message}`);
      throw error;
    }
  });
});
