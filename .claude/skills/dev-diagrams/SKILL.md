---
name: dev-diagrams
description: >
  開発ドキュメント用のダイアグラム（アーキテクチャ図・構成図・ER図・シーケンス図・
  画面遷移図・フローチャート・処理フロー図）の作成・更新を要求されたときに必ず使用するスキル。
  pptxgenjs で編集可能な PPTX として描画し、PNG も併せて出力する。
  「〇〇図を作って」「ダイアグラムを描いて」「アーキテクチャを図にして」等で起動。
---

# dev-diagrams ─ 開発ダイアグラム作成スキル

開発で使う図を、統一されたビジュアル文法（slide-design-themes のテーマ準拠）で PPTX + PNG として生成する。
Mermaid ではなく pptxgenjs で描く（顧客提出・編集可能性・デザイン統一のため）。

## 対応する図の種類と example

| 種類 | 用途 | 参照実装（examples/） |
| --- | --- | --- |
| アーキテクチャ図 | システム構成・レイヤー関係 | architecture-diagram.js |
| ER 図 | テーブル定義とリレーション | er-sequence-screenflow-flowchart.js S1 |
| シーケンス図 | 処理の時系列・コンポーネント間通信 | 同 S2 |
| 画面遷移図 | ルーティングとユーザーフロー | 同 S3 |
| フローチャート | 分岐を含む処理フロー | 同 S4 |

## ワークフロー（省略禁止）

1. **種類とテーマの確認** ─ 図の種類を特定し、テーマ（tech-dark / enterprise-light）をユーザーに確認する。
   トークン定義は**同梱の `themes.md`** を参照（プロジェクトに slide-design-themes スキルがあればそちらを正とする）。
   既定は技術文書 = tech-dark
2. **一次情報を読む（推測で描かない）** ─
   ER 図 → `prisma/schema.prisma` ／ 画面遷移図 → `src/app/` のルーティング ／
   アーキテクチャ図 → `AGENTS.md`・実コード ／ シーケンス図・フローチャート → 対象機能の実装・設計書
3. **example をコピーして内容を差し替える** ─ examples/ の該当実装を出力用作業場所へコピーし、
   データ部分（ノード・行・メッセージ配列）を差し替える。ヘルパー関数（下記）は変更せず再利用する
4. **ビルド** ─ `npm install pptxgenjs`（アイコン使用時は `react react-dom react-icons sharp` も）→ `node <script>.js`。
   環境に pptx スキルの `rezip.py` があれば再圧縮する（無ければ省略可・ファイルサイズが増えるだけで動作に影響なし）
5. **ビジュアル QA（必須）** ─ LibreOffice + `pdftoppm`（または PowerPoint で開いてスクリーンショット）で画像化し、
   サブエージェントで検査 → 指摘を修正して再検証（1サイクル）。画像化手段が無い環境では人間の目視確認を依頼する
6. **出力** ─ `docs/architecture/` に `.pptx` と `.png` の両方を保存する

## ヘルパー関数（examples 内に実装済み）

- `baseSlide(kicker, title, note)` ─ ヘッダー付きスライド
- `arrow(s, x1,y1,x2,y2, {dash,color,w,noHead})` ─ 矢印（endArrowType: triangle）
- `lbl(s, x,y,w,text,{...})` ─ 矢印ラベル（7.5pt・ティール系）
- `nodeBox / stackBox` ─ アイコン付きノード（横型 / 縦積み。狭い箱は stackBox）
- `entity(x,y,w,name,note,rows,dash)` ─ ER エンティティ表（PK=琥珀 / FK=ティール / UQ=灰）
- `screen(x,y,name,url,desc)` ─ ブラウザ風フレーム（画面遷移図用）
- `proc / term / decision` ─ フローチャート部品（角丸=処理 / 楕円=開始終了 / ひし形=分岐）
- ライフライン + msgs 配列 ─ シーケンス図（実線=呼び出し / 点線=応答）

## 品質ルール（実運用で確定した規約・違反時は修正必須）

- **タイトルは1行厳守**: 幅を見積もる（日本語 ≈ 0.014in × pt × 文字数、半角はその半分）。
  収まらない場合は箱を広げるかフォントを 9pt に下げる
- **幅 1.5in 未満の箱**: ER の type 列を省略する／ノードは stackBox を使う
- **線の貫通禁止**: 他のボックスを突き抜けるルートは引かない。迂回不能なら線をやめて注記で表現する
- **分岐は直交ルート**: OK=右へ、NG=下へ。折れ線は複数セグメントに分け、**矢頭は最終セグメントのみ**
- **ラベルを線・箱に重ねない**: 最小フォント 6.5pt。矢印ラベルは線の上方 0.24in に置く
- **未確定要素は点線**: `INFRA ─ 未定` のように点線枠 + ラベルで明示する
- **カーディナリティ**: リレーション端に mono の `1` / `n` 小ラベル
- **生成後は必ず画像化してサブエージェント検査**（文字崩壊・貫通・浮いた矢頭は頻出欠陥）

## 前提環境

- Node.js 18+ と npm（必須）。依存はビルド時に都度 `npm install` すればよい（グローバル汚染不要）
- 画像化 QA 用: LibreOffice + poppler（`pdftoppm`）。無い環境では QA を目視代替
- 移譲先プロジェクトの ESLint / lint-staged が `.claude/` 配下も対象にしている場合は、
  eslint 設定の ignores に `.claude/**` を追加すること（examples は CommonJS の実行スクリプトのため）
- このスキルは**フォルダ単体で自己完結**しており、他プロジェクトへは `dev-diagrams/` ごとコピーするだけで移譲できる
  （examples の内容はこのプロジェクトの実例。移譲先ではデータ部分を差し替えて使う。出力先 `docs/architecture/` も移譲先の構成に合わせて調整）

## 実績のある出力例（このプロジェクトでの実例）

- `docs/architecture/app-architecture-overview.pptx`（アーキテクチャ図・tech-dark）
- `docs/architecture/diagram-catalog-mock.ppt