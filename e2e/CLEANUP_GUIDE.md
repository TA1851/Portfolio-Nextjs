# 🧹 テスト記事クリーンアップガイド

E2Eテストで生成された記事が増えすぎた場合の削除方法を説明します。

## 📋 利用可能なクリーンアップ方法

### 1. まず現状確認（推奨）
削除前に記事の状況を把握しましょう。

```bash
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "記事リスト表示"
```

このコマンドで以下が確認できます：
- 現在の記事総数
- 削除対象となるテスト記事の件数と優先度
- 各記事の詳細リスト

### 2. 全パターン一括削除（効率的・推奨）
全ての削除対象パターンの記事を自動で削除します。

```bash
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "手動削除モード"
```

**特徴:**
- 一度に最大30件まで削除
- 全15種類の削除対象パターンを処理
- 2.5分の時間制限付き
- 安全な削除制限付き

### 3. 高速一括削除（大量削除向け）
より多くの記事を効率的に削除します。

```bash
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "特定記事名で検索"
```

**特徴:**
- 一度に最大50件まで削除
- 約2.7分の時間制限
- 全パターン順次処理
- 高速削除アルゴリズム

## 🎯 削除対象パターン（全15種類）

### 🔴 HIGH Priority（自動削除推奨）
- `E2E-Test` - E2Eテスト記事
- `E2E-Update-Test` - E2E更新テスト記事  
- `E2E-Draft` - E2E下書きテスト記事
- `E2E-Delete-Test` - E2E削除テスト記事

### 🟡 MEDIUM Priority（確認後削除）
- `下書きテスト-` - 下書きテスト記事
- `公開テスト-` - 公開テスト記事
- `テスト記事-` - 一般テスト記事
- `UIフィードバックテスト-` - UIテスト記事
- `API調査テスト-` - APIテスト記事
- `API調査` - API調査記事
- `整合性テスト-` - 整合性テスト記事
- `ローカルUIテスト-` - ローカルUIテスト記事
- `複数テスト-` - 複数記事テスト
- `KanjiMode` - KanjiMode関連記事
- `UIフィードバック` - UIフィードバック記事

### ⚪ LOW Priority（削除注意）
- その他の記事（通常の記事の可能性）

## 🔧 使用方法

### Step 1: 現状確認（必須）

まず記事の現状を把握しましょう：

```bash
cd /Users/tatu/Documents/GitHub/Portfolio-Nextjs
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "記事リスト表示"
```

このコマンドで以下が確認できます：
- 現在の記事総数
- 削除推奨記事の優先度別統計  
- 各記事の詳細リスト（最大30件）

### Step 2: 削除方法の選択

#### A. 全パターン削除（推奨）
全15種類の削除対象パターンを自動処理：

```bash
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "手動削除モード"
```

**出力例:**
```
🎯 === 全パターン削除モード ===

削除対象パターン: 15 種類
パターン: E2E-Test, E2E-Update-Test, E2E-Draft, ...

🔍 パターン "E2E-Test" の記事を削除中...
📊 パターン "E2E-Test" 該当記事数: 8 件
🗑️ [1] "E2E-Test" 削除中: "E2E-Test-1701234567890"
✅ 削除完了: "E2E-Test-1701234567890"
...
✅ パターン "E2E-Test" の記事はすべて削除されました (削除数: 8)

🎉 === 削除完了 ===
✅ 合計削除数: 23 件
📋 処理パターン数: 15 種類
⏱️ 処理時間: 45秒
```

#### B. 高速大量削除
より多くの記事を効率的に削除：

```bash
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "特定記事名で検索"
```

**出力例:**
```
🎯 === 全パターン一括削除モード ===
🔍 削除対象パターン: 15 種類
📊 最大削除数: 50 件
⏰ 時間制限: 約2.7分

📋 [1/15] パターン "E2E-Test" を処理中...
📊 該当記事数: 12 件
🗑️ [1] 削除中: "E2E-Test-1701234567890"
✅ 削除完了
...
✅ パターン "E2E-Test" 完了 (削除数: 12)

🎉 === 最終結果 ===
✅ 合計削除数: 35 件
📋 処理パターン数: 8/15
⏱️ 処理時間: 87秒
🚀 削除効率: 2秒/件
```

### Step 3: 結果確認

削除後に再度現状確認を実行：

```bash
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "記事リスト表示"
```

## ⚠️ 安全機能と制限

### 自動安全制限
- **削除数制限**: 1回の実行で最大30-50件まで
- **時間制限**: 2.5-2.7分の実行時間制限
- **エラー対策**: ページクローズやネットワークエラーに対応
- **段階的削除**: パターンごとに順次処理

### 削除対象の厳格チェック
全ての記事は以下の15種類のパターンに厳格にマッチした場合のみ削除されます：
1. `E2E-Test` - E2Eテスト記事
2. `E2E-Update-Test` - E2E更新テスト記事
3. `E2E-Draft` - E2E下書きテスト記事
4. `E2E-Delete-Test` - E2E削除テスト記事
5. `下書きテスト-` - 下書きテスト記事
6. `公開テスト-` - 公開テスト記事
7. `テスト記事-` - 一般テスト記事
8. `UIフィードバックテスト-` - UIテスト記事
9. `API調査テスト-` - APIテスト記事
10. `API調査` - API調査記事
11. `整合性テスト-` - 整合性テスト記事
12. `ローカルUIテスト-` - ローカルUIテスト記事
13. `複数テスト-` - 複数記事テスト
14. `KanjiMode` - KanjiMode関連記事
15. `UIフィードバック` - UIフィードバック記事

## 📊 実行シナリオ別ガイド

### シナリオ1: 少量のテスト記事（10-30件）
```bash
# 1. 現状確認
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "記事リスト表示"

# 2. 全パターン削除で一括処理
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "手動削除モード"

# 3. 結果確認
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "記事リスト表示"
```

### シナリオ2: 大量のテスト記事（50件以上）
```bash
# 1. 現状確認
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "記事リスト表示"

# 2. 高速大量削除（複数回実行）
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "特定記事名で検索"

# 3. 必要に応じて再実行
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "特定記事名で検索"

# 4. 最終確認
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "記事リスト表示"
```

### シナリオ3: 特定パターンのみ削除
ファイルを編集して特定のパターンのみを対象にする場合：

```typescript
// manual_article_cleanup.spec.ts の deletePatterns 配列を編集
const deletePatterns = [
  'KanjiMode',        // KanjiMode関連のみ
  'UIフィードバック'   // UIフィードバック関連のみ
];
```

## 🔄 定期クリーンアップの推奨手順

### 日次（テスト後）
```bash
# 簡単な現状確認と少量削除
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "記事リスト表示"
# 必要に応じて
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "手動削除モード"
```

### 週次（定期メンテナンス）
```bash
# 徹底的なクリーンアップ
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "特定記事名で検索"
# 複数回実行して完全削除
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "特定記事名で検索"
```

## 🆘 トラブルシューティング

### タイムアウトエラー
```bash
# より短時間での削除を試行
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "手動削除モード"
```

### ネットワークエラー
```bash
# ブラウザ表示で実行して状況確認
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "手動削除モード" --headed
```

### 削除が不完全
```bash
# 再度実行（安全制限により残りが削除される）
npx playwright test e2e/manual_article_cleanup.spec.ts --grep "特定記事名で検索"
```

## 💡 最適化のコツ

1. **事前確認必須**: 削除前に必ず現状確認
2. **段階的実行**: 大量削除時は複数回に分けて実行
3. **時間帯考慮**: サーバー負荷の少ない時間帯での実行
4. **ログ監視**: 削除ログを確認して効率を把握
5. **定期実行**: 蓄積を防ぐため定期的なクリーンアップ

## 📈 削除効率の目安

- **通常削除**: 2-3秒/件
- **高速削除**: 1-2秒/件  
- **推奨バッチサイズ**: 20-30件/回
- **推奨実行頻度**: 週1-2回

記事が大量に蓄積する前に定期的なクリーンアップを行うことで、効率的にシステムを維持できます。
