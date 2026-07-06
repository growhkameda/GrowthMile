---
name: implement-feature
description: >
  ユーザーから「指定された機能を実装して」「設計書をもとに実装を進めて」など、
  機能実装タスクを要求された際に使用するスキル。
  プロジェクトのアーキテクチャに従い、実装から検証・レビューまでを一貫して行う。
---

# 機能実装スキル

<instructions>
あなたはこのプロジェクトの実装担当エンジニア・エージェントです。
ユーザー指示または仕様書に記載されたタスクを、プロジェクトのコーディングルールに則って実装してください。
</instructions>

<steps>

### Step 1: コンテキストの読み込み

<step>
以下を読み込み、プロジェクトの状況とアーキテクチャを理解する:

- `AGENTS.md` — プロジェクト概要・技術スタック・制約
- 対象機能の仕様書（`docs/features/*.md`）
- `docs/api/spec-api.md` — 新規エンドポイントが関連する場合
- `docs/design/spec-db.md` — テーブル変更が関連する場合
- `.claude/rules/project-stack.md` — スタック固有の実装パターン

読み込み後、`core-cognition.md` の複雑度トリアージを実施して結果を宣言する。
**COMPLEX 判定の場合は、実装に入る前に必ず `deep-plan` スキルを実行する**（計画 → plan-reviewer 批評 → 承認ゲート）。
</step>

### Step 2: 実装

<step>
仕様に基づき、以下を厳守して実装する:

- 配置ルール・実装パターン: `.claude/rules/project-stack.md` に従う
- 入力バリデーション・エラーハンドリング・トランザクション: `.claude/rules/core-backend.md` に従う
- UI: `.claude/rules/core-frontend.md` とデザインシステム文書に従う
- テストを同一変更セットで作成する（`.claude/rules/core-testing.md`）

実装中に破壊的変更（既存 API シグネチャ・DB スキーマ・認証ロジックの変更）が必要と判明した場合は、
実装を中断してユーザーへエスカレーションする（`core-guardrails.md`）。
</step>

### Step 3: 検証（build-verifier SubAgent）

<step>
実装が一段落したら `build-verifier` SubAgent を起動し、Lint・フォーマット・型・テスト・ビルドを一括検証する。

- **FAIL** → エラー内容を確認してコードを修正し、再度 build-verifier を起動する。全パスするまで繰り返す
- 修正が3回以上ループする場合は、根本原因の分析に `incident-response` スキルの手法を使う

全パス後、`self-review` スキルを実行する（要求カバレッジ・差分全量・品質チェックリスト）。
指摘があれば修正してから次のステップへ進む。
</step>

### Step 4: ドキュメントの同期更新

<step>
実装によって仕様が変わった・詳細化された場合は、以下を同一変更セットで更新する:

- `docs/api/spec-api.md`（API 変更時）
- `docs/design/spec-db.md`（DB 変更時）

Markdown 更新後は Lint を実行する:

```bash
npx markdownlint-cli "docs/**/*.md" --fix
```

</step>

### Step 5: コードレビュー（code-reviewer SubAgent 自動実行）

<step>
検証が全パスしたら `code-reviewer` SubAgent を自動的に起動する（ユーザーの指示を待たない）。

- **PASS / PASS_WITH_NOTES** → Step 6 へ
- **FAIL** → Major 指摘を修正し、Step 3 からやり直す
- **NEEDS_HUMAN_REVIEW** → `rework-report` スキルでエスカレーション記録を保存し、ユーザーの判断を仰ぐ
</step>

### Step 6: ユーザーへの完了報告

<step>
実装サマリー・検証結果・コードレビュー結果・更新したドキュメントの一覧を報告する。
コミットするかどうかはユーザーの判断を仰ぐ。
</step>

</steps>

<restrictions>
- 破壊的変更をユーザーに共有せず行わないこと
- 新しいパッケージ・依存関係を勝手に追加しないこと（必要な場合は提案する）
- `.claude/settings.json` の deny コマンドを使用しないこと
- 秘密情報のハードコード禁止を徹底すること
</restrictions>
