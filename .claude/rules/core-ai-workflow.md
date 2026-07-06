# AI 駆動開発ワークフロー（品質ゲート）

> [INFO] 汎用コアルール。AI駆動開発の品質ゲートと検証義務を定義する。本テンプレートの中核。

## 開発サイクル

各フェーズの詳細手順は `.claude/workflows/` を参照する:

- 要件定義 → 設計レビュー: `requirement-review-loop.md`（Multi-Agent Debate）
- 実装 → 検証: `implement-and-verify.md`
- フルサイクル・品質ゲート一覧: `full-dev-cycle.md`

## 複雑度トリアージと計画ゲート

タスク受領時に `core-cognition.md` のトリアージ（LIGHT / STANDARD / COMPLEX）を必ず実施する。

- **COMPLEX** → `deep-plan` スキルで計画を作成し、`plan-reviewer` SubAgent（`escalation` ティア）の批評を経てから実装する
- 計画の人間承認は**破壊的変更を含む場合のみ必須**。含まない場合は plan-reviewer の APPROVE で自律進行してよい

## コード変更後の必須検証（省略禁止）

ソースコードを変更したら、ユーザーへの完了報告前に必ず以下を実行し、**すべての結果が揃ってから**報告する:

1. `build-verifier` SubAgent — Lint・フォーマット・型・テスト・ビルドの一括検証（`default` ティア）
2. `self-review` スキル — 要求カバレッジ・差分全量・品質チェックリストによる自己批評（STANDARD 以上）
3. `code-reviewer` SubAgent — 規約・セキュリティ・設計整合性のレビュー（`escalation` ティア）

## 差し戻し・失敗時の対応

| 事象 | 対応 |
| --- | --- |
| ローカルの lint / format / 型 / unit test / build 失敗 | その場で修正して再検証する（エビデンス保存は不要） |
| **E2E / ST（受け入れ）失敗** | `rework-report` スキルを起動し、Evidence Bundle を `docs/evidence/` に保存してから報告する |
| **NEEDS_HUMAN_REVIEW（破壊的変更等の人間エスカレーション）** | `rework-report` スキルでエスカレーション記録を保存し、ユーザーの判断を待つ |
| CI 失敗 | 原因を修正して再プッシュする。E2E 起因の場合は上記 E2E 失敗の扱いに従う |

## ドキュメント連動

- 要件定義・設計書を修正したら、関連する設計書（要件 ↔ API ↔ DB）の整合性をチェックし、変更の影響範囲を実装への指示内容に明記する
- 重要な技術選定・アーキテクチャ判断を含む場合は、テンプレートを使用して ADR を作成し、ADR インデックスを更新する

## モデルティア運用（バージョン固定しない）

| ティア | ファミリ | 用途 |
| --- | --- | --- |
| `default` | Sonnet 最新 | 実装・設計書・ビルド検証・一般 QA |
| `escalation` | Opus 最新 | 実装計画のレビュー（plan-reviewer）・コードレビュー・セキュリティ審査・深いデバッグ・大規模リファクタリング |
| `fast` | Haiku 最新 | リポジトリ探索・ファイル検索 |

- メインモデルは `settings.json` の `"model": "opusplan"` により、**Plan Mode では Opus・実行では Sonnet** に自動で切り替わる。COMPLEX タスクの計画は Plan Mode で行うことを推奨する
- `escalation` 相当のタスクと判断した場合、作業開始前にユーザーへモデル切り替えを一度だけ提案する（強制しない）
- モデル ID のバージョン番号をルールファイルに直書きしない（SSOT はプロジェクトのモデルポリシー文書）
