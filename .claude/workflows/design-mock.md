---
description: UIデザインモックアップの作成・保存ワークフロー
---

# デザインモック作成ワークフロー

新規画面のデザインモックアップを作成し、`docs/design/mockups/` に保存するための手順。

## 前提

- デザイントークン定義: `docs/design/spec-design-system.md`
- UI機能仕様: `docs/design/spec-ui.md`
- 保存先: `docs/design/mockups/`

---

## Step 1: 画面仕様の確認

1. `docs/features/` 配下の対象機能仕様書を読む
2. `docs/design/spec-ui.md` で画面レイアウト・コンポーネントを確認
3. `docs/design/spec-design-system.md` でカラートークン・タイポグラフィを確認

---

## Step 2: モックアップHTMLの作成

以下のルールに従ってHTMLファイルを作成する。

### ファイル命名規則

```text
docs/design/mockups/{画面名}-{テーマ}.html
```

| パターン              | 用途                                |
| --------------------- | ----------------------------------- |
| `{画面名}-dark.html`  | ダークモード専用                    |
| `{画面名}-light.html` | ライトモード専用                    |
| `{画面名}.html`       | ライト/ダーク切替トグル付き（推奨） |

**画面名の例**: `dashboard`, `ticket-list`, `ticket-detail`, `login`, `team-settings`

### 必須要件

- `docs/design/spec-design-system.md` のカラートークン（CSS変数）を使用
- フォント: `Outfit` + `JetBrains Mono` + `Zen Kaku Gothic New`
- `html { font-size: 118% }` を適用
- ダーク/ライト両対応の場合は `[data-theme="light"]` / `[data-theme="dark"]` 構造を使用
- テーマ切替トグル（スライドノブ + SVGアイコン）を実装
- `.claude/rules/core-frontend.md` と `.claude/rules/project-stack.md` のUIルールに準拠

### 禁止事項

- カラーのハードコード（`var(--accent)` 等の変数を使うこと）
- `box-shadow` / `glow` エフェクトの乱用
- ネオンカラーの使用

---

## Step 3: 動作確認

1. HTMLファイルをブラウザで直接開く（サーバー不要）
2. ライト・ダークモードを切り替えて確認
3. レイアウト崩れがないことを確認

---

## Step 4: READMEの更新

`docs/design/mockups/README.md` のファイル一覧テーブルに追記する:

```md
| [{画面名}-dark.html](./{画面名}-dark.html) | {画面名} | ダーク | [OK] 確定 |
```

---

## Step 5: 保存・完了

- `docs/design/mockups/` 以外の場所にモックファイルを置かない
- プロジェクトルートへのモックファイル配置は禁止
- デザインが確定したら `spec-design-system.md` のカラートークンと差異がないか確認

---

## 参照

- デザイン仕様: [`docs/design/spec-design-system.md`](../../docs/design/spec-design-system.md)
- UIルール: [`.claude/rules/core-frontend.md`](../rules/core-frontend.md) / [`.claude/rules/project-stack.md`](../rules/projec
-stack.md)
- モックアップ一覧: [`docs/design/mockups/README.md`](../../docs/design/mockups/README.md)
