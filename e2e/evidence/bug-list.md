## バグリスト

### バグID：01

```
ログイン画面で不正な情報を入力してログインボタンをクリックした。
「ログイン情報が不正です。正しいログイン情報を入力して下さい。」
と表示されない。
```

詳細
```
Test timeout of 30000ms exceeded.
Copy prompt
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[type="submit"]')


  30 |         await page.fill('input[name="email"]', 'invalid@example.com');
  31 |         await page.fill('input[name="password"]', 'wrongpassword');
> 32 |         await page.click('button[type="submit"]');
     |                    ^
  33 |       } else if (bug.id === '02') {
  34 |         await page.click('button[type="submit"]');
  35 |       }
    at /Users/tatu/Documents/GitHub/Portfolio-Nextjs/e2e/bug-report.spec.ts:32:20
```

### バグID：02
```
入力フォームが空の状態でログインボタンをクリックした。
「メールアドレスもしくはパスワードが入力されていません。」と表示されない。
```

詳細
```
Test timeout of 30000ms exceeded.
Copy prompt
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[type="submit"]')


  32 |         await page.click('button[type="submit"]');
  33 |       } else if (bug.id === '02') {
> 34 |         await page.click('button[type="submit"]');
     |                    ^
  35 |       }
  36 |
  37 |       // エビデンスを保存
    at /Users/tatu/Documents/GitHub/Portfolio-Nextjs/e2e/bug-report.spec.ts:34:20
```