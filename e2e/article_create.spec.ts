import { test } from '@playwright/test';

// 環境変数からテスト用メールアドレスとパスワードを取得
const TEST_EMAIL_1 = process.env.E2E_TEST_EMAIL_1 || 'test1@example.com';
const TEST_PASSWORD_1 = process.env.E2E_TEST_PASSWORD_1 || 'password123';

test('test', async ({ page }) => {
  await page.goto('https://nextjs-app-yvfr.vercel.app/user');
  await page.getByRole('button', { name: 'ログアウト' }).click();
  await page.getByRole('button', { name: 'ログアウト' }).click();
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('');
  await page.getByRole('textbox', { name: 'Email' }).fill('Eisu');
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_1);
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD_1);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.getByRole('link', { name: '記事を書く' }).click();
  await page.getByRole('textbox', { name: 'タイトル' }).click();
  await page.getByRole('textbox', { name: 'タイトル' }).fill('KanjiMode');
  await page.getByRole('textbox', { name: 'タイトル' }).press('Tab');
  await page.getByRole('textbox', { name: '記事本文' }).fill('テスト');
  await page.getByRole('button', { name: 'キャンセル' }).click();
  await page.getByRole('link', { name: '記事を書く' }).click();
  await page.getByRole('textbox', { name: 'タイトル' }).click();
  await page.getByRole('textbox', { name: 'タイトル' }).fill('公開');
  await page.getByRole('textbox', { name: 'タイトル' }).press('Enter');
  await page.getByRole('textbox', { name: 'タイトル' }).press('Tab');
  await page.getByRole('textbox', { name: '記事本文' }).fill('テスト');
  await page.getByRole('textbox', { name: '記事本文' }).press('Tab');
  await page.getByRole('button', { name: '下書き保存' }).press('Tab');
  await page.getByRole('button', { name: '公開する' }).click();
  await page.getByRole('button', { name: '公開する' }).click();
  await page.getByRole('link', { name: '記事を書く' }).click();
  await page.getByRole('textbox', { name: 'タイトル' }).click();
  await page.getByRole('textbox', { name: 'タイトル' }).fill('KanjiMode');
  await page.getByRole('textbox', { name: '記事本文' }).click();
  await page.getByRole('textbox', { name: '記事本文' }).fill('テスト');
  await page.getByRole('button', { name: '下書き保存' }).click();
});