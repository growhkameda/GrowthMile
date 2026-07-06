# .claude テンプレート構成ガイド

AI 駆動開発のガードレール・品質ゲートを組み込んだ Claude Code 設定テンプレート。
**2層構造**により、別プロジェクトへの流用時は固有ファイルの差し替えだけで済む。

## 2層構造

| 層 | ファイル | 流用時の扱い |
| --- | --- | --- |
| 汎用コア | `rules/core-*.md` | **無変更でコピー** |
| プロジェクト固有 | `rules/project-*.md` | 書き換え（スタックは `rules-library/` から差し替え） |

## ディレクトリ構成

```text
.claude/
├── settings.json        # 権限（allow/deny）・hooks・モデル設定
├── rules/               # 自動ロードされるルール（フラット配置）
│   ├── core-principles.md    # 役割・応答スタイル・省略禁止
│   ├── core-guardrails.md    # 破壊的変更エスカレーション・禁止事項
│   ├── core-architecture.md  # SOLID・デザインパターン・モジュール構成
│   ├── core-backend.md       # バリデーション・例外・トランザクション・堅牢性
│   ├── core-frontend.md      # デザイントークン・コンポーネント設計・a11y
│   ├── core-testing.md       # テストピラミッド・AAA・E2E安定化
│   ├── core-security.md      # OWASP系対策・秘密管理・認証認可
│   ├── core-docs.md          # ドキュメント規約・テンプレート・Lint
│   ├── core-git-cicd.md      # コミット規約・CI YAML の書き方
│   ├── core-ai-workflow.md   # 品質ゲート・SubAgent起動義務・モデルティア
│   ├── core-cognition.md     # 思考規律（複雑度トリアージ・自己批評・根拠ベース主張）
│   ├── project-stack.md      # [固有] 技術スタック・実装パターン
│   └── project-ops.md        # [固有] コマンド・CI 構成
├── rules-library/       # スタック差し替え用の原本（自動ロードされない）
├── agents/              # SubAgent 定義（build-verifier / code-reviewer / plan-reviewer）
├── skills/              # スキル（deep-plan / implement-feature / self-review / incident-response / rework-report / frontend-design）
├── workflows/           # フェーズ別手順（full-dev-cycle / requirement-review-loop / implement-and-verify / design-mock）
└── hooks/               # 決定論的ガードレール（シェルスクリプト）
```

## モデル能力の最大化（Sonnet / Opus を上位モデル相当で運用する仕組み）

上位モデルとの性能差は主に「計画の深さ・自己検証・曖昧さへの対処・根本原因分析」で生じる。
このテンプレートはそれをプロセスで補い、どのモデルでも品質の下限を引き上げる:

| 仕組み | 実装 |
| --- | --- |
| 複雑度トリアージ | `core-cognition.md` + `triage-reminder.sh`（UserPromptSubmit フックで毎ターン想起） |
| 計画の強制（COMPLEX） | `deep-plan` スキル → `plan-reviewer` SubAgent（Opus）の敵対的批評 |
| 計画フェーズの Opus 化 | `settings.json` の `"model": "opusplan"`（Plan Mode = Opus / 実行 = Sonnet 自動切替） |
| 拡張思考の常時有効化 | `settings.json` の `"alwaysThinkingEnabled": true` |
| 多段レビュー | build-verifier（機械検証）→ `self-review`（自己批評）→ code-reviewer（Opus・独立コンテキスト） |
| 完了品質の担保 | Stop フック（検証未実施での作業終了をブロック） |

## ガードレールの多層防御

| 層 | 仕組み | 性質 |
| --- | --- | --- |
| 1. permissions | `settings.json` の allow / deny | 決定論的（モデルが迂回不可） |
| 2. PreToolUse hooks | 危険コマンド・機密ファイルのブロック | 決定論的 |
| 3. PostToolUse hooks | 編集後の自動 Lint・E2E 失敗検知 | 決定論的（通知） |
| 4. Stop hook | 品質ゲート未通過での作業終了をブロック | LLM 判定 |
| 5. rules | エスカレーション基準・省略禁止 | 指示ベース |

## 別プロジェクトへの流用手順

1. `.claude/` ディレクトリごと新プロジェクトへコピーする
2. `rules/project-stack.md` を差し替える:
   - `rules-library/` から該当スタックのファイルをコピーし、固有情報を追記する
3. `rules/project-ops.md` のコマンド・CI 構成を書き換える
4. `settings.json` の permissions（allow のコマンド群）をスタックに合わせて調整する
5. `hooks/lint-on-write.sh` の Lint コマンド・対象ディレクトリを調整する
6. `agents/build-verifier.md` の検証コマンドを調整する
7. ルート `CLAUDE.md` / `AGENTS.md` のプロジェクト情報（WHAT セクション・構造）を書き換える
8. `agent-memory/` は空で開始する（前プロジェクトのメモリを持ち込まない）

## 運用の要点

- タスク受領 → 複雑度トリアージを宣言。COMPLEX は `deep-plan` → `plan-reviewer` を経てから実装（計画の人間承認は破壊的変更時のみ）
- コード変更 → `build-verifier` + `self-review` + `code-reviewer` が揃ってから完了報告（Stop hook が強制）
- 破壊的変更 → 必ず人間へエスカレーション（`core-guardrails.md`）
- E2E / ST 失敗・NEEDS_HUMAN_REVIEW → `rework-report` でエビデンス保存（ローカル lint/build 失敗は対象外）
- モデルはティア運用（default=Sonnet / escalation=Opus / fast=Haiku）でバージョン固定しない

---

<div align="center">

<sub>DESIGNED &amp; MAINTAINED BY</sub>

**GrowCommunity**　|　木俣貴史

<sub>2026-07-06　―　初版公開　―　木俣貴史</sub>

</div>
