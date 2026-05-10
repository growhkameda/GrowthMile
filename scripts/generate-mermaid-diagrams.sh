#!/usr/bin/env bash
# ============================================================
# Mermaid図 PNG自動生成スクリプト
# 
# 使い方:
#   bash scripts/generate-mermaid-diagrams.sh          # 全対象ファイル
#   bash scripts/generate-mermaid-diagrams.sh <file>   # 個別ファイル
#
# 出力先: docs/diagrams/
# ============================================================

set -euo pipefail

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

# プロジェクトルート
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIAGRAMS_DIR="${PROJECT_ROOT}/docs/diagrams"
MMDC="${PROJECT_ROOT}/node_modules/.bin/mmdc"

# 図面生成対象ファイル（成果物のみ）
TARGET_FILES=(
  "docs/spec-db.md"
  "docs/spec-screen-flow.md"
  "docs/spec-infrastructure.md"
  "docs/spec-operations.md"
  "docs/ai-dev-workflow.md"
  "docs/database_design.md"
)

# ============================================================
# 関数定義
# ============================================================

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_mmdc() {
  if [ ! -f "$MMDC" ]; then
    log_error "mmdc が見つかりません。npm install を実行してください。"
    log_info  "  cd ${PROJECT_ROOT} && npm install"
    exit 1
  fi
}

# MD ファイルから Mermaid ブロックを抽出して個別 .mmd ファイルに書き出す
extract_mermaid_blocks() {
  local md_file="$1"
  local base_name
  base_name="$(basename "$md_file" .md)"
  local temp_dir
  temp_dir="$(mktemp -d)"
  local block_count=0
  local in_mermaid=false
  local current_block=""

  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ ^\`\`\`mermaid ]]; then
      in_mermaid=true
      current_block=""
      continue
    fi

    if [[ "$in_mermaid" == true && "$line" =~ ^\`\`\` ]]; then
      in_mermaid=false
      block_count=$((block_count + 1))
      local mmd_file="${temp_dir}/${base_name}_${block_count}.mmd"
      echo "$current_block" > "$mmd_file"
      continue
    fi

    if [[ "$in_mermaid" == true ]]; then
      if [[ -z "$current_block" ]]; then
        current_block="$line"
      else
        current_block="${current_block}
${line}"
      fi
    fi
  done < "$md_file"

  echo "${temp_dir}:${block_count}"
}

# 単一の .mmd ファイルを PNG に変換
convert_to_png() {
  local mmd_file="$1"
  local output_file="$2"

  "$MMDC" -i "$mmd_file" -o "$output_file" \
    -t default \
    -b white \
    --scale 2 \
    -w 1200 \
    2>/dev/null

  if [ $? -eq 0 ]; then
    return 0
  else
    return 1
  fi
}

# ============================================================
# メイン処理
# ============================================================

main() {
  log_info "Mermaid図 PNG自動生成を開始します..."

  # 前提チェック
  check_mmdc

  # 出力ディレクトリ作成
  mkdir -p "$DIAGRAMS_DIR"

  # 対象ファイルの決定
  local files_to_process=()
  if [ $# -gt 0 ]; then
    # 引数で指定されたファイル
    files_to_process=("$@")
  else
    # デフォルトの対象ファイル
    for f in "${TARGET_FILES[@]}"; do
      local full_path="${PROJECT_ROOT}/${f}"
      if [ -f "$full_path" ]; then
        files_to_process+=("$full_path")
      else
        log_warn "対象ファイルが見つかりません: $f"
      fi
    done
  fi

  local total_diagrams=0
  local failed_diagrams=0

  for md_file in "${files_to_process[@]}"; do
    local relative_path
    relative_path="$(realpath --relative-to="$PROJECT_ROOT" "$md_file" 2>/dev/null || echo "$md_file")"
    log_info "処理中: ${relative_path}"

    # Mermaid ブロックを抽出
    local result
    result="$(extract_mermaid_blocks "$md_file")"
    local temp_dir="${result%%:*}"
    local block_count="${result##*:}"

    if [ "$block_count" -eq 0 ]; then
      log_warn "  Mermaid ブロックが見つかりません"
      continue
    fi

    local base_name
    base_name="$(basename "$md_file" .md)"

    for i in $(seq 1 "$block_count"); do
      local mmd_file="${temp_dir}/${base_name}_${i}.mmd"
      local png_file="${DIAGRAMS_DIR}/${base_name}_${i}.png"

      if convert_to_png "$mmd_file" "$png_file"; then
        log_ok "  → ${base_name}_${i}.png を生成しました"
        total_diagrams=$((total_diagrams + 1))
      else
        log_error "  → ${base_name}_${i}.png の生成に失敗しました"
        failed_diagrams=$((failed_diagrams + 1))
      fi
    done

    # 一時ファイル削除
    rm -rf "$temp_dir"
  done

  echo ""
  echo "════════════════════════════════════════"
  if [ "$failed_diagrams" -eq 0 ]; then
    log_ok "完了: ${total_diagrams} 件の図を生成しました"
  else
    log_warn "完了: ${total_diagrams} 件成功, ${failed_diagrams} 件失敗"
  fi
  echo "  📁 ${DIAGRAMS_DIR}"
  echo "════════════════════════════════════════"
}

main "$@"
