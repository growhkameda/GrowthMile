#!/usr/bin/env bash
# ============================================================
# collect-test-evidence.sh
# テスト通過後にエビデンスを自動収集するスクリプト
# 使用方法: bash scripts/collect-test-evidence.sh
# ============================================================

set -euo pipefail

# ─── 定数 ────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TIMESTAMP="$(date '+%Y-%m-%d_%H%M%S')"
EVIDENCE_DIR="$PROJECT_ROOT/docs/evidence/build-test/$TIMESTAMP"
TEMPLATE="$PROJECT_ROOT/docs/templates/test-evidence-template.md"

# テスト結果のパス
BACKEND_TEST_RESULTS="$PROJECT_ROOT/backend/build/test-results/test"
BACKEND_TEST_REPORT="$PROJECT_ROOT/backend/build/reports/tests/test"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# ─── カラー出力 ──────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ─── Step 1: バックエンドテスト実行 ──────────────────
info "Step 1/4: バックエンドテストを実行中..."
BACKEND_LOG="$PROJECT_ROOT/.tmp-backend-test.log"

cd "$PROJECT_ROOT/backend"
if ./gradlew test 2>&1 | tee "$BACKEND_LOG"; then
    BACKEND_STATUS="PASSED"
    ok "バックエンドテスト: 成功"
else
    BACKEND_STATUS="FAILED"
    error "バックエンドテスト: 失敗"
    error "テストが失敗したため、エビデンス収集を中止します"
    rm -f "$BACKEND_LOG"
    exit 1
fi

# ─── Step 2: フロントエンドビルド実行 ────────────────
info "Step 2/4: フロントエンドビルドを実行中..."
FRONTEND_LOG="$PROJECT_ROOT/.tmp-frontend-build.log"

cd "$FRONTEND_DIR"
if npm run build 2>&1 | tee "$FRONTEND_LOG"; then
    FRONTEND_STATUS="PASSED"
    ok "フロントエンドビルド: 成功"
else
    FRONTEND_STATUS="FAILED"
    error "フロントエンドビルド: 失敗"
    error "ビルドが失敗したため、エビデンス収集を中止します"
    rm -f "$BACKEND_LOG" "$FRONTEND_LOG"
    exit 1
fi

# ─── Step 3: エビデンスディレクトリ作成 ──────────────
info "Step 3/4: エビデンスを収集中..."
mkdir -p "$EVIDENCE_DIR"

# バックエンドテスト結果をコピー
if [ -d "$BACKEND_TEST_RESULTS" ]; then
    mkdir -p "$EVIDENCE_DIR/backend-test-results"
    cp -r "$BACKEND_TEST_RESULTS/"* "$EVIDENCE_DIR/backend-test-results/" 2>/dev/null || true
    ok "JUnit XMLレポートをコピーしました"
fi

if [ -d "$BACKEND_TEST_REPORT" ]; then
    mkdir -p "$EVIDENCE_DIR/backend-test-report"
    cp -r "$BACKEND_TEST_REPORT/"* "$EVIDENCE_DIR/backend-test-report/" 2>/dev/null || true
    ok "JUnit HTMLレポートをコピーしました"
fi

# ビルドログをコピー
cp "$BACKEND_LOG" "$EVIDENCE_DIR/backend-test.log" 2>/dev/null || true
cp "$FRONTEND_LOG" "$EVIDENCE_DIR/frontend-build.log" 2>/dev/null || true

# 一時ファイル削除
rm -f "$BACKEND_LOG" "$FRONTEND_LOG"

# ─── Step 4: サマリーMarkdown生成 ────────────────────
info "Step 4/4: エビデンスサマリーを生成中..."

# テスト件数をXMLから抽出
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

if [ -d "$EVIDENCE_DIR/backend-test-results" ]; then
    for xml in "$EVIDENCE_DIR/backend-test-results/"*.xml; do
        if [ -f "$xml" ]; then
            tests=$(grep -o 'tests="[0-9]*"' "$xml" 2>/dev/null | head -1 | grep -o '[0-9]*' || echo "0")
            failures=$(grep -o 'failures="[0-9]*"' "$xml" 2>/dev/null | head -1 | grep -o '[0-9]*' || echo "0")
            skipped=$(grep -o 'skipped="[0-9]*"' "$xml" 2>/dev/null | head -1 | grep -o '[0-9]*' || echo "0")
            TOTAL_TESTS=$((TOTAL_TESTS + tests))
            FAILED_TESTS=$((FAILED_TESTS + failures))
            SKIPPED_TESTS=$((SKIPPED_TESTS + skipped))
        fi
    done
    PASSED_TESTS=$((TOTAL_TESTS - FAILED_TESTS - SKIPPED_TESTS))
fi

HOSTNAME_VAL=$(hostname 2>/dev/null || echo "unknown")
GIT_BRANCH=$(cd "$PROJECT_ROOT" && git branch --show-current 2>/dev/null || echo "unknown")
GIT_COMMIT=$(cd "$PROJECT_ROOT" && git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# サマリーMarkdown生成
cat > "$EVIDENCE_DIR/summary.md" << EOF
---
title: "テストエビデンス"
project: "PreZen"
date: "$TIMESTAMP"
host: "$HOSTNAME_VAL"
git_branch: "$GIT_BRANCH"
git_commit: "$GIT_COMMIT"
---

# テストエビデンス — $TIMESTAMP

## 実行環境

| 項目 | 値 |
|------|-----|
| 実行日時 | $(date '+%Y-%m-%d %H:%M:%S') |
| ホスト名 | $HOSTNAME_VAL |
| Git ブランチ | $GIT_BRANCH |
| Git コミット | $GIT_COMMIT |

## テスト結果サマリー

### バックエンド（JUnit）

| 項目 | 結果 |
|------|------|
| ステータス | **$BACKEND_STATUS** |
| テスト総数 | $TOTAL_TESTS |
| 成功 | $PASSED_TESTS |
| 失敗 | $FAILED_TESTS |
| スキップ | $SKIPPED_TESTS |

### フロントエンド（TypeScript ビルド）

| 項目 | 結果 |
|------|------|
| ステータス | **$FRONTEND_STATUS** |

## エビデンスファイル

| ファイル | 説明 |
|---------|------|
| \`backend-test-results/\` | JUnit XMLレポート |
| \`backend-test-report/\` | JUnit HTMLレポート（ブラウザで閲覧可能） |
| \`backend-test.log\` | バックエンドテスト実行ログ |
| \`frontend-build.log\` | フロントエンドビルド実行ログ |
EOF

ok "エビデンスサマリーを生成しました: $EVIDENCE_DIR/summary.md"

# ─── 完了 ────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════"
ok "エビデンス収集が完了しました"
echo "  📁 $EVIDENCE_DIR"
echo "════════════════════════════════════════"
