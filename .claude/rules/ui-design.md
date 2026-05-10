---
description: "UIコンポーネント生成ルール"
globs: ["src/**/*.tsx", "src/**/*.css"]
alwaysApply: false
---

# UI Design Rules

Claude Code が React コンポーネントを生成・編集する際は、必ず以下のルールに従うこと。
詳細なデザイントークンの定義は `docs/design/spec-design-system.md` を参照。

## 必須事項

### カラー

- **ハードコードした色を使用禁止**。必ず CSS変数 (`var(--accent)`, `var(--t1)` 等) を使用する
- テーマ切り替えに対応するため `[data-theme="light"]` / `[data-theme="dark"]` の変数定義に従う
- 新しい色を追加する場合は `spec-design-system.md` のカラートークン定義に追記してから使用する

### タイポグラフィ

- UI テキスト: `font-family: 'Inter', 'Noto Sans JP', sans-serif`
- 数値・ID・時刻・コード: `font-family: 'JetBrains Mono', monospace`
- ベースフォントサイズと相対サイズの規則はデザインシステムに従う

### コンポーネント形状

- カード: `border-radius: 12px`
- ボタン・インライン要素: `border-radius: 5-6px`
- バッジ/タグ: `border-radius: 4px`
- アバター: `border-radius: 50%`
- ピル型: `border-radius: 20px`

## レイアウト原則

### ページ構造

プロジェクトのレイアウト方針に従う。一般的なパターン:

```tsx
<div class="shell">        {/* flex-col, 100vh */}
  <nav class="topnav">    {/* ナビゲーション */}
  <div class="content">   {/* flex:1, overflow-y:auto */}
```

## 禁止事項

- `box-shadow` や `glow` エフェクトの乱用
- 派手なアニメーション（transition .3s 以上は原則禁止）
- ネオンカラー（純粋な `#00FFFF` や `#FF00FF` 等）の使用
- `color: blue` / `background: gray` 等の汎用色の直接指定

## 参照ドキュメント

- デザイントークン全定義: `docs/design/spec-design-system.md`
- UI機能仕様: `docs/design/spec-ui.md`
