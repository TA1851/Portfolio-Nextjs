import { test, expect } from '@playwright/test';

// 環境変数からテスト用メールアドレスとパスワードを取得
const TEST_EMAIL_1 = process.env.E2E_TEST_EMAIL_1 || 'test1@example.com';
const TEST_PASSWORD_1 = process.env.E2E_TEST_PASSWORD_1 || 'password123';

// テストで作成される記事のタイトル（一意性を保つためタイムスタンプを使用）
const timestamp = Date.now();
const ARTICLE_TITLES = {
  DRAFT: `E2E-Draft-${timestamp}`,
  PUBLISHED: `E2E-Published-${timestamp}`,
  UPDATE_TARGET: `E2E-Update-${timestamp}`
};

test.describe('記事管理機能の統合テスト', () => {
  test.describe.configure({ mode: 'serial' }); // テストを順番に実行

  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // ログイン処理
    await page.goto('https://nextjs-app-yvfr.vercel.app/');
    await page.getByRole('link', { name: 'ログイン' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_1);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD_1);
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // ログイン成功の確認
    await expect(page.getByRole('link', { name: '記事を書く' })).toBeVisible();
    console.log('✅ ログイン成功');
  });

  test.afterAll(async () => {
    if (page) {
      await page.close();
    }
  });

  test('1. 記事作成テスト - 下書き記事', async () => {
    await page.getByRole('link', { name: '記事を書く' }).click();
    await page.getByRole('textbox', { name: 'タイトル' }).fill(ARTICLE_TITLES.DRAFT);
    await page.getByRole('textbox', { name: '記事本文' }).fill('これは下書きのテスト記事です。');
    await page.getByRole('button', { name: '下書き保存' }).click();
    
    // 保存成功の確認（フォームがクリアされることで判定）
    await page.waitForTimeout(2000);
    const titleValue = await page.getByRole('textbox', { name: 'タイトル' }).inputValue();
    const contentValue = await page.getByRole('textbox', { name: '記事本文' }).inputValue();
    
    expect(titleValue).toBe(''); // フォームがクリアされている
    expect(contentValue).toBe('');
    console.log(`✅ 下書き記事作成完了: ${ARTICLE_TITLES.DRAFT}`);
  });

  test('2. 記事作成テスト - 公開記事', async () => {
    await page.getByRole('link', { name: '記事を書く' }).click();
    await page.getByRole('textbox', { name: 'タイトル' }).fill(ARTICLE_TITLES.PUBLISHED);
    await page.getByRole('textbox', { name: '記事本文' }).fill('これは公開のテスト記事です。');
    await page.getByRole('button', { name: '公開する' }).click();
    
    // 公開成功の確認
    await page.waitForTimeout(2000);
    const titleValue = await page.getByRole('textbox', { name: 'タイトル' }).inputValue();
    const contentValue = await page.getByRole('textbox', { name: '記事本文' }).inputValue();
    
    expect(titleValue).toBe('');
    expect(contentValue).toBe('');
    console.log(`✅ 公開記事作成完了: ${ARTICLE_TITLES.PUBLISHED}`);
  });

  test('3. 記事編集用記事の作成', async () => {
    await page.getByRole('link', { name: '記事を書く' }).click();
    await page.getByRole('textbox', { name: 'タイトル' }).fill(ARTICLE_TITLES.UPDATE_TARGET);
    await page.getByRole('textbox', { name: '記事本文' }).fill('これは編集テスト用の記事です。');
    await page.getByRole('button', { name: '下書き保存' }).click();
    
    // 保存成功の確認
    await page.waitForTimeout(2000);
    const titleValue = await page.getByRole('textbox', { name: 'タイトル' }).inputValue();
    expect(titleValue).toBe('');
    console.log(`✅ 編集用記事作成完了: ${ARTICLE_TITLES.UPDATE_TARGET}`);
  });

  test('4. 記事編集テスト', async () => {
    await page.getByRole('link', { name: '記事を編集する' }).click();
    
    // 編集対象記事の選択（記事が存在するかチェック）
    await page.getByRole('button', { name: 'select article' }).click();
    
    // 記事リストに目的の記事があるかチェック
    const targetMenuItem = page.getByRole('menuitem', { name: ARTICLE_TITLES.UPDATE_TARGET });
    await expect(targetMenuItem).toBeVisible({ timeout: 5000 });
    await targetMenuItem.click();
    
    // 記事内容の編集
    const contentTextbox = page.getByRole('textbox', { name: '本文' });
    await contentTextbox.clear();
    await contentTextbox.fill('記事が編集されました。更新テスト完了。');
    
    // 更新ボタンの存在確認と実行
    const updateButton = page.getByRole('button', { name: '更新する' });
    if (await updateButton.isVisible()) {
      await updateButton.click();
    } else {
      // 代替として保存ボタンを探す
      await page.getByRole('button', { name: '保存' }).click();
    }
    
    await page.waitForTimeout(2000);
    console.log(`✅ 記事編集完了: ${ARTICLE_TITLES.UPDATE_TARGET}`);
  });

  test('5. 記事削除テスト - 下書き記事', async () => {
    await page.getByRole('link', { name: '記事を削除する' }).click();
    
    // 記事の存在確認
    const articleItem = page.getByRole('listitem').filter({ hasText: ARTICLE_TITLES.DRAFT });
    await expect(articleItem).toBeVisible({ timeout: 5000 });
    
    // 下書き記事の削除
    await articleItem.getByLabel('delete').first().click();
    await page.getByRole('button', { name: '削除' }).click();
    
    await page.waitForTimeout(2000);
    console.log(`✅ 下書き記事削除完了: ${ARTICLE_TITLES.DRAFT}`);
  });

  test('6. 記事削除テスト - 公開記事', async () => {
    await page.getByRole('link', { name: '記事を削除する' }).click();
    
    // 記事の存在確認
    const articleItem = page.getByRole('listitem').filter({ hasText: ARTICLE_TITLES.PUBLISHED });
    await expect(articleItem).toBeVisible({ timeout: 5000 });
    
    // 公開記事の削除
    await articleItem.getByLabel('delete').first().click();
    await page.getByRole('button', { name: '削除' }).click();
    
    await page.waitForTimeout(2000);
    console.log(`✅ 公開記事削除完了: ${ARTICLE_TITLES.PUBLISHED}`);
  });

  test('7. 記事削除テスト - 編集済み記事', async () => {
    await page.getByRole('link', { name: '記事を削除する' }).click();
    
    // 記事の存在確認
    const articleItem = page.getByRole('listitem').filter({ hasText: ARTICLE_TITLES.UPDATE_TARGET });
    await expect(articleItem).toBeVisible({ timeout: 5000 });
    
    // 編集済み記事の削除
    await articleItem.getByLabel('delete').first().click();
    await page.getByRole('button', { name: '削除' }).click();
    
    await page.waitForTimeout(2000);
    console.log(`✅ 編集済み記事削除完了: ${ARTICLE_TITLES.UPDATE_TARGET}`);
  });

  test('8. 記事数の整合性確認', async () => {
    await page.getByRole('link', { name: '記事を削除する' }).click();
    
    // テスト記事がすべて削除されていることを確認
    const draftExists = await page.getByText(ARTICLE_TITLES.DRAFT).isVisible();
    const publishedExists = await page.getByText(ARTICLE_TITLES.PUBLISHED).isVisible();
    const updateTargetExists = await page.getByText(ARTICLE_TITLES.UPDATE_TARGET).isVisible();
    
    expect(draftExists).toBe(false);
    expect(publishedExists).toBe(false);
    expect(updateTargetExists).toBe(false);
    
    console.log('✅ 記事数整合性確認完了 - すべてのテスト記事が削除されました');
  });
});
