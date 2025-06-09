import { test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
  await page.getByRole('link', { name: '新規登録' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('taosaka1851@gmail.com');
  await page.getByRole('button', { name: '新規登録' }).click();
  await page.goto('https://nextjs-app-yvfr.vercel.app/change-password?email=taosaka1851%40gmail.com&user_id=15&token=cace659c-71a4-4c1c-b5c1-df5ac66d412d');
  await page.getByRole('textbox', { name: '初期パスワード（メールに記載）*' }).click();
  await page.getByRole('textbox', { name: '初期パスワード（メールに記載）*' }).fill('temp_password_123');
  await page.getByRole('textbox', { name: '新しいパスワード*' }).click();
  await page.getByRole('textbox', { name: '新しいパスワード*' }).fill('tgbtgb0331');
  await page.getByRole('textbox', { name: '新しいパスワード*' }).press('Tab');
  await page.getByRole('textbox', { name: '新しいパスワード（確認）*' }).fill('tgbtgb0331');
  await page.getByRole('button', { name: 'パスワードを変更' }).click();
  await page.getByRole('link', { name: 'ログインページに戻る' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('taosaka1851@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('tgbtgb0331');
  await page.getByRole('button', { name: 'ログイン' }).click();
});