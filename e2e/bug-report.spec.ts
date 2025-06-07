import { test, expect } from '@playwright/test';
import fs from 'fs';

const bugList = [
  {
    id: '01',
    description: 'ログイン画面で不正な情報を入力してログインボタンをクリックした。',
    expected: '「メールアドレスもしくはパスワードが入力されていません。」と表示される。',
  },
  {
    id: '02',
    description: '入力フォームが空の状態でログインボタンをクリックした。',
    expected: '「メールアドレスもしくはパスワードが入力されていません。」と表示される。',
  },
];

const evidenceDir = './e2e/evidence';
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

test.describe('バグリストテスト', () => {
  bugList.forEach((bug) => {
    test(`バグID: ${bug.id}`, async ({ page }) => {
      // テストの前提条件を設定
      await page.goto('https://nextjs-app-yvfr.vercel.app/login');

      // バグの再現手順を記述
      if (bug.id === '01') {
        await page.fill('input[name="email"]', 'invalid@gmail.c');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');
      } else if (bug.id === '02') {
        await page.click('button[type="submit"]');
      }

      // エビデンスを保存
      const screenshotPath = `${evidenceDir}/bug-${bug.id}.png`;
      await page.screenshot({ path: screenshotPath });

      // 期待値を確認
      const errorMessage = await page.locator('.error-message').textContent();
      expect(errorMessage).toContain(bug.expected);

      // テスト結果を記録
      fs.appendFileSync(
        `${evidenceDir}/test-report.txt`,
        `バグID: ${bug.id}\nテスト回数: 1\nエビデンス: ${screenshotPath}\n\n`
      );
    });
  });
});