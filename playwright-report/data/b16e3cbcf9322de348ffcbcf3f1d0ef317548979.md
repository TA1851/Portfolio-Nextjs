# Test info

- Name: ローカル環境でのUIフィードバック確認
- Location: /Users/tatu/Documents/GitHub/Portfolio-Nextjs/e2e/local_ui_test.spec.ts:6:5

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: '記事を書く' })

    at /Users/tatu/Documents/GitHub/Portfolio-Nextjs/e2e/local_ui_test.spec.ts:17:51
```

# Page snapshot

```yaml
- alert
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 3 Issue
- button "Collapse issues badge":
  - img
- heading "ログインに失敗しました" [level=1]
- paragraph: メールアドレスまたはパスワードが正しくありません。
- link "ログイン画面に戻る":
  - /url: /login
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | const TEST_EMAIL_1 = process.env.E2E_TEST_EMAIL_1 || 'test1@example.com';
   4 | const TEST_PASSWORD_1 = process.env.E2E_TEST_PASSWORD_1 || 'password123';
   5 |
   6 | test('ローカル環境でのUIフィードバック確認', async ({ page }) => {
   7 |   // ローカル環境でテスト
   8 |   await page.goto('http://localhost:3000');
   9 |   await page.getByRole('link', { name: 'ログイン' }).click();
  10 |   await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_1);
  11 |   await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD_1);
  12 |   await page.getByRole('button', { name: 'ログイン' }).click();
  13 |   
  14 |   await page.waitForLoadState('networkidle');
  15 |   
  16 |   // 記事作成ページへ移動
> 17 |   await page.getByRole('link', { name: '記事を書く' }).click();
     |                                                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
  18 |   await page.waitForLoadState('networkidle');
  19 |   
  20 |   // フォーム入力
  21 |   const timestamp = Date.now();
  22 |   const testTitle = `ローカルUIテスト-${timestamp}`;
  23 |   
  24 |   await page.getByRole('textbox', { name: 'タイトル' }).fill(testTitle);
  25 |   await page.getByRole('textbox', { name: '記事本文' }).fill('ローカル環境でのUIフィードバックテストです。');
  26 |   
  27 |   console.log('🔄 下書き保存ボタンをクリックします...');
  28 |   
  29 |   // 下書き保存ボタンをクリック
  30 |   await page.getByRole('button', { name: '下書き保存' }).click();
  31 |   
  32 |   // 少し待機してからフィードバックを確認
  33 |   await page.waitForTimeout(3000);
  34 |   
  35 |   // 成功メッセージ（Snackbar）の表示を確認
  36 |   console.log('✅ 成功メッセージの表示を確認中...');
  37 |   
  38 |   // より柔軟なセレクターでSnackbarを探す
  39 |   const snackbarSelectors = [
  40 |     '[role="alert"]',
  41 |     '.MuiSnackbar-root',
  42 |     '.MuiAlert-root',
  43 |     '[data-testid="success-snackbar"]',
  44 |     'text=下書き保存しました',
  45 |     `text=${testTitle}`
  46 |   ];
  47 |   
  48 |   let messageFound = false;
  49 |   let messageText = '';
  50 |   
  51 |   for (const selector of snackbarSelectors) {
  52 |     try {
  53 |       const element = page.locator(selector);
  54 |       if (await element.isVisible()) {
  55 |         messageText = await element.textContent() || '';
  56 |         if (messageText.includes('下書き保存') || messageText.includes(testTitle)) {
  57 |           messageFound = true;
  58 |           console.log(`✅ 成功メッセージ発見 (${selector}): "${messageText}"`);
  59 |           break;
  60 |         }
  61 |       }
  62 |     } catch (error) {
  63 |       // セレクターが見つからない場合は次へ
  64 |     }
  65 |   }
  66 |   
  67 |   if (!messageFound) {
  68 |     console.log('❌ 成功メッセージが表示されませんでした');
  69 |     
  70 |     // デバッグ: ページの全体的な状態を確認
  71 |     const pageText = await page.textContent('body');
  72 |     console.log('🔍 ページにUIフィードバック関連のテキストが含まれているか:');
  73 |     console.log(`  - "保存": ${pageText?.includes('保存')}`);
  74 |     console.log(`  - "成功": ${pageText?.includes('成功')}`);
  75 |     console.log(`  - "完了": ${pageText?.includes('完了')}`);
  76 |     console.log(`  - タイトル "${testTitle}": ${pageText?.includes(testTitle)}`);
  77 |     
  78 |     // すべてのSnackbar関連要素を検索
  79 |     const allElements = await page.locator('*').all();
  80 |     console.log(`🔍 総要素数: ${allElements.length}`);
  81 |     
  82 |     // MUIコンポーネントが読み込まれているか確認
  83 |     const muiElements = await page.locator('[class*="Mui"]').count();
  84 |     console.log(`🔍 MUI要素数: ${muiElements}`);
  85 |   }
  86 |   
  87 |   console.log('📝 フォーム状態の確認...');
  88 |   
  89 |   const titleValue = await page.getByRole('textbox', { name: 'タイトル' }).inputValue();
  90 |   const contentValue = await page.getByRole('textbox', { name: '記事本文' }).inputValue();
  91 |   
  92 |   console.log(`タイトル欄: "${titleValue}"`);
  93 |   console.log(`本文欄: "${contentValue}"`);
  94 |   
  95 |   // 現在のURL確認
  96 |   const currentUrl = page.url();
  97 |   console.log(`🌐 現在のURL: ${currentUrl}`);
  98 | });
  99 |
```