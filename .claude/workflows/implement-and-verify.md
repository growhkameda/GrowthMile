---
description: "実装 → ビルド → テスト → レビューループ ワークフロー"
---

# 実装 → 検証ループ

Claude Code が機能を実装し、SubAgent によるビルド・テスト検証とコードレビューまでを一貫して行う自動ループ。
破壊的変更やコミットは人間の承認を経由する。

## 前提条件

- 対象機能の仕様書（`docs/features/*.md`）が承認済みであること
- `AGENTS.md` と `.claude/rules/project-stack.md` を読み、アーキテクチャを把握済みであること

## ワークフロー

### Step 0: トリアージ・計画（COMPLEX のみ）

`core-cognition.md` のトリアージを実施する。COMPLEX 判定の場合は `deep-plan` スキル（計画 → `plan-reviewer` 批評 → 承認ゲート）を経てから Step 1 へ進む。

### Step 1: 実装（Claude Code）

`implement-feature` スキルの手順に従って実装する。要点:

- 配置・実装パターンは `project-stack.md`、堅牢性は `core-backend.md` に従う
- テストを同一変更セットで書く
- 新規 API は `docs/api/spec-api.md`、DB 変更は `docs/design/spec-db.md` を同時更新する
- 破壊的変更を検出したら即座に中断してエスカレーションする

### Step 2: ビルド＆テスト検証（build-verifier SubAgent）

`build-verifier` SubAgent を起動し、Lint・フォーマット・型・テスト・ビルドを一括検証する。

- **FAIL** → 修正して Step 2 を再実行（全パスするまでループ）
- **PASS / PASS_WITH_NOTES** → Step 2.5 へ

### Step 2.5: セルフレビュー（self-review スキル）

`self-review` スキルを実行し、要求カバレッジ・差分全量・品質チェックリストを確認する。指摘があれば修正して Step 2 から再実行する。

### Step 3: コードレビュー（code-reviewer SubAgent）

`code-reviewer` SubAgent を起動する。

- **PASS / PASS_WITH_NOTES** → Step 4 へ
- **FAIL**（Major 指摘） → 指摘を修正し、Step 2 から再実行する
- **NEEDS_HUMAN_REVIEW** → `rework-report` スキルでエスカレーション記録を保存し、ユーザーの判断を待つ

### Step 4: 完了報告とコミット（人間承認）

1. 実装サマリー・検証結果・レビュー結果・更新ドキュメント一覧をユーザーに報告する
2. ユーザー承認後、Conventional Commits 形式（例: `feat: add ticket list page`）でコミットする

### Step 5: 完了処理

- タスク管理ファイル・進捗ログ（`docs/agentic/PROGRESS.md` 等、存在する場合）を更新する

## 失敗時の扱い

- ローカルの lint / build / unit test 失敗: その場で修正して再検証する（エビデンス保存は不要）
- E2E / ST 失敗: `rework-report` スキルを起動して Evidence Bundle を保存する
