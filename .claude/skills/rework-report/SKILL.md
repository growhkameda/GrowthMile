---
name: rework-report
description: >
  E2E（Playwright）/ ST（受け入れ）失敗、または NEEDS_HUMAN_REVIEW（破壊的変更等の
  人間エスカレーション）発生時に、Evidence Bundle を docs/evidence/ に保存して報告するスキル。
  「E2E が失敗した」「ST 差し戻し」「エスカレーション記録を残して」等で起動。
  /rework-report で手動起動も可能。
---

# rework-report スキル

E2E / ST 失敗と人間エスカレーションの記録を「証拠に基づく・再現可能・構造化された」フォーマットで `docs/evidence/` に保存するスキル。

## 起動条件

| 事象 | 起動 |
| --- | --- |
| Playwright E2E 失敗（ローカル・CI とも） | [OK] 必須 |
| ST（受け入れテスト）差し戻し | [OK] 必須 |
| NEEDS_HUMAN_REVIEW（破壊的変更・設計判断の人間エスカレーション） | [OK] 必須 |
| ローカルの lint / format / 型 / unit test / build 失敗 | [NG] 起動しない（その場で修正） |

## 保存先とファイル名

| 種別 | 保存先 | ファイル名 |
| --- | --- | --- |
| E2E / ST 失敗 | `docs/evidence/build-test/` | `YYYYMMDD-HHmm-e2e-fail.md` / `YYYYMMDD-HHmm-st-rework.md` |
| 人間エスカレーション | `docs/evidence/escalations/` | `YYYYMMDD-HHmm-escalation.md` |

## テンプレート 1: E2E / ST 失敗レポート

```markdown
---
date: "YYYY-MM-DD HH:MM"
type: "e2e-fail" # または st-rework
environment: "local" # local / ci / staging
exit_code: 1
---

## E2E 失敗レポート — {YYYY-MM-DD HH:MM}

### 判定: FAIL

> 失敗の要因を1-2行で要約する。

### 実行コマンドと結果

| コマンド | 結果 |
| --- | --- |
| `cd e2e && npx playwright test` | X passed / Y failed |

### 失敗テストとエラーログ抜粋（関連箇所のみ）

- `{テストファイル}:{テスト名}` — {失敗内容}

### 根本原因の特定

（「症状」ではなく「原因」を書く。アプリ側のバグか、テスト側の問題かを明確にする）

### 推奨対応と次アクション

1. {修正内容}（`{ファイルパス}`）
2. 修正後、E2E を再実行して検証する
```

## テンプレート 2: 人間エスカレーション記録

```markdown
---
date: "YYYY-MM-DD HH:MM"
type: "escalation"
trigger: "code-reviewer" # code-reviewer / design-review / implement 中の検出
status: "NEEDS_HUMAN_REVIEW"
---

## 人間エスカレーション — {YYYY-MM-DD HH:MM}

### エスカレーション理由

（破壊的変更・スキーマ変更・認証ロジック変更等、該当する検出内容）

### 変更内容の概要と影響範囲

| ファイル / 機能 | 影響 |
| --- | --- |
| `{パス}` | {影響内容} |

### 対応方針の選択肢

1. **案A（推奨）**: {内容・トレードオフ}
2. **案B**: {内容・トレードオフ}

### ユーザーへの確認事項

- {判断してほしいポイント}
```

## 実行手順

1. 種別を判定し、該当テンプレートで Evidence Bundle を作成する
2. 保存先ディレクトリに保存する（存在しなければ作成する）
3. ユーザーに以下を報告して次アクションを提示する:

```text
## 差し戻し報告完了
- 種別: {E2E失敗 | ST差し戻し | 人間エスカレーション}
- 保存先: {ファイルパス}

{端的な要点を2-3行}

次アクション: {修正して再実行 | ユーザーの判断待ち}
```

## 制約

- 個人情報・APIキー・シークレット・認証情報を含めない
- エラーログは根本原因に関連する箇所のみ抜粋する（全量ログ禁止）
- `docs/evidence/` 以外の場所に保存しない
