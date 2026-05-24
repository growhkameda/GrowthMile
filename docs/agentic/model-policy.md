# Model Policy（モデル選定ポリシー）

モデル選定の **Single Source of Truth (SSOT)**。バージョン番号（4.6 / 4.7 等）は固定せず、**ティア（役割）** で運用する。

## 原則

1. **バージョン固定しない** — Sonnet / Opus / Haiku ファミリの **利用可能な最新** を使う
2. **ティアで指定する** — タスク種別・SubAgent には `default` / `escalation` / `fast` を割り当てる
3. **API モデル ID の直書きは避ける** — `claude-sonnet-4-6` のようなバージョン付き ID をドキュメントに残さない
4. **ユーザーが明示指定した場合のみ** — 特定モデル ID / バージョンを固定する

## ティア定義

| ティア | ファミリ | 指定方法 | 用途 |
| --- | --- | --- | --- |
| `default` | Sonnet | メインセッションの標準、または SubAgent の `model: sonnet` 相当 | 実装・lint・ビルド・一般 QA・ドキュメント |
| `escalation` | Opus | SubAgent の `model: opus` 相当 | コードレビュー・セキュリティ・深いデバッグ・大規模リファクタ |
| `fast` | Haiku | 軽量 SubAgent・探索向け | リポジトリ探索・ファイル検索・定型調査 |

新バージョンがリリースされても、**ティア定義の変更なし**で自動的に最新へ追従する。

## SubAgent への割り当て

| SubAgent | ティア | 備考 |
| --- | --- | --- |
| `code-reviewer` | `escalation` | Opus 最新。`.claude/agents/` の定義で Opus ファミリを指定 |
| `build-verifier` | `default` | Sonnet 最新。lint / build / test は Sonnet で十分 |

SubAgent 定義（`.claude/agents/`）では **バージョン番号付き ID ではなくファミリ（sonnet / opus / haiku）** を指定する。

## メインセッション

| 役割 | ティア |
| --- | --- |
| 通常の実装・設計・コミット | `default`（Sonnet 最新） |
| ユーザーが「Opus で」と指定 | `escalation` |
| `/model` 等でユーザーが切り替え | ユーザーの指定を優先 |

## タスク別ティア

| タスク | ティア |
| --- | --- |
| 要件定義・仕様書・標準コーディング・UI 実装 | `default` |
| ビルド・Lint・テスト実行（`build-verifier`） | `default` |
| コードレビュー・セキュリティ審査（`code-reviewer`） | `escalation` |
| 深いデバッグ・インシデント対応 | `escalation` |
| 大規模リファクタリング・コードベース移行 | `escalation` |
| リポジトリ探索・ファイル検索 | `fast` |

## エスカレーション判断

```text
タスク受信
    ↓
複雑・微妙・高リスクか？
（大規模変更 / セキュリティ / 深い分析が必要）
    ↓
NO  → tier: default（または fast）
YES → tier: escalation
```

## SubAgent 起動時の指針

- `code-reviewer` → **必ず** `escalation`（Opus ファミリ最新）
- `build-verifier` → **必ず** `default`（Sonnet ファミリ最新）
- SubAgent 定義にバージョン付きモデル ID を書かない（例: `claude-opus-4-6` は NG）
- ユーザーがチャットで特定バージョンを指定した場合のみ、その ID を一時的に使用可

## ハイブリッド戦略

- **80–90%** のタスク: `default`（Sonnet）
- **10–20%**: 高リスク・低自信度のみ `escalation`（Opus）
- Opus は Sonnet より高コスト — レビュー・セキュリティ・深い分析に限定

## 更新ポリシー

- **通常**: モデルリリースごとに **更新不要**（ティア運用のため）
- **見直しタイミング**: ファミリ名変更・SubAgent 追加・モデル指定方式変更時のみ本ファイルを更新
- SubAgent 定義の実体は `.claude/agents/` を参照（本ファイルは方針のみ）

## 参照

- [`AGENTS.md`](../../AGENTS.md) — SubAgent 一覧・コーディング規約
- [`CLAUDE.md`](../../CLAUDE.md) — 要約
- `.claude/agents/` — SubAgent 定義（モデル指定の実装）
