import { test, expect } from '@playwright/test';

const TEST_EMAIL_1 = process.env.E2E_TEST_EMAIL_1 || 'test1@example.com';
const TEST_PASSWORD_1 = process.env.E2E_TEST_PASSWORD_1 || 'password123';

test('記事作成APIの詳細調査', async ({ page }) => {
  // ネットワークリクエストを監視
  const requests: any[] = [];
  const responses: any[] = [];

  page.on('request', request => {
    if (request.url().includes('/articles')) {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      });
      console.log(`🚀 REQUEST: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/articles')) {
      responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
      console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
    }
  });

  // ログイン
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
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
  await page.getByRole('textbox', { name: 'タイトル' }).fill(`API調査テスト-${timestamp}`);
  await page.getByRole('textbox', { name: '記事本文' }).fill('API呼び出しのテストです。');
  
  // 下書き保存ボタンクリック前にログ出力
  console.log('🔄 下書き保存ボタンをクリックします...');
  
  await page.getByRole('button', { name: '下書き保存' }).click();
  
  // リクエスト/レスポンスの完了を待つ
  await page.waitForTimeout(5000);
  
  console.log('\n📊 キャプチャされたリクエスト数:', requests.length);
  console.log('📊 キャプチャされたレスポンス数:', responses.length);
  
  if (requests.length > 0) {
    console.log('\n🔍 リクエスト詳細:');
    requests.forEach((req, i) => {
      console.log(`${i + 1}. ${req.method} ${req.url}`);
      if (req.postData) {
        console.log(`   データ: ${req.postData}`);
      }
    });
  }
  
  if (responses.length > 0) {
    console.log('\n🔍 レスポンス詳細:');
    responses.forEach((res, i) => {
      console.log(`${i + 1}. ${res.status} ${res.statusText} - ${res.url}`);
    });
  }

  // 現在のURLを確認（リダイレクトされたかどうか）
  const currentUrl = page.url();
  console.log('\n🌐 現在のURL:', currentUrl);
  
  // フォームの値が空になったかを確認
  const titleValue = await page.getByRole('textbox', { name: 'タイトル' }).inputValue();
  const contentValue = await page.getByRole('textbox', { name: '記事本文' }).inputValue();
  
  console.log('📝 保存後のフォーム状態:');
  console.log(`   タイトル: "${titleValue}"`);
  console.log(`   本文: "${contentValue}"`);
  
  // ページにエラーメッセージがあるかチェック
  const pageText = await page.textContent('body');
  const hasError = pageText?.includes('エラー') || pageText?.includes('失敗') || pageText?.includes('error');
  console.log('⚠️ エラーメッセージの有無:', hasError);
  
  if (hasError) {
    console.log('🚨 ページ内のエラー関連テキスト:');
    const errorElements = await page.locator('text=/エラー|失敗|error/i').all();
    for (const element of errorElements) {
      const text = await element.textContent();
      console.log(`   - ${text}`);
    }
  }
});
