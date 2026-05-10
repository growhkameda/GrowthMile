---
description: >
  ユーザーから「指定された機能を実装して」「設計書をもとに実装を進めて」など、機能実装タスクを要求された際に使用するスキル。フロントエンドおよびバックエンドのレイヤードアーキテクチャに従い、実装から自己検証までを行う。
---

# 機能実装スキル

<instructions>
あなたは PreZen プロジェクトの実装担当エンジニア・エージェントです。
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

- `.cursor/rules/*.mdc` — コーディング規約やエラーハンドリングなど、プロジェクトのすべての詳細ルール

**モデル選定ガイド（AGENTS.md セクション6参照）:**

- **通常の機能実装**: 現行モデル（`claude-sonnet-4-6`）を継続使用
- **大規模リファクタリング・既存コードベースの大規模改修**: `claude-opus-4-6` へのエスカレーションを検討する（複雑な依存解析・高リスクな変更が伴う場合）
  </step>

### Step 2: 実装 (フロントエンド / バックエンド)

<step>
指定された仕様に基づいてコードを記述します。ルールを必ず守ってください。

**フロントエンド（React + TypeScript + TailwindCSS 4）**:

- `frontend/src/features/<機能名>/` 配下にコンポーネント・ストア・サービスを配置
- 共通コンポーネントは `frontend/src/components/`
- 型定義を必ず作成（`any` 禁止）

**バックエンド（Java 21 + Spring Boot 3）**:

- `Controller` → `Service` → `Repository` → `Entity` のレイヤー構成を厳守
- パッケージ: `com.prezen.{ controller, service, repository, ... }`
- SQLは必ずパラメータバインド（Repositoryの実装）を使用
- カスタムエラークラスを使用
  </step>

### Step 3: 自己検証

<step>
実装コードの記述が終わったら、Docker環境でビルドとテストを実行し、自分自身のコードが動くことを確認します。
実行時は必ずTTY無効オプション(`-T`)を使用し、CRLF問題を回避してください。
```bash
# フロントエンド
docker-compose exec -T frontend npm run build
docker-compose exec -T frontend npm run lint

# バックエンド

docker-compose exec -T backend sh -c "sed -i 's/\r$//' ./gradlew && chmod +x ./gradlew && ./gradlew clean build"
docker-compose exec -T backend sh -c "./gradlew test"

```
エラーが出た場合はエラーログを自己参照し、コードを修正するサイクルを回します。
</step>

### Step 4: ドキュメントの同期更新
<step>
実装した内容（APIのペイロード変更や新規エンドポイント、DB変更等）によって仕様が変わった・詳細化された場合は、以下のドキュメントを忘れずに更新してください。
- `docs/api/spec-api.md`
- `docs/design/spec-db.md`
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
- 新しいパッケージや依存関係（npm / gradle）を勝手に追加しないこと（必要な場合は提案する）。
- `.claude/settings.json` に設定されたdenyコマンドを決して使用しないこと。
- セキュリティルール（秘密情報のハードコード禁止）を徹底すること。
</restrictions>
```
