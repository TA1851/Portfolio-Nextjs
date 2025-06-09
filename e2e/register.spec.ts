import { test } from '@playwright/test';

// 環境変数からテスト用メールアドレスとパスワードを取得
const TEST_EMAIL_2 = process.env.E2E_TEST_EMAIL_2 || 'test2@example.com';
const TEST_PASSWORD_2 = process.env.E2E_TEST_PASSWORD_2 || 'password456';

test('test', async ({ page }) => {
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
  await page.getByRole('link', { name: '新規登録' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_2);
  await page.getByRole('button', { name: '新規登録' }).click();
  await page.goto('https://nextjs-app-yvfr.vercel.app/change-password?email=' + encodeURIComponent(TEST_EMAIL_2) + '&user_id=15&token=cace659c-71a4-4c1c-b5c1-df5ac66d412d');
  await page.getByRole('textbox', { name: '初期パスワード（メールに記載）*' }).click();
  await page.getByRole('textbox', { name: '初期パスワード（メールに記載）*' }).fill('temp_password_123');
  await page.getByRole('textbox', { name: '新しいパスワード*' }).click();
  await page.getByRole('textbox', { name: '新しいパスワード*' }).fill(TEST_PASSWORD_2);
  await page.getByRole('textbox', { name: '新しいパスワード*' }).press('Tab');
  await page.getByRole('textbox', { name: '新しいパスワード（確認）*' }).fill(TEST_PASSWORD_2);
  await page.getByRole('button', { name: 'パスワードを変更' }).click();
  await page.getByRole('link', { name: 'ログインページに戻る' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_2);
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD_2);
  await page.getByRole('button', { name: 'ログイン' }).click();
});