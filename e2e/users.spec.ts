import { test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://nextjs-app-yvfr.vercel.app/');
  await page.getByRole('link', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('darry6335@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('123');
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.getByRole('button', { name: 'ログアウト' }).click();
  await page.getByRole('link', { name: 'ログイン画面へ戻る' }).click();
  await page.getByRole('link', { name: '新規登録はこちら' }).click();
  await page.getByRole('link', { name: '登録済みの方はこちら' }).click();
  await page.getByRole('link', { name: 'ホームに戻る' }).click();
  await page.getByRole('link', { name: 'ログイン' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('');
  await page.getByRole('textbox', { name: 'Email' }).fill('Eisu');
  await page.getByRole('textbox', { name: 'Email' }).fill('darry633512');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.getByRole('link', { name: 'ホームに戻る' }).click();
});