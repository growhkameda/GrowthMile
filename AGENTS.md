# AGENTS.md (AI Development Context)

このファイルは、Claude Code が「GROWTH MILE」プロジェクトの全体像を把握するための共通コンテキストファイルです。

## 1. プロジェクト基本原則

- **Project Name**: GROWTH MILE
- **技術スタック**: Next.js 16 (App Router) / TypeScript / Tailwind CSS v4 + Prisma / NextAuth.js (Auth.js v5) / PostgreSQL / Zod / Zustand (UI状態) / Prettier / Vitest + Testing Library / Playwright / GitHub Actions
- [INFO] **推測で実装せず、必ず以下のドキュメントを検索・参照すること**:
  - アーキテクチャ図録（ADR）: `docs/architecture/decisions/`
  - DBスキーマ・API仕様: `docs/api/` , `docs/design/` (※進行に応じて適宜整理されます)
  - セキュリティ・認証仕様: `docs/guides/security.md`

### ディレクトリ構造

Next.js モノリス構成。`frontend/` / `backend/` の分離はなく、すべて `src/` 配下に統合。

- `src/app/`: App Router（ページ・レイアウト・API Routes）
- `src/components/`: 共有 React コンポーネント
- `src/features/`: 機能別モジュール（UI + ロジックをまとめて配置）
- `src/lib/`: Prisma クライアント・NextAuth 設定・共通ユーティリティ
- `prisma/`: Prisma スキーマ定義・マイグレーション
- `public/`: 静的アセット
- `e2e/`: Playwright E2E テスト（npm workspace 外の独立パッケージ）
- `docs/`: 要件定義・基本設計・規約等のドキュメント群
- `scripts/`: エビデンス収集・ユーティリティスクリプト
- `.claude/`, `.github/`: エージェント・CI/CD 設定ファイル群

## 2. AI Agents Roles (役割分担)

このプロジェクトは **Claude Code（CLI）が唯一のAIエージェント** として全フェーズを担当します。

- **Claude Code**:
  - 要件定義・仕様書・設計書の作成（`.claude/workflows/requirement-review-loop.md` に従う）
  - UIデザインモックアップの作成（`.claude/workflows/design-mock.md` に従う）
  - `src/` 配下における機能実装（App Router ページ・API Routes・コンポーネント・lib）
  - パッケージのインストール、コマンドライン操作全般
  - ビルド・テストの実行検証、Git コミットの作成
  - Prisma マイグレーション実行

## 3. 絶対守るべき禁止事項（やらないことリスト）

- [NG] 新しいパッケージ・依存関係を勝手に追加しない（提案のみ）
- [NG] 既存のディレクトリ構造（`src/` 配下の構成）を無断で変更しない
- [NG] 指定された以外の UI フレームワークを導入しない
- [NG] データベースのテーブル追加・カラム変更を勝手に行わない
- [NG] テストデータに実在する個人情報を含めない
- [NG] 秘密情報（APIキー、パスワード）をハードコードしない（環境変数 `.env` を使用）

## 4. Development Workflow & Commands

開発は [`docs/ai/task-queue.md`](docs/ai/task-queue.md) や `.claude/workflows/` に定義されたフェーズと品質ゲートに従って進みます。ローカル起動前提とエージェント設定の棚卸しは [`docs/agentic/README.md`](docs/agentic/README.md) を参照すること。
コードを変更した際は、提供されているコマンドを用いて必ず自己検証を行うこと。

```bash
# アプリケーション起動
npm run dev

# テスト・ビルド・Lint・フォーマット
npm run test          # Vitest によるユニットテスト
npm run build         # Next.js プロダクションビルド
npm run lint          # ESLint
npm run format        # Prettier フォーマット（自動修正）
npm run format:check  # Prettier フォーマットチェック（CI 用）

# DB マイグレーション（ローカル）
npx prisma migrate dev
npx prisma generate

# ローカル DB 起動（Docker）
docker compose up -d db

# エビデンス収集・スクリプト（環境に応じたbashで実行）
bash scripts/collect-test-evidence.sh

# Markdownの自動整形（ドキュメント編集後は必ず実行してCIを通すこと）
npx markdownlint-cli "docs/**/*.md" --fix
```

## 5. Claude Code SubAgents & Skills

Claude Code は以下のSubAgentとスキルを呼び出すことができます。タスクに応じて積極的に活用してください。

### SubAgents（自動委任・コンテキスト分離）

SubAgentは独立したコンテキストウィンドウで動作し、メイン会話を汚さずにタスクを実行します。

| SubAgent         | 呼び出し場面                                                 | 特徴                                       | 推奨ティア     |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------ | -------------- |
| `code-reviewer`  | コミット前・PR前のコードレビュー、セキュリティ監査をするとき | 読み取り専用、プロジェクトメモリで学習蓄積 | `escalation`   |
| `build-verifier` | ビルド・テスト・Lintを一括検証するとき                       | 読み取り専用、バックグラウンド実行可能     | `default`      |

モデル選定の詳細は [`docs/agentic/model-policy.md`](docs/agentic/model-policy.md) を参照（**バージョン番号は固定しない**）。

### Skills（手順実行・メイン会話内）

| スキル              | 呼び出し場面                                                  |
| ------------------- | ------------------------------------------------------------- |
| `implement-feature` | 設計書をもとに機能実装するとき                                |
| `incident-response` | バグ調査・障害対応・タイムアウト/リトライ問題の診断をするとき |
| `rework-report`     | ビルド・テスト・CI・コードレビューで FAIL / NEEDS_HUMAN_REVIEW 時に Evidence Bundle を `docs/evidence/` に保存して報告するとき |

## 6. Model Selection Guidelines

**SSOT**: [`docs/agentic/model-policy.md`](docs/agentic/model-policy.md)

### 基本方針: ティア運用（バージョン固定しない）

| ティア | ファミリ | 用途 |
| --- | --- | --- |
| `default` | Sonnet **最新** | 実装・lint・ビルド・一般 QA |
| `escalation` | Opus **最新** | コードレビュー・セキュリティ・深いデバッグ |
| `fast` | Haiku **最新** | 探索・ファイル検索 |

**モデル ID のバージョン番号を AGENTS.md に直書きしない。** 詳細は [`docs/agentic/model-policy.md`](docs/agentic/model-policy.md)。

### タスク別推奨ティア

| タスク | ティア | 根拠（参考） |
| --- | --- | --- |
| 要件定義・仕様書・標準コーディング | `default` | コスト効率・速度 |
| フロントエンド設計・UI 実装 | `default` | 十分な精度 |
| ビルド・Lint・テスト | `default` | 定型パイプライン（`build-verifier`） |
| **コードレビュー・セキュリティ審査** | `escalation` | 深い推論・脆弱性検出 |
| **深いデバッグ・インシデント対応** | `escalation` | 根本原因分析 |
| **大規模リファクタリング** | `escalation` | 複雑な依存解析 |
| リポジトリ探索 | `fast` | 低コスト・高速 |

### エスカレーション判断フロー

```text
タスク受信
    ↓
複雑・微妙・高リスクか？
    ↓
NO → tier: default（または fast）
YES → tier: escalation
```

### ハイブリッド戦略（推奨）

- **80–90%** のタスク: `default`
- **10–20%**: 高リスク・低自信度のみ `escalation`
- ユーザーが特定バージョンを指定した場合のみモデル ID を固定する

### npm workspace の注意事項

- `src/` はルート `package.json` で管理 → `npm ci` はルートで実行すること
- `e2e/` は workspace 外の独立パッケージ → 固有の `package-lock.json` を git にコミットし、`cd e2e && npm ci` で個別にインストールする

## 7. Coding Standards & Git Rules

- 関数・変数は `camelCase`、コンポーネント・クラスは `PascalCase`
- すべてのエラーはカスタムエラークラスを使用してハンドリングする
- Server Components / Client Components の境界を意識し、`"use client"` は必要最小限にとどめる
- Prisma の型は自動生成を活用し、`any` 型の使用を禁止する
- API Routes / Server Actions への全入力は Zod でバリデーションすること
- イイネ・フォロー等の楽観的 UI 更新は `useOptimistic` を使用し、Zustand はサーバー状態管理に使わないこと
- コミット時は Husky の pre-commit フック（Prettier + lint-staged）と commit-msg フック（commitlint）が自動実行される
- GitHub で PR を出す際やコミット時には、設定されたテンプレートや `.github/workflows/ci.yml` の品質チェックをパスすること

### コメント規約（リーダブルコード準拠）

- **「なぜ（Why）」を書く**: コードから自明な「何（What）」はコメントしない
- **複雑なロジック・非自明な処理・背景・意図**には必ずコメントを付けること
- 冗長なコメント（コードを読めば分かること）は書かない
- コードを修正した際はコメントも同時に更新する（腐ったコメント禁止）
- **TypeScript/React**: エクスポートされる関数・コンポーネントには JSDoc (`/** */`) を記述。型定義だけでは伝わらない制約・意図はコメントで補足
