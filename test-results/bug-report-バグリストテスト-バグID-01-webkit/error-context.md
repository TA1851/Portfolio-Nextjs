# Test info

- Name: バグリストテスト >> バグID: 01
- Location: /Users/tatu/Documents/GitHub/Portfolio-Nextjs/e2e/bug-report.spec.ts:24:9

# Error details

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[type="submit"]')

    at /Users/tatu/Documents/GitHub/Portfolio-Nextjs/e2e/bug-report.spec.ts:32:20
```

# Page snapshot

```yaml
- heading "ログイン" [level=2]
- text: Email
- textbox "Email": invalid@example.com
- text: Password
- textbox "Password": wrongpassword
- button "ログイン"
- paragraph:
  - link "新規登録はこちら":
    - /url: /register
- paragraph:
  - link "ホームに戻る":
    - /url: /
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import fs from 'fs';
   3 |
   4 | const bugList = [
   5 |   {
   6 |     id: '01',
   7 |     description: 'ログイン画面で不正な情報を入力してログインボタンをクリックした。',
   8 |     expected: '「ログイン情報が不正です。正しいログイン情報を入力して下さい。」と表示される。',
   9 |   },
  10 |   {
  11 |     id: '02',
  12 |     description: '入力フォームが空の状態でログインボタンをクリックした。',
  13 |     expected: '「メールアドレスもしくはパスワードが入力されていません。」と表示される。',
  14 |   },
  15 | ];
  16 |
  17 | const evidenceDir = './e2e/evidence';
  18 | if (!fs.existsSync(evidenceDir)) {
  19 |   fs.mkdirSync(evidenceDir, { recursive: true });
  20 | }
  21 |
  22 | test.describe('バグリストテスト', () => {
  23 |   bugList.forEach((bug) => {
  24 |     test(`バグID: ${bug.id}`, async ({ page }) => {
  25 |       // テストの前提条件を設定
  26 |       await page.goto('https://nextjs-app-yvfr.vercel.app/login');
  27 |
  28 |       // バグの再現手順を記述
  29 |       if (bug.id === '01') {
  30 |         await page.fill('input[name="email"]', 'invalid@example.com');
  31 |         await page.fill('input[name="password"]', 'wrongpassword');
> 32 |         await page.click('button[type="submit"]');
     |                    ^ Error: page.click: Test timeout of 30000ms exceeded.
  33 |       } else if (bug.id === '02') {
  34 |         await page.click('button[type="submit"]');
  35 |       }
  36 |
  37 |       // エビデンスを保存
  38 |       const screenshotPath = `${evidenceDir}/bug-${bug.id}.png`;
  39 |       await page.screenshot({ path: screenshotPath });
  40 |
  41 |       // 期待値を確認
  42 |       const errorMessage = await page.locator('.error-message').textContent();
  43 |       expect(errorMessage).toContain(bug.expected);
  44 |
  45 |       // テスト結果を記録
  46 |       fs.appendFileSync(
  47 |         `${evidenceDir}/test-report.txt`,
  48 |         `バグID: ${bug.id}\nテスト回数: 1\nエビデンス: ${screenshotPath}\n\n`
  49 |       );
  50 |     });
  51 |   });
  52 | });
```