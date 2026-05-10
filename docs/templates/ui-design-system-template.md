# UI デザインシステム テンプレート

> **用途**: 新規プロジェクト立ち上げ時にこのファイルをコピーし、プロジェクト固有の値に書き換える
> **参考実装**: PreZen プロジェクト（`docs/design/spec-design-system.md`）

---

## 1. デザインコンセプト（ここを書き換える）

```
コンセプト: [プロジェクトのビジョンを一言で]
ターゲット: [ペルソナ説明]
トーン    : [例: プロフェッショナル / 親しみやすい / ミニマル]
禁止トーン: [例: AI臭い / 子供っぽい / 重厚]
```

---

## 2. カラートークン（プロジェクトごとに調整）

### 考え方

- `--bg` 〜 `--s3`: ダーク系なら黒〜暗灰、ライト系なら白〜薄灰
- `--accent`: ブランドカラーから1色選定。**ネオン・純色を避け彩度を抑えること**
- `--green` / `--amber` / `--rose`: Semanticカラー。純色は避けて伝統色・自然色寄りに

### Light Mode テンプレート

```css
[data-theme="light"] {
  /* Surfaces */
  --bg: #f5f4f2; /* やや暖かみのある白 */
  --s1: #ffffff;
  --s2: #f8f7f5;
  --s3: #edecea;
  /* Borders */
  --bdr: #e2dfdc;
  --bdr2: #eceae7;
  /* Text */
  --t1: #1c1e24;
  --t2: #5e6270;
  --t3: #92a0b0;
  /* Accent: 選定したブランドカラー */
  --accent: #REPLACE_WITH_BRAND_COLOR;
  --accent2: #REPLACE_WITH_BRAND_COLOR_DARK;
  --accent-dim: rgba(R, G, B, 0.08);
  --accent-sub: rgba(R, G, B, 0.04);
  /* Semantic */
  --green: #3a8a64; /* 成功・完了 */
  --green-dim: rgba(58, 138, 100, 0.08);
  --amber: #a87d2e; /* 警告・進行中 */
  --amber-dim: rgba(168, 125, 46, 0.08);
  --rose: #b04848; /* エラー・要対応 */
  --rose-dim: rgba(176, 72, 72, 0.08);

  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
```

### Dark Mode テンプレート

```css
[data-theme="dark"] {
  /* Surfaces: 完全な黒を避け、微かに色味を持たせる */
  --bg: #0b0c10; /* ヒント: ブランドカラーの色相を微量混ぜる */
  --s1: #111318;
  --s2: #17191f;
  --s3: #1e2028;
  /* Borders */
  --bdr: #262830;
  --bdr2: #1c1d26;
  /* Text */
  --t1: #e4e8f0;
  --t2: #8c96a8;
  --t3: #546070;
  /* Accent: Lightより明るめに */
  --accent: #REPLACE_WITH_LIGHT_VARIANT;
  --accent2: #REPLACE_WITH_LIGHTER_VARIANT;
  --accent-dim: rgba(R, G, B, 0.1);
  --accent-sub: rgba(R, G, B, 0.05);
  /* Semantic */
  --green: #5dae8b;
  --green-dim: rgba(93, 174, 139, 0.1);
  --amber: #c9993a;
  --amber-dim: rgba(201, 153, 58, 0.1);
  --rose: #b85e5e;
  --rose-dim: rgba(184, 94, 94, 0.1);

  --card-shadow: none;
}
```

---

## 3. タイポグラフィ（フォントのみ差し替え）

```css
/* ベースサイズ: 118% ≈ ブラウザ標準の1.25倍 */
html {
  font-size: 118%;
}

/* UIフォント: プロジェクトに合わせて選定 */
/* 候補: Outfit / DM Sans / Space Grotesk / Plus Jakarta Sans */
font-family: "REPLACE_UI_FONT", sans-serif;

/* データフォント: 数値・ID・コード (変更不要) */
font-family: "JetBrains Mono", monospace;
/* 代替: IBM Plex Mono / Fira Code */
```

### フォントサイズ基準（変更不要）

| 用途                  | サイズ | ウェイト |
| --------------------- | ------ | -------- |
| ページタイトル        | 20px   | 700      |
| カードタイトル        | 15px   | 600      |
| テーブルセル          | 14px   | 400–500  |
| ナビリンク・ボタン    | 13px   | 500–600  |
| バッジ・ラベル        | 12px   | 600      |
| アクティビティ        | 13px   | 400      |
| タイムスタンプ (Mono) | 11px   | 400      |

---

## 4. レイアウト構造（そのまま流用可能）

### シェル

```css
.shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.topnav {
  height: 54px; /* ... */
}
.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
}
```

### グリッドパターン

```css
/* 統計カード: 非対称4カラム */
.stats {
  grid-template-columns: 1.3fr 1fr 1fr 0.9fr;
}

/* メインコンテンツ + サイドパネル */
.mgrid {
  grid-template-columns: 1fr 300px;
}
```

---

## 5. コンポーネント形状ルール（変更不推奨）

```
カード:        border-radius: 12px
ナビ・ボタン:  border-radius: 5–6px
バッジ:        border-radius: 4px
アバター:      border-radius: 50%
ピル型:        border-radius: 20px
```

---

## 6. Cursor AI ルール（`.cursor/rules/ui-design.mdc` にコピー）

```markdown
# [プロジェクト名] UI Design Rules

- CSS変数 (var(--accent) 等) を必ず使用。ハードコード禁止
- カード border-radius: 12px
- ナビバー高さ: 54px
- UIフォント: [選定フォント]、数値・IDは JetBrains Mono
- グロウ・ネオン効果禁止
- ハードコードカラー禁止

詳細: docs/design/spec-design-system.md
```

---

## 7. テーマトグル（そのまま流用可能）

```html
<!-- HTML -->
<div class="theme-toggle" id="themeToggle">
  <div class="knob" id="toggleKnob">
    <svg id="iconSun" viewBox="0 0 24 24"><!-- 太陽SVG --></svg>
    <svg id="iconMoon" viewBox="0 0 24 24" style="display:none">
      <!-- 月SVG -->
    </svg>
  </div>
</div>

<!-- CSS -->
<style>
  .theme-toggle {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background: var(--s3);
    cursor: pointer;
    position: relative;
  }
  .theme-toggle .knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--s1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  [data-theme="dark"] .theme-toggle .knob {
    transform: translateX(20px);
  }
</style>

<!-- JS -->
<script>
  const toggle = document.getElementById("themeToggle");
  const iconSun = document.getElementById("iconSun");
  const iconMoon = document.getElementById("iconMoon");
  toggle.addEventListener("click", () => {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "light" : "dark",
    );
    iconSun.style.display = isDark ? "block" : "none";
    iconMoon.style.display = isDark ? "none" : "block";
  });
</script>
```

---

## 8. チェックリスト（新規プロジェクト立ち上げ時）

- [ ] ブランドカラーを `--accent` に設定（ライト/ダーク両方）
- [ ] UIフォントを選定してGoogle Fontsリンクを更新
- [ ] `html { font-size: 118% }` を `index.css` に追記
- [ ] `.cursor/rules/ui-design.mdc` を作成してAIルールを設定
- [ ] `docs/design/spec-design-system.md` をプロジェクト固有情報で記入
- [ ] ダーク/ライトモード両方でデザインを確認
