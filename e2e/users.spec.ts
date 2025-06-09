import { test } from '@playwright/test';

// 環境変数からテスト用メールアドレスとパスワードを取得
const TEST_EMAIL_1 = process.env.E2E_TEST_EMAIL_1 || 'test1@example.com';
const TEST_EMAIL_2 = process.env.E2E_TEST_EMAIL_2 || 'test2@example.com';
const TEST_PASSWORD_1 = process.env.E2E_TEST_PASSWORD_1 || 'password123';
const TEST_PASSWORD_2 = process.env.E2E_TEST_PASSWORD_2 || 'password456';

test('test', async ({ page }) => {
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('link', { name: 'ホームに戻る' }).click();
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('link', { name: 'ホームに戻る' }).click();
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('link', { name: '新規登録はこちら' }).click();
  await page.getByRole('link', { name: '登録済みの方はこちら' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_1);
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD_1);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.getByRole('button', { name: 'ログアウト' }).click();
  await page.getByRole('link', { name: 'ログイン画面へ戻る' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('da');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('1');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_1);
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'ログイン' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByText('ログインEmailPassword').click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12');
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.getByRole('link', { name: 'ログイン画面に戻る' }).click();
  await page.getByRole('link', { name: '新規登録はこちら' }).click();
  await page.getByRole('link', { name: '登録済みの方はこちら' }).click();
  await page.getByRole('link', { name: '新規登録はこちら' }).click();
  await page.getByRole('link', { name: '登録済みの方はこちら' }).click();
  await page.getByRole('link', { name: 'ホームに戻る' }).click();
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('link', { name: 'ホームに戻る' }).click();
  await page.getByRole('link', { name: '新規登録' }).click();
  await page.getByRole('link', { name: '登録済みの方はこちら' }).click();
});
test('login with different user', async ({ page }) => {
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_1);
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD_1);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.getByRole('button', { name: 'ログアウト' }).click();
  await page.getByRole('link', { name: 'ログイン画面へ戻る' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL_2);
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD_2);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.getByRole('button', { name: 'ログアウト' }).click();
});