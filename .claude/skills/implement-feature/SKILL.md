---
description: >
  ユーザーから「指定された機能を実装して」「設計書をもとに実装を進めて」など、機能実装タスクを要求された際に使用するスキル。Next.js App Routerアーキテクチャに従い、実装から自己検証までを行う。
---

# 機能実装スキル

<instructions>
あなたは GrowthMile プロジェクトの実装担当エンジニア・エージェントです。
ユーザー指示または仕様書に記載されたタスクを、プロジェクトの厳密なコーディングルールに則って実装してください。
</instructions>

<steps>

### Step 1: コンテキストの読み込み

<step>
以下のファイルを読み込み、プロジェクトの状況とアーキテクチャを理解してください：

**必須参照（常に存在）:**

- `AGENTS.md` — プロジェクト概要・技術スタック・制約・禁止事項（主要ルールソース）
- 対象機能の仕様書（`docs/features/*.md`）
- `docs/api/spec-api.md` — API仕様書（新規エンドポイントが関連する場合）
- `docs/design/spec-db.md` — DB設計書（テーブル変更が関連する場合）

**詳細ルールファイル（存在する場合は優先参照）:**

- `.claude/rules/*.md` — コーディング規約・UIルール・CI/CDルールなど

**モデル選定ガイド（AGENTS.md セクション6参照）:**

- **通常の機能実装**: 現行モデル（`claude-sonnet-4-6`）を継続使用
- **大規模リファクタリング・既存コードベースの大規模改修**: `claude-opus-4-6` へのエスカレーションを検討する
</step>

### Step 2: 実装（Next.js App Router）

<step>
指定された仕様に基づいてコードを記述します。ルールを必ず守ってください。

**ページ・レイアウト（App Router）:**

- `src/app/<路由>/page.tsx` にページコンポーネントを配置
- `src/app/<路由>/layout.tsx` にレイアウトを配置
- Server Components をデフォルトとし、`"use client"` は必要最小限

**API Routes:**

- `src/app/api/<リソース名>/route.ts` として実装
- 全入力を Zod でバリデーション
- `NextResponse.json<ApiResponse<T>>()` で型付きレスポンスを返す

**コンポーネント:**

- 共有コンポーネント: `src/components/`
- 機能別コンポーネント: `src/features/<機能名>/`

**DB アクセス:**

- `src/lib/db.ts` 経由で Prisma クライアントを使用（シングルトン）
- Prisma 生成型を使用し、`any` 禁止

**その他のルール:**

- カスタムエラークラスを使用
- 環境変数は `src/env.ts` の Zod スキーマ経由でアクセス
- 楽観的 UI 更新は `useOptimistic` を使用
</step>

### Step 3: 自己検証

<step>
実装コードの記述が終わったら、以下を順番に実行し、自分自身のコードが動くことを確認します。

```bash
npm run lint
npm run format:check
npm run build
npm run test
```

エラーが出た場合はエラーログを自己参照し、コードを修正するサイクルを回します。
全てパスするまでこのステップを繰り返します。
</step>

### Step 4: ドキュメントの同期更新

<step>
実装した内容（APIのペイロード変更や新規エンドポイント、DB変更等）によって仕様が変わった・詳細化された場合は、以下のドキュメントを忘れずに更新してください。

- `docs/api/spec-api.md`
- `docs/design/spec-db.md`

Markdownを更新した場合は Lint を実行してCIエラーを防ぐこと：

```bash
npx markdownlint-cli "docs/**/*.md" --fix
```

</step>

### Step 5: コードレビュー（code-reviewer SubAgent 自動実行）

<step>
自己検証が全てパスしたら、`code-reviewer` サブエージェントを呼び出してコードレビューを実施します。
このステップは自動的に実行されます（ユーザーの指示を待たない）。

**レビュー結果の判定に応じて分岐:**

- **PASS / PASS_WITH_NOTES**: Step 6（完了報告）へ進む
- **FAIL**: 指摘事項を修正し、Step 3（自己検証）からやり直す
- **NEEDS_HUMAN_REVIEW**: 破壊的変更をユーザーに報告し、判断を仰ぐ
</step>

### Step 6: ユーザーへの完了報告

<step>
実装した内容のサマリー、自己検証で実行したテストの結果、コードレビューの結果、および更新したドキュメントの一覧をターミナルでユーザーに報告します。
コミットするかどうかはユーザーの判断を仰ぎます。
</step>

</steps>

<restrictions>
- ユーザーに共有せず、既存の外部連携インターフェースやデータベーススキーマの**破壊的変更**を行わないこと。
- 新しいパッケージや依存関係（npm）を勝手に追加しないこと（必要な場合は提案する）。
- `.claude/settings.json` に設定されたdenyコマンドを決して使用しないこと。
- セキュリティルール（秘密情報のハードコード禁止）を徹底すること。
</restrictions>
