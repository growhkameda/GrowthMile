#!/usr/bin/env bash
# ============================================================
# export-evidence.sh
# 受託納品時にエビデンスを一括エクスポートするスクリプト
# 使用方法: bash scripts/export-evidence.sh [出力先パス]
# ============================================================

set -euo pipefail

# ─── 定数 ────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DATE_STAMP="$(date '+%Y-%m-%d')"
OUTPUT_DIR="${1:-$PROJECT_ROOT}"
OUTPUT_FILE="$OUTPUT_DIR/evidence-$DATE_STAMP.zip"

# ─── カラー出力 ──────────────────────────────────────
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }

# ─── エビデンス収集 ──────────────────────────────────
STAGING_DIR="$PROJECT_ROOT/.tmp-evidence-export"
rm -rf "$STAGING_DIR"
# 1. 設計ドキュメントエビデンス（Multi-Agent Debateの結論）
info "設計ドキュメントエビデンスを収集中..."
mkdir -p "$STAGING_DIR/design-docs/features"
cp -r "$PROJECT_ROOT/docs/features/"* "$STAGING_DIR/design-docs/features/" 2>/dev/null || true
cp "$PROJECT_ROOT/docs/"spec-*.md "$STAGING_DIR/design-docs/" 2>/dev/null || true
cp "$PROJECT_ROOT/docs/requirements.md" "$STAGING_DIR/design-docs/" 2>/dev/null || true
ok "設計ドキュメント（要件・仕様書）を収集しました"

# 2. ローカルテストエビデンス（docs/evidence/build-test/ の内容）
info "ローカルテストエビデンスを収集中..."
if [ -d "$PROJECT_ROOT/docs/evidence/build-test" ] && [ "$(ls -A "$PROJECT_ROOT/docs/evidence/build-test" 2>/dev/null | grep -v '.gitkeep')" ]; then
    cp -r "$PROJECT_ROOT/docs/evidence/build-test/"* "$STAGING_DIR/build-test/" 2>/dev/null || true
    find "$STAGING_DIR/build-test" -name ".gitkeep" -delete 2>/dev/null || true
    ok "ローカルテストエビデンスを収集しました"
else
    warn "ローカルテストエビデンスが見つかりません（docs/evidence/build-test/ が空です）"
fi

# 3. E2Eテストエビデンス（e2e/ の結果）
info "E2Eテストエビデンスを収集中..."
if [ -d "$PROJECT_ROOT/e2e/playwright-report" ]; then
    cp -r "$PROJECT_ROOT/e2e/playwright-report" "$STAGING_DIR/e2e-tests/playwright-report" 2>/dev/null || true
    ok "Playwright HTMLレポートを収集しました"
fi
if [ -d "$PROJECT_ROOT/e2e/test-results" ]; then
    cp -r "$PROJECT_ROOT/e2e/test-results" "$STAGING_DIR/e2e-tests/test-results" 2>/dev/null || true
    ok "Playwright テスト結果を収集しました"
fi

# 4. READMEを追加
cat > "$STAGING_DIR/README.md" << EOF
# テストエビデンス — $DATE_STAMP

## 構成

- \`design-docs/\` — Multi-Agent Debateによって生成・合意された設計書（エビデンス）
  - \`features/\`: 各機能の仕様書
  - \`spec-*.md\`: API・DB仕様書等
  - \`requirements.md\`: 要件定義書

- \`build-test/\` — ローカルビルド・テストエビデンス
  - 各サブディレクトリ: 実行日時ごとのエビデンス
  - \`summary.md\`: テスト結果サマリー
  - \`backend-test-report/\`: JUnit HTMLレポート（ブラウザで閲覧可能）
  - \`backend-test-results/\`: JUnit XMLレポート

- \`e2e-tests/\` — E2Eテスト結果（Playwright）
  - \`playwright-report/\`: HTMLレポート（index.htmlをブラウザで開く）
  - \`test-results/\`: スクリーンショット・動画・トレース

## 閲覧方法

1. \`build-test/*/backend-test-report/index.html\` をブラウザで開く
2. \`e2e-tests/playwright-report/index.html\` をブラウザで開く
3. \`design-docs/\` 配下のMarkdownファイルをエディタやプレビューアで開く
EOF

# 5. ZIP作成
info "ZIPファイルを作成中..."
cd "$STAGING_DIR"
if command -v zip &> /dev/null; then
    zip -r "$OUTPUT_FILE" . -x ".*"
else
    # zip コマンドがない場合は tar.gz で代替
    OUTPUT_FILE="$OUTPUT_DIR/evidence-$DATE_STAMP.tar.gz"
    tar -czf "$OUTPUT_FILE" .
fi

# クリーンアップ
rm -rf "$STAGING_DIR"

echo ""
echo "════════════════════════════════════════"
ok "エビデンスのエクスポートが完了しました"
echo "  📁 $OUTPUT_FILE"
echo "════════════════════════════════════════"
