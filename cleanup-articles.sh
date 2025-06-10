#!/bin/bash

# テスト記事クリーンアップスクリプト
# 使用方法: ./cleanup-articles.sh [オプション]

set -e

# カラー出力の設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# プロジェクトディレクトリに移動
cd "$(dirname "$0")/.."

echo -e "${BLUE}🧹 テスト記事クリーンアップツール${NC}"
echo "======================================"

# 環境変数の確認
echo -e "${YELLOW}📋 環境変数を確認中...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.localファイルが見つかりません${NC}"
    exit 1
fi

# Node.jsで環境変数を確認
EMAIL=$(node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.E2E_TEST_EMAIL_1 || 'undefined')")
PASSWORD=$(node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.E2E_TEST_PASSWORD_1 || 'undefined')")

if [ "$EMAIL" = "undefined" ] || [ "$PASSWORD" = "undefined" ]; then
    echo -e "${RED}❌ 環境変数が正しく設定されていません${NC}"
    echo "E2E_TEST_EMAIL_1: $EMAIL"
    echo "E2E_TEST_PASSWORD_1: $PASSWORD"
    exit 1
fi

echo -e "${GREEN}✅ 認証情報確認完了${NC}"
echo "Email: $EMAIL"

# メニュー表示
echo ""
echo "実行したい操作を選択してください:"
echo "1) 記事一覧を確認（安全）"
echo "2) E2Eテスト関連記事を一括削除"
echo "3) 特定パターンの記事を削除"
echo "4) 全てのクリーンアップテストを実行"
echo "5) 終了"
echo ""

read -p "選択 (1-5): " choice

case $choice in
    1)
        echo -e "${BLUE}📋 記事一覧を確認中...${NC}"
        npx playwright test e2e/cleanup_test_articles.spec.ts --grep "手動選択による記事削除" --reporter=line
        ;;
    2)
        echo -e "${YELLOW}⚠️  E2Eテスト関連記事を一括削除します${NC}"
        echo "削除対象: E2E-Test*, 下書きテスト-*, 公開テスト-*, テスト記事-*, など"
        read -p "続行しますか？ (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            echo -e "${RED}🗑️  一括削除を実行中...${NC}"
            npx playwright test e2e/cleanup_test_articles.spec.ts --grep "E2Eテスト関連記事の一括削除" --reporter=line
        else
            echo -e "${YELLOW}キャンセルされました${NC}"
        fi
        ;;
    3)
        echo -e "${BLUE}🎯 特定パターンの記事削除${NC}"
        echo "注意: cleanup_test_articles.spec.ts ファイル内の targetPattern を編集してから実行してください"
        read -p "続行しますか？ (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            npx playwright test e2e/cleanup_test_articles.spec.ts --grep "特定パターンの記事削除" --reporter=line
        else
            echo -e "${YELLOW}キャンセルされました${NC}"
        fi
        ;;
    4)
        echo -e "${BLUE}🔄 全てのクリーンアップテストを実行中...${NC}"
        npx playwright test e2e/cleanup_test_articles.spec.ts --reporter=line
        ;;
    5)
        echo -e "${GREEN}👋 終了します${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ 無効な選択です${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ 操作完了${NC}"
echo -e "${BLUE}💡 詳細な使用方法は e2e/CLEANUP_GUIDE.md を参照してください${NC}"
