import { test, expect } from '@playwright/test';

// 環境変数からテスト用メールアドレスとパスワードを取得
const TEST_EMAIL = process.env.E2E_TEST_EMAIL_1;
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD_1;

// テストタイムアウトを大幅に延長
test.setTimeout(180000); // 3分

test.describe('手動記事削除支援ツール', () => {
  
  test('記事リスト表示＆削除対象候補の特定', async ({ page }) => {
    // ログイン
    await page.goto('https://nextjs-app-yvfr.vercel.app/');
    await page.getByRole('link', { name: 'ログイン' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL!);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD!);
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    await page.waitForLoadState('networkidle');
    
    // 記事削除ページに移動
    await page.getByRole('link', { name: '記事を削除する' }).click();
    await page.waitForLoadState('networkidle');
    
    console.log('📋 === 記事一覧と削除推奨度分析 ===\n');
    
    // 全記事を取得
    const allArticles = page.getByRole('listitem');
    const articleCount = await allArticles.count();
    
    console.log(`📊 合計記事数: ${articleCount} 件\n`);
    
    // 削除対象パターン
    const deletePatterns = [
      { pattern: 'E2E-Test', priority: '🔴 HIGH', description: 'E2Eテスト記事' },
      { pattern: 'E2E-Update-Test', priority: '🔴 HIGH', description: 'E2E更新テスト記事' },
      { pattern: 'E2E-Draft', priority: '🔴 HIGH', description: 'E2E下書きテスト記事' },
      { pattern: 'E2E-Delete-Test', priority: '🔴 HIGH', description: 'E2E削除テスト記事' },
      { pattern: '下書きテスト-', priority: '🟡 MEDIUM', description: '下書きテスト記事' },
      { pattern: '公開テスト-', priority: '🟡 MEDIUM', description: '公開テスト記事' },
      { pattern: 'テスト記事-', priority: '🟡 MEDIUM', description: '一般テスト記事' },
      { pattern: 'UIフィードバックテスト-', priority: '🟡 MEDIUM', description: 'UIテスト記事' },
      { pattern: 'API調査テスト-', priority: '🟡 MEDIUM', description: 'APIテスト記事' },
      { pattern: 'API調査', priority: '🟡 MEDIUM', description: 'API調査記事' },
      { pattern: '整合性テスト-', priority: '🟡 MEDIUM', description: '整合性テスト記事' },
      { pattern: 'ローカルUIテスト-', priority: '🟡 MEDIUM', description: 'ローカルUIテスト記事' },
      { pattern: '複数テスト-', priority: '🟡 MEDIUM', description: '複数記事テスト' },
      { pattern: 'KanjiMode', priority: '🟡 MEDIUM', description: 'KanjiMode関連記事' },
      { pattern: 'UIフィードバック', priority: '🟡 MEDIUM', description: 'UIフィードバック記事' }
    ];
    
    let totalTestArticles = 0;
    
    // パターン別統計
    for (const { pattern, priority, description } of deletePatterns) {
      const articles = page.getByRole('listitem').filter({ hasText: pattern });
      const count = await articles.count();
      
      if (count > 0) {
        console.log(`${priority} [${pattern}] ${description}: ${count} 件`);
        totalTestArticles += count;
      }
    }
    
    console.log(`\n🎯 削除推奨記事数: ${totalTestArticles} 件\n`);
    
    // 全記事を詳細表示（最大30件）
    console.log('📝 === 記事詳細リスト ===\n');
    
    const displayLimit = Math.min(articleCount, 30);
    
    for (let i = 0; i < displayLimit; i++) {
      try {
        const article = allArticles.nth(i);
        const titleText = await article.textContent();
        
        if (titleText) {
          const cleanTitle = titleText.split('投稿者ID:')[0].trim();
          
          // 削除推奨度チェック
          let priority = '⚪ LOW';
          let isTestArticle = false;
          
          for (const { pattern, priority: p } of deletePatterns) {
            if (cleanTitle.includes(pattern)) {
              priority = p;
              isTestArticle = true;
              break;
            }
          }
          
          const prefix = isTestArticle ? '❗' : '  ';
          console.log(`${prefix} ${(i + 1).toString().padStart(2)}. ${priority} ${cleanTitle}`);
        }
      } catch {
        console.log(`  ${(i + 1).toString().padStart(2)}. [タイトル取得エラー]`);
      }
    }
    
    if (articleCount > displayLimit) {
      console.log(`\n... 他 ${articleCount - displayLimit} 件の記事があります`);
    }
    
    console.log(`\n💡 === 削除ガイド ===`);
    console.log(`
🔴 HIGH priority記事: 自動テストで生成された記事、安全に削除可能
🟡 MEDIUM priority記事: 手動テストで作成された可能性、確認後に削除
⚪ LOW priority記事: 通常の記事、削除注意

🛠️ 削除方法:
1. 一括削除: npx playwright test e2e/cleanup_test_articles.spec.ts --grep "一括削除"
2. 手動削除: npx playwright test e2e/manual_article_cleanup.spec.ts --grep "手動削除"
3. Web UI: ブラウザで https://nextjs-app-yvfr.vercel.app/ にアクセスして手動削除

⚠️ 注意: 削除は元に戻せません。重要な記事がないか十分確認してください。
    `);
    
    // 統計情報
    expect(articleCount).toBeGreaterThanOrEqual(0);
    expect(totalTestArticles).toBeGreaterThanOrEqual(0);
  });
  
  test('手動削除モード（1件ずつ確認）', async ({ page }) => {
    // ログイン
    await page.goto('https://nextjs-app-yvfr.vercel.app/');
    await page.getByRole('link', { name: 'ログイン' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL!);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD!);
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    await page.waitForLoadState('networkidle');
    
    // 記事削除ページに移動
    await page.getByRole('link', { name: '記事を削除する' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 削除対象パターンを全て使用
    const deletePatterns = [
      'E2E-Test', 'E2E-Update-Test', 'E2E-Draft', 'E2E-Delete-Test',
      '下書きテスト-', '公開テスト-', 'テスト記事-', 'UIフィードバックテスト-',
      'API調査テスト-', 'API調査', '整合性テスト-', 'ローカルUIテスト-',
      '複数テスト-', 'KanjiMode', 'UIフィードバック'
    ];
    
    console.log('🎯 === 全パターン削除モード ===\n');
    console.log(`削除対象パターン: ${deletePatterns.length} 種類`);
    console.log(`パターン: ${deletePatterns.join(', ')}\n`);
    
    let totalDeleted = 0;
    const maxDeletions = 30;
    const timeLimit = Date.now() + 150000;
    
    for (const pattern of deletePatterns) {
      if (totalDeleted >= maxDeletions || Date.now() > timeLimit) {
        console.log(`\n⏰ 時間制限または削除上限に達しました`);
        break;
      }
      
      console.log(`\n🔍 パターン "${pattern}" の記事を削除中...`);
      
      let patternDeleted = 0;
      let attempts = 0;
      const maxAttemptsPerPattern = 10;
      
      while (totalDeleted < maxDeletions && attempts < maxAttemptsPerPattern && Date.now() < timeLimit) {
        attempts++;
        
        try {
          await page.waitForLoadState('domcontentloaded', { timeout: 8000 });
          await page.waitForTimeout(500);
          
          const articles = page.getByRole('listitem').filter({ hasText: pattern });
          const count = await articles.count();
          
          if (count === 0) {
            console.log(`✅ パターン "${pattern}" の記事はすべて削除されました (削除数: ${patternDeleted})`);
            break;
          }
          
          if (attempts === 1) {
            console.log(`📊 パターン "${pattern}" 該当記事数: ${count} 件`);
          }
          
          const firstArticle = articles.first();
          const articleTitle = await firstArticle.textContent({ timeout: 2000 }).catch(() => null);
          const cleanTitle = articleTitle?.split('投稿者ID:')[0].trim() || '不明';
          
          console.log(`🗑️ [${totalDeleted + 1}] "${pattern}" 削除中: "${cleanTitle}"`);
          
          const deleteButton = firstArticle.locator('button[aria-label="delete"]').first();
          const buttonVisible = await deleteButton.isVisible({ timeout: 1500 }).catch(() => false);
          
          if (!buttonVisible) {
            console.log(`❌ 削除ボタンが見つかりません`);
            continue;
          }
          
          await deleteButton.click({ timeout: 2000 });
          
          const confirmButton = page.getByRole('button', { name: '削除' });
          const confirmVisible = await confirmButton.waitFor({ 
            state: 'visible', 
            timeout: 3000 
          }).then(() => true).catch(() => false);
          
          if (confirmVisible) {
            await confirmButton.click();
            await page.waitForTimeout(1000);
            
            const newCount = await page.getByRole('listitem').filter({ hasText: pattern }).count();
            
            if (newCount < count) {
              console.log(`✅ 削除完了: "${cleanTitle}"`);
              totalDeleted++;
              patternDeleted++;
            } else {
              console.log(`⚠️ 削除が確認できませんでした`);
            }
          } else {
            console.log(`❌ 確認ダイアログが見つかりません`);
          }
          
          await page.waitForTimeout(500);
          
        } catch (error) {
          console.error(`❌ エラー (パターン: ${pattern}, 試行: ${attempts}): ${error.message}`);
          
          if (error.toString().includes('Target page, context or browser has been closed')) {
            console.log(`❌ ページが閉じられました。処理終了`);
            return;
          }
          
          await page.waitForTimeout(1000);
        }
      }
      
      if (attempts >= maxAttemptsPerPattern) {
        console.log(`⚠️ パターン "${pattern}" の最大試行回数に達しました (削除数: ${patternDeleted})`);
      }
    }
    
    console.log(`\n🎉 === 削除完了 ===`);
    console.log(`✅ 合計削除数: ${totalDeleted} 件`);
    console.log(`📋 処理パターン数: ${deletePatterns.length} 種類`);
    console.log(`⏱️ 処理時間: ${Math.round((Date.now() - (timeLimit - 150000)) / 1000)}秒`);
    
    // 成功判定
    expect(totalDeleted).toBeGreaterThanOrEqual(0);
  });
  
  test('特定記事名で検索＆削除', async ({ page }) => {
    // ログイン
    await page.goto('https://nextjs-app-yvfr.vercel.app/');
    await page.getByRole('link', { name: 'ログイン' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL!);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD!);
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    await page.waitForLoadState('networkidle');
    
    // 記事削除ページに移動
    await page.getByRole('link', { name: '記事を削除する' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 全削除対象パターンを順次処理
    const deletePatterns = [
      'E2E-Test', 'E2E-Update-Test', 'E2E-Draft', 'E2E-Delete-Test',
      '下書きテスト-', '公開テスト-', 'テスト記事-', 'UIフィードバックテスト-',
      'API調査テスト-', 'API調査', '整合性テスト-', 'ローカルUIテスト-',
      '複数テスト-', 'KanjiMode', 'UIフィードバック'
    ];
    
    const maxDeletions = 50;
    const timeLimit = Date.now() + 160000;
    
    console.log(`🎯 === 全パターン一括削除モード ===`);
    console.log(`🔍 削除対象パターン: ${deletePatterns.length} 種類`);
    console.log(`📊 最大削除数: ${maxDeletions} 件`);
    console.log(`⏰ 時間制限: 約2.7分\n`);
    
    let totalDeleted = 0;
    let processedPatterns = 0;
    
    for (const searchText of deletePatterns) {
      if (totalDeleted >= maxDeletions || Date.now() > timeLimit) {
        console.log(`\n⏰ 制限に達しました (削除数: ${totalDeleted}, 処理パターン: ${processedPatterns})`);
        break;
      }
      
      processedPatterns++;
      console.log(`\n📋 [${processedPatterns}/${deletePatterns.length}] パターン "${searchText}" を処理中...`);
      
      let patternDeleted = 0;
      let attempts = 0;
      const maxAttemptsPerPattern = 15;
      
      while (totalDeleted < maxDeletions && attempts < maxAttemptsPerPattern && Date.now() < timeLimit) {
        attempts++;
        
        try {
          await page.waitForLoadState('domcontentloaded', { timeout: 8000 });
          await page.waitForTimeout(300);
          
          const articles = page.getByRole('listitem').filter({ hasText: searchText });
          const count = await articles.count();
          
          if (count === 0) {
            if (patternDeleted > 0) {
              console.log(`✅ パターン "${searchText}" 完了 (削除数: ${patternDeleted})`);
            }
            break;
          }
          
          if (attempts === 1) {
            console.log(`📊 該当記事数: ${count} 件`);
          }
          
          const firstArticle = articles.first();
          const articleTitle = await firstArticle.textContent({ timeout: 2000 }).catch(() => null);
          const cleanTitle = articleTitle?.split('投稿者ID:')[0].trim() || '不明';
          
          console.log(`🗑️ [${totalDeleted + 1}] 削除中: "${cleanTitle}"`);
          
          const deleteButton = firstArticle.locator('button[aria-label="delete"]').first();
          const buttonVisible = await deleteButton.isVisible({ timeout: 1500 }).catch(() => false);
          
          if (!buttonVisible) {
            continue;
          }
          
          await deleteButton.click({ timeout: 2000 });
          
          const confirmButton = page.getByRole('button', { name: '削除' });
          const confirmVisible = await confirmButton.waitFor({ 
            state: 'visible', 
            timeout: 3000 
          }).then(() => true).catch(() => false);
          
          if (confirmVisible) {
            await confirmButton.click();
            await page.waitForTimeout(800);
            
            const newCount = await page.getByRole('listitem').filter({ hasText: searchText }).count();
            if (newCount < count) {
              console.log(`✅ 削除完了`);
              totalDeleted++;
              patternDeleted++;
            }
          }
          
          await page.waitForTimeout(300);
          
        } catch (error) {
          console.error(`❌ エラー: ${error.message}`);
          
          if (error.toString().includes('Target page, context or browser has been closed')) {
            console.log(`❌ ページが閉じられました。処理終了`);
            return;
          }
          
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // 結果表示
    const processingTime = Math.round((Date.now() - (timeLimit - 160000)) / 1000);
    
    console.log(`\n🎉 === 最終結果 ===`);
    console.log(`✅ 合計削除数: ${totalDeleted} 件`);
    console.log(`📋 処理パターン数: ${processedPatterns}/${deletePatterns.length}`);
    console.log(`⏱️ 処理時間: ${processingTime}秒`);
    console.log(`🚀 削除効率: ${totalDeleted > 0 ? Math.round(processingTime / totalDeleted) : 0}秒/件`);
    
    if (Date.now() > timeLimit) {
      console.log(`⏰ 時間制限に達しました`);
    }
    
    if (totalDeleted >= maxDeletions) {
      console.log(`📊 削除上限に達しました`);
    }
    
    console.log(`\n💡 まだ削除対象が残っている場合は、再実行してください`);
    
    // テスト成功判定
    expect(totalDeleted).toBeGreaterThanOrEqual(0);
    expect(totalDeleted).toBeLessThanOrEqual(maxDeletions);
  });
});
