# デザインモックアップ一覧

`.claude/workflows/design-mock.md` に従って作成した UI モックアップを管理する。
各 HTML はサーバー不要・ブラウザで直接開けば動作し、右上トグルでライト／ダークを切り替える。

## ファイル一覧

| ファイル | 対象画面 | テーマ | 状態 |
| --- | --- | --- | --- |
| [growth-mile-route-redesign.html](./growth-mile-route-redesign.html) | ログイン・タイムライン・投稿・ガチャ（4画面一括） | 感謝の道（地図/ルート） ／ frontend-design スキル準拠 ／ ライト・ダーク切替 | 提案（最新・レビュー待ち） |
| [growth-mile-redesign.html](./growth-mile-redesign.html) | ログイン・タイムライン・投稿・ガチャ（4画面一括） | 遊び心・ゲーム感 ／ ライト・ダーク切替 | 旧提案（比較用） |

## growth-mile-route-redesign.html の方針（最新 / frontend-design スキル準拠）

`.claude/skills/frontend-design` の指針に従い、テンプレ感のある既定デザインを避けて
GROWTH MILE の名前（道のり＝マイル）に根ざした一貫コンセプトで再設計した提案モック。

- コンセプト: チームで進む「感謝の道」。タイムライン＝1本の金色ルート、感謝1件＝道沿いの道標（マップピン）、ポイント＝走行マイル（オドメーター表示）、週の到達点に宝箱（ガチャ）。
- 署名要素: 金色の破線ルート＋道標ピン＋「現在地」トークン。ここに大胆さを集中し、他は静かに保つ。
- AI既定の回避: 「クリーム＋セリフ＋テラコッタ」「黒地＋蛍光1色」「新聞レイアウト」のいずれにも寄せず、地形図コンター＋丸ゴシックで地図の世界観に統一。
- カラートークン: Ink（深いパイン）／ Route Gold（マイル）／ Coral（道標・感謝・主要CTA）／ Teal（リンク・水）／ Violet（宝箱＝ガチャ限定）。
- タイポグラフィ: Baloo 2（看板的ディスプレイ）＋ Zen Maru Gothic（丸ゴ本文）＋ Space Mono（距離・数値の標識感）。
- 品質床: focus-visible によるキーボードフォーカス可視化、prefers-reduced-motion 尊重、色は全て `var(--*)`、ネオン/過剰なglowは不使用。

## growth-mile-redesign.html の方針（旧 / 比較用）

汎用的な shadcn 既定トークン（緑＋オレンジ＋紫）由来の「AI生成っぽい」印象を脱却し、
GROWTH MILE の世界観（成長＝マイルストーン）に沿った「遊び心・ゲーム感」の方向へ再設計した提案モック。

- カラートークン: Brand/Growth（グリーン）、Points/Gold、Gacha（ピンク＋バイオレット）、Sky/Tag を CSS 変数で定義
- ゲーム要素: 「ありがとうマイル」進捗バー（フラッグ付き）、レベル表示、ガチャのレアリティ（N/R/SR/UR）
- タイポグラフィ: Outfit + Zen Kaku Gothic New + JetBrains Mono（数値）
- 形状: カード 18px・ボタン 14px・ピル 999px・バッジ 8px（遊び心のためやや大きめの角丸）
- 色のハードコードなし（全色 `var(--*)`）、過度な box-shadow / glow・ネオンカラーは不使用

[INFO] 確定後は `docs/design/spec-design-system.md` のトークン定義へ反映し、`src/app/globals.css` の更新方針を別途検討する。
