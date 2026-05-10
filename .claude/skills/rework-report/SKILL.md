---
name: rework-report
description: >
  差し戻し・失敗発生時のEvidence Bundleを所定フォーマットで出力し、
  所定のディレクトリに保存するスキル。
  設計フェーズ（Agent B指摘・人間差し戻し）と実装・テストフェーズ
  （ビルド・テスト・CI・ST失敗）の双方に対応する。
  FAIL・NEEDS_HUMAN_REVIEW 判定時に自動で起動、または /rework-report で手動起動。
---

# rework-report スキル

差し戻し・失敗発生時に Evidence Bundle を出力し、`docs/evidence/` 配下の適切なサブディレクトリに保存するスキルです。
James Ralph (2026)「Agentic Full-Stack Development」の Evidence Bundle 概念に基づき、すべての差し戻し事象を、「証拠に基づく・再現可能・構造化された」フォーマットで出力します。

---

## 起動条件

以下のいずれかが発生した場合に本スキルを起動すること:

1. `implement-and-verify.md` の Step 3 で **FAIL** または **NEEDS_HUMAN_REVIEW** と判定された
2. `design-rework.md` ワークフローの Agent B レビューで **Critical / Major** 指摘が発生した
3. ビルド・テスト・CI・Lint のいずれかが失敗した
4. 人間が ST 差し戻しを通知した
5. ユーザーが `/rework-report` を手動で呼び出した

---

## 実行手順

### Step 1: 差し戻し種別を確定する

以下の判定表に従って差し戻し種別を確定し、対応するテンプレートを選択すること:

| 差し戻し種別 | 使用テンプレート | 保存先 | ファイル名規則 |
| ------------ | --------------- | ------- | -------------- |
| 設計・Agent B指摘 | `.claude/workflows/design-rework.md` のテンプレート | `docs/evidence/design-reviews/` | `YYYYMMDD-{機能名}-debate-v{N}.md` |
| 設計・人間差し戻し | `.claude/workflows/design-rework.md` のテンプレート | `docs/evidence/design-reviews/` | `YYYYMMDD-{機能名}-human-review.md` |
| 設計・AIレビューサマリー | `.claude/workflows/design-rework.md` のテンプレート | `docs/evidence/ai-reviews/` | `YYYYMMDD-{機能名}-ai-review.md` |
| ビルドエラー | `.claude/workflows/build-fail-report.md` のテンプレート | `docs/evidence/build-test/` | `YYYYMMDD-HHmm-build-fail.md` |
| テスト失敗 | `.claude/workflows/build-fail-report.md` のテンプレート | `docs/evidence/build-test/` | `YYYYMMDD-HHmm-test-fail.md` |
| CI失敗 | `.claude/workflows/build-fail-report.md` のテンプレート | `docs/evidence/build-test/` | `YYYYMMDD-HHmm-ci-fail.md` |
| コードレビュー指摘(Major) | `.claude/workflows/build-fail-report.md` のテンプレート | `docs/evidence/ai-reviews/` | `YYYYMMDD-HHmm-code-review.md` |
| ST差し戻し | `.claude/workflows/build-fail-report.md` のテンプレート | `docs/evidence/build-test/` | `YYYYMMDD-HHmm-st-rework.md` |

### Step 2: Evidence Bundleを収集する

差し戻し種別に応じて以下を収集すること:

**設計フェーズの場合**

- 対象設計書のパスとバージョン（ディベートラウンド番号）
- 指摘の具体・重大度・詳細内容
- 前回からの変更差分（あれば）

**実装・テストフェーズの場合**

- 実行したコマンドと終了コード（成功・失敗）
- エラーログの関連箇所（全量ではなく根本に絞る）
- 影響するファイルパス
- 根本原因の特定（「表面上」ではなく「根本」を分析すること）

### Step 3: Evidence Bundleを出力し保存する

1. Step 1 で選択したテンプレートのフォーマットに従って Evidence Bundle を作成する
2. 以下のコマンドで保存先ファイルを作成する:

保存例（テスト失敗の場合）:

```bash
DATE=$(date +%Y%m%d-%H%M)
# docs/evidence/build-test/${DATE}-test-fail.md にテンプレートの内容を記入して保存
```

1. ファイル保存後、ユーザーに以下を報告する:

```text
## 差し戻し報告完了
- 種別: {差し戻し種別}
- 保存先: {保存したファイルパス}
- 判定: FAIL | NEEDS_HUMAN_REVIEW

{端的な対応の要点を2-3行で説明}

次アクション: {修正して再実行 | 人間にエスカレーション}
```

### Step 4: 次アクションを提示して待機する

- **FAIL（修正可能）**: 端的な対応を実行し、修正後に `implement-and-verify.md` Step 2 から再実行することを伝える
- **NEEDS_HUMAN_REVIEW**: 影響範囲と設計的変更の有無を提示し、人間の指示を待つ
- **設計差し戻し**: 修正すべき設計書のパスと修正案の概要を実行し、`requirement-review-loop.md` Step 2 から再実行することを伝える

---

## 制約・倫理

- Evidence Bundle には個人情報（メールアドレス・パスワード・トークン）を含めないこと
- APIキー・シークレット・認証情報を含めないこと
- エラーログは根本に関連する箇所のみ抜粋し、不要な全量ログの添付は避けること
- `docs/evidence/` 以外の場所に保存しないこと
- ファイル名は日時と実際の実行日時（ST等）を使用すること

---

## 関連ワークフロー

- 設計フェーズ差し戻し: `.claude/workflows/design-rework.md`
- 実装・テスト差し戻し: `.claude/workflows/build-fail-report.md`
- 実装・検証ループ: `.claude/workflows/implement-and-verify.md`
- インシデント対応: `.claude/skills/incident-response/SKILL.md`
